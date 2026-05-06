import mongoose from "mongoose";
import {
  Vehicle,
  type VehicleDocument,
  type VehicleStatus,
} from "../models/Vehicle.js";
import { Booking } from "../models/Booking.js";
import { AccountType, VerificationLevel, User } from "../models/User.js";
import { Company } from "../models/Company.js";
import type {
  CreateVehicleInput,
  UpdateVehicleInput,
  UpdateVehicleStatusInput,
} from "../validators/vehicle.validator.js";
import { uploadToCloudinary, resolveUploadValue } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { companyService } from "./company.service.js";
import { userPersistenceService } from "./user.persistence.service.js";
import type { RequestUser } from "../utils/requestContext.js";
import { geocodingService } from "./geocoding.service.js";

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


export class VehicleService {
  /**
   * Returns blocked date ranges for a vehicle using the vehicle record and
   * overlapping active bookings.
   */
  async getAvailability(vehicleId: string, range?: { start?: Date; end?: Date }) {
    const vehicle = await Vehicle.findById(vehicleId).select("_id").lean();
    if (!vehicle) {
      throw ApiError.notFound("Vehicle not found");
    }

    const start = range?.start ?? new Date();
    const end =
      range?.end ??
      new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000);

    const bookingBlocks = await Booking.find({
      vehicleId,
      status: { $in: ["PENDING", "CONFIRMED", "ACTIVE"] },
      "payment.status": { $in: ["PENDING", "PAID"] },
      startTime: { $lt: end },
      endTime: { $gt: start },
    })
      .select("startTime endTime status bookingId")
      .sort({ startTime: 1 })
      .lean();

    return bookingBlocks
      .map((booking) => ({
        id: booking._id?.toString?.() ?? String(booking._id),
        startDate: booking.startTime,
        endDate: booking.endTime,
        reason: "BOOKING" as const,
        source: "SYSTEM" as const,
        bookingId: booking.bookingId ?? null,
        notes:
          booking.status === "PENDING"
            ? "Booking payment hold"
            : "Confirmed booking",
      }))
      .sort(
        (left, right) =>
          new Date(left.startDate).getTime() -
          new Date(right.startDate).getTime(),
      );
  }

  /**
   * Lists vehicles with an optional API shorthand filter.
   * Standard lean query, no owner enrichment.
   */
  async list(filter?: "available" | "rented" | "maintenance", ownerId?: string) {
    const query: any = filter ? { status: VEHICLE_FILTER_STATUS[filter] } : {};
    if (ownerId) {
      query.ownerId = ownerId;
    }
    return Vehicle.find(query)
      .select("make model year plate price status ownerId ownerType createdAt")
      .sort({ createdAt: -1 });
  }

  /**
   * Lists vehicles for the public marketplace, enriched with owner summaries.
   */
  async listPublic(filter?: "available" | "rented" | "maintenance") {
    const query = filter ? { status: VEHICLE_FILTER_STATUS[filter] } : {};
    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 }).lean();

    if (vehicles.length === 0) return [];

    return this.enrichWithOwners(vehicles);
  }

  /**
   * Returns a public vehicle by id, enriched with owner summary.
   */
  async getPublicById(id: string) {
    const vehicle = await Vehicle.findById(id).lean();
    if (!vehicle) return null;

    const [enriched] = await this.enrichWithOwners([vehicle]);
    return enriched;
  }

  /**
   * Batches owner lookups and attaches summaries to vehicle objects.
   */
  private async enrichWithOwners(vehicles: any[]) {
    // Group ownerIds by type for batched fetching
    const userOwnerIds = new Set<string>();
    const companyOwnerIds = new Set<string>();

    for (const v of vehicles) {
      if (v.ownerType === "User") {
        userOwnerIds.add(v.ownerId.toString());
      } else if (v.ownerType === "Company") {
        companyOwnerIds.add(v.ownerId.toString());
      }
    }

    // Fetch User owners
    const userOwnersMap = new Map<string, any>();
    if (userOwnerIds.size > 0) {
      const users = await User.find({
        _id: { $in: Array.from(userOwnerIds) },
      })
        .select("firstName lastName name image")
        .lean();

      for (const u of users) {
        userOwnersMap.set(u._id.toString(), {
          id: u._id.toString(),
          name:
            u.name ||
            `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
            "Peer Host",
          image: u.image,
          type: "peerhost",
        });
      }
    }

    // Fetch Company owners
    const companyOwnersMap = new Map<string, any>();
    const companyLocationsMap = new Map<
      string,
      { lat: number; lng: number; address?: string | null }
    >();
    if (companyOwnerIds.size > 0) {
      const companies = await Company.find({
        _id: { $in: Array.from(companyOwnerIds) },
      })
        .select("name logoUrl contactInfo.address location")
        .lean();

      for (const c of companies) {
        companyOwnersMap.set(c._id.toString(), {
          id: c._id.toString(),
          name: c.name || "Rental Company",
          image: c.logoUrl,
          type: "company",
        });

        const coords = Array.isArray(c.location?.coordinates)
          ? c.location.coordinates
          : null;
        const lng =
          typeof coords?.[0] === "number" ? (coords?.[0] as number) : null;
        const lat =
          typeof coords?.[1] === "number" ? (coords?.[1] as number) : null;

        if (typeof lat === "number" && typeof lng === "number") {
          companyLocationsMap.set(c._id.toString(), {
            lat,
            lng,
            address: c.contactInfo?.address ?? null,
          });
        } else if (c.contactInfo?.address) {
          const derived = await geocodingService.geocode(c.contactInfo.address);
          if (derived) {
            companyLocationsMap.set(c._id.toString(), {
              ...derived,
              address: c.contactInfo.address,
            });
          }
        }
      }
    }

    // Attach owner summaries back to lean vehicle objects
    return vehicles.map((v) => {
      const ownerIdStr = v.ownerId.toString();
      const ownerSummary =
        v.ownerType === "User"
          ? userOwnersMap.get(ownerIdStr) || {
              name: "Peer Host",
              type: "peerhost",
            }
          : companyOwnersMap.get(ownerIdStr) || {
              name: "Rental Company",
              type: "company",
            };

      return {
        ...v,
        id: v._id?.toString() || v.id,
        owner: ownerSummary,
        companyLocation:
          v.ownerType === "Company"
            ? companyLocationsMap.get(ownerIdStr) || undefined
            : undefined,
      };
    });
  }

  /**
   * Lists vehicles belonging to the authenticated requester.
   */
  async listMine(
    caller: RequestUser,
    filter?: "available" | "rented" | "maintenance",
    requestedOwnerType?: "User" | "Company",
  ) {
    const owner = await this.resolveVehicleOwner(caller, requestedOwnerType);

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

    // If peerhost updates pickup/return addresses, attempt to refresh geocodes.
    if (typeof updateData.pickupAddress === "string" || typeof updateData.returnAddress === "string") {
      const current = await Vehicle.findById(id).select("ownerType pickupAddress returnAddress").lean();
      if (current?.ownerType === "User") {
        const pickupAddress =
          typeof updateData.pickupAddress === "string"
            ? updateData.pickupAddress
            : current.pickupAddress;
        const returnAddress =
          typeof updateData.returnAddress === "string"
            ? updateData.returnAddress
            : current.returnAddress;

        if (pickupAddress?.trim()) {
          const coords = await geocodingService.geocode(pickupAddress);
          if (coords) {
            (updateData as any).pickupGeo = { ...coords, precision: "exact" as const };
            (updateData as any).geoUpdatedAt = new Date();
          }
        }

        if (returnAddress?.trim()) {
          const coords = await geocodingService.geocode(returnAddress);
          if (coords) {
            (updateData as any).returnGeo = { ...coords, precision: "exact" as const };
            (updateData as any).geoUpdatedAt = new Date();
          }
        }
      }
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
    ownerType: "User" | "Company",
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
    if (ownerType !== "Company" && !documents) {
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
        documents?.ownership
          ? resolveUploadValue(documents.ownership, folder, "ownership")
          : Promise.resolve(undefined),
        documents?.insurance
          ? resolveUploadValue(documents.insurance, folder, "insurance")
          : Promise.resolve(undefined),
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
        ...(ownership ? { ownership } : {}),
        ...(insurance ? { insurance } : {}),
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
    const authUserId =
      typeof caller.authUserId === "string" ? caller.authUserId : caller.id;

    if (
      requestedOwnerType === "Company" ||
      caller.accountType === AccountType.COMPANY
    ) {
      const company = await companyService.getByAuthUserId(authUserId);
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

    const user = await userPersistenceService.findByAuthId(authUserId);
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
    const assets = await this.uploadVehicleAssets(data, folder, ownerType);
    const initialStatus =
      ownerType === "Company"
        ? data.status && data.status !== "PENDING_APPROVAL"
          ? data.status
          : "AVAILABLE"
        : "PENDING_APPROVAL";

    const pickupAddress = data.pickupAddress?.trim();
    const returnAddress = data.returnAddress?.trim();
    const geoUpdatedAt = new Date();
    const pickupGeo =
      ownerType === "User" && pickupAddress
        ? await geocodingService.geocode(pickupAddress)
        : null;
    const returnGeo =
      ownerType === "User" && returnAddress
        ? await geocodingService.geocode(returnAddress)
        : null;

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
      pickupAddress: pickupAddress || undefined,
      returnAddress: returnAddress || undefined,
      pickupGeo: pickupGeo ? { ...pickupGeo, precision: "exact" } : undefined,
      returnGeo: returnGeo ? { ...returnGeo, precision: "exact" } : undefined,
      geoUpdatedAt:
        pickupGeo || returnGeo ? geoUpdatedAt : undefined,
      photos: assets.photos,
      documents: assets.documents,
      status: initialStatus,
    });
  }
}

export const vehicleService = new VehicleService();
