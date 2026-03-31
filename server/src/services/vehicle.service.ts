import mongoose from "mongoose";
import { Vehicle, type VehicleDocument } from "../models/Vehicle.js";
import type {
  CreateVehicleInput,
  UpdateVehicleStatusInput,
} from "../validators/vehicle.validator.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";

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

function isHttpUrl(value: string) {
  return /^https?:\/\//.test(value);
}

async function resolveUploadValue(
  value: string,
  folder: string,
  fieldName: string,
) {
  if (isHttpUrl(value)) return value;

  if (value.startsWith("data:")) {
    return uploadToCloudinary(value, `${folder}/${fieldName}`);
  }

  throw ApiError.badRequest(`${fieldName} must be a valid data URL or http(s) URL`);
}

export class VehicleService {
  async list(filter?: "available" | "rented" | "maintenance") {
    const query: { status?: "AVAILABLE" | "BOOKED" | "MAINTENANCE" } = {};

    if (filter === "available") query.status = "AVAILABLE";
    if (filter === "rented") query.status = "BOOKED";
    if (filter === "maintenance") query.status = "MAINTENANCE";

    return Vehicle.find(query).sort({ createdAt: -1 });
  }

  async getById(id: string) {
    return Vehicle.findById(id);
  }

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

  async create(data: CreateVehicleInput): Promise<VehicleDocument> {
    const ownerId = data.ownerId
      ? new mongoose.Types.ObjectId(data.ownerId)
      : new mongoose.Types.ObjectId();

    const ownerType = data.ownerType ?? "User";
    const folder = `auto-rental/vehicles/${data.plate.replace(/\s+/g, "-").toLowerCase()}`;

    const [front, back, side, interior] = await Promise.all([
      resolveUploadValue(data.photos.front, folder, "front"),
      resolveUploadValue(data.photos.back, folder, "back"),
      resolveUploadValue(data.photos.side, folder, "side"),
      resolveUploadValue(data.photos.interior, folder, "interior"),
    ]);

    const documents = data.documents
      ? {
          ownership: await resolveUploadValue(
            data.documents.ownership,
            folder,
            "ownership",
          ),
          insurance: await resolveUploadValue(
            data.documents.insurance,
            folder,
            "insurance",
          ),
        }
      : undefined;

    const initialStatus =
      ownerType === "Company" && data.status ? data.status : "PENDING_APPROVAL";

    const vehicle = await Vehicle.create({
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

      photos: {
        front,
        back,
        side,
        interior,
        gallery: [front, back, side, interior],
      },
      documents,
      status: initialStatus,
    });

    return vehicle;
  }
}

export const vehicleService = new VehicleService();
