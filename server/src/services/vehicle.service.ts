import mongoose from "mongoose";
import {
  Vehicle,
  type VehicleDocument,
  type VehicleStatus,
} from "../models/Vehicle.js";
import { AccountType, VerificationLevel } from "../models/User.js";
import type {
  CreateVehicleInput,
  UpdateVehicleInput,
  UpdateVehicleStatusInput,
} from "../validators/vehicle.validator.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { companyService } from "./company.service.js";
import { userPersistenceService } from "./user.persistence.service.js";
import type { RequestUser } from "../utils/requestContext.js";

const VEHICLE_FILTER_STATUS: Record<
  "available" | "rented" | "maintenance",
  VehicleStatus
> = {
  available: "AVAILABLE",
  rented: "BOOKED",
  maintenance: "MAINTENANCE",
};

/**
 * Deduplicates and trims vehicle feature labels.
 */
function normalizeFeatures(features: string[]) {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const feature of features) {
    const trimmed = feature.trim();
    if (!trimmed) continue;

    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    normalized.push(trimmed);
  }

  return normalized;
}

/**
 * Checks whether a string is already a hosted http(s) URL.
 */
function isHttpUrl(value: string) {
  return /^https?:\/\//.test(value);
}

/**
 * Normalizes upload input into a persisted asset URL.
 */
async function resolveUploadValue(
  value: string,
  folder: string,
  fieldName: string,
) {
  if (isHttpUrl(value)) return value;

  if (value.startsWith("data:")) {
    return uploadToCloudinary(value, `${folder}/${fieldName}`);
  }

  throw ApiError.badRequest(
    `${fieldName} must be a valid data URL or http(s) URL`,
  );
}

export class VehicleService {
  /**
   * Lists vehicles with an optional API shorthand filter.
   */
  async list(filter?: "available" | "rented" | "maintenance") {
    const query = filter ? { status: VEHICLE_FILTER_STATUS[filter] } : {};
    return Vehicle.find(query).sort({ createdAt: -1 });
  }

  /**
   * Lists vehicles belonging to the authenticated requester.
   */
  async listMine(
    caller: RequestUser,
    filter?: "available" | "rented" | "maintenance",
  ) {
    const owner = await this.resolveVehicleOwner(caller);

    return Vehicle.find({
      ownerId: owner.ownerId,
      ownerType: owner.ownerType,
      ...(filter ? { status: VEHICLE_FILTER_STATUS[filter] } : {}),
    }).sort({ createdAt: -1 });
  }

  /**
   * Returns a vehicle by id.
   */
  async getById(id: string) {
    return Vehicle.findById(id);
  }

  /**
   * Updates the lifecycle status of a vehicle.
   */
  async updateStatus(
    id: string,
    status: UpdateVehicleStatusInput["status"],
  ): Promise<VehicleDocument> {
    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    );

    if (!vehicle) {
      throw ApiError.notFound("Vehicle not found");
    }

    return vehicle;
  }

  async update(id: string, data: UpdateVehicleInput): Promise<VehicleDocument> {
    const updateData: UpdateVehicleInput = { ...data };
    if (Array.isArray(updateData.features)) {
      updateData.features = normalizeFeatures(updateData.features);
    }

    const vehicle = await Vehicle.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!vehicle) {
      throw ApiError.notFound("Vehicle not found");
    }

    return vehicle;
  }

  async remove(id: string): Promise<void> {
    const deleted = await Vehicle.findByIdAndDelete(id);
    if (!deleted) {
      throw ApiError.notFound("Vehicle not found");
    }
  }

  /**
   * Resolves the Cloudinary folder used by a vehicle submission.
   */
  private buildVehicleFolder(plate: string): string {
    return `auto-rental/vehicles/${plate.replace(/\s+/g, "-").toLowerCase()}`;
  }

  /**
   * Uploads vehicle photos and documents when the client sends data URLs.
   */
  private async uploadVehicleAssets(
    data: CreateVehicleInput,
    folder: string,
  ): Promise<{
    photos: {
      front: string;
      back: string;
      side: string;
      interior: string;
      gallery: string[];
    };
    documents: {
      ownership?: string;
      insurance?: string;
    };
  }> {
    const documents = data.documents;
    if (!documents) {
      throw ApiError.badRequest(
        "Ownership and insurance documents are required",
      );
    }

    const [front, back, side, interior, ownership, insurance] =
      await Promise.all([
        resolveUploadValue(data.photos.front, folder, "front"),
        resolveUploadValue(data.photos.back, folder, "back"),
        resolveUploadValue(data.photos.side, folder, "side"),
        resolveUploadValue(data.photos.interior, folder, "interior"),
        resolveUploadValue(documents.ownership, folder, "ownership"),
        resolveUploadValue(documents.insurance, folder, "insurance"),
      ]);

    return {
      photos: {
        front,
        back,
        side,
        interior,
        gallery: [front, back, side, interior],
      },
      documents: {
        ownership,
        insurance,
      },
    };
  }

  /**
   * Resolves the persisted owner record for a user or company uploader.
   */
  private async resolveVehicleOwner(
    caller: RequestUser,
    requestedOwnerType?: "User" | "Company",
  ): Promise<{
    ownerId: mongoose.Types.ObjectId;
    ownerType: "User" | "Company";
  }> {
    if (
      requestedOwnerType === "Company" ||
      caller.accountType === AccountType.COMPANY
    ) {
      const company = await companyService.getByAuthUserId(caller.id);
      if (!company) {
        throw ApiError.notFound("You don't have a registered company");
      }

      if (company.status !== "ACTIVE") {
        throw ApiError.unprocessable(
          "Your company must be approved before managing fleet vehicles",
        );
      }

      return {
        ownerId: company._id,
        ownerType: "Company",
      };
    }

    if (caller.accountType !== AccountType.USER) {
      throw ApiError.forbidden("This account cannot upload vehicles");
    }

    const user = await userPersistenceService.findByAuthId(caller.id);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    if (
      ![
        VerificationLevel.ID_VERIFIED,
        VerificationLevel.LICENSE_VERIFIED,
        VerificationLevel.PEER_HOST,
      ].includes(user.verificationLevel)
    ) {
      throw ApiError.unprocessable(
        "You must complete ID or license verification before uploading a vehicle",
      );
    }

    return {
      ownerId: user._id,
      ownerType: "User",
    };
  }

  /**
   * Creates a vehicle record after resolving uploads and derived fields.
   */
  async create(
    caller: RequestUser,
    data: CreateVehicleInput,
  ): Promise<VehicleDocument> {
    const { ownerId, ownerType } = await this.resolveVehicleOwner(
      caller,
      data.ownerType,
    );
    const folder = this.buildVehicleFolder(data.plate);
    const assets = await this.uploadVehicleAssets(data, folder);

    return Vehicle.create({
      ownerId,
      ownerType,
      make: data.make,
      model: data.model,
      year: data.year,
      vin: data.vin,
      plate: data.plate,
      mileage: data.mileage,
      fuel: data.fuel,
      transmission: data.transmission,
      seats: data.seats,
      features: normalizeFeatures(data.features),
      condition: data.condition,
      price: data.price,
      weeklyDiscount: data.weeklyDiscount,
      monthlyDiscount: data.monthlyDiscount,
      availability: data.availability,
      delivery: data.delivery,
      photos: assets.photos,
      documents: assets.documents,
      status: "PENDING_APPROVAL",
    });
  }
}

export const vehicleService = new VehicleService();
