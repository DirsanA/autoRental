import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { vehicleService } from "../services/vehicle.service.js";
import type {
  UpdateVehicleInput,
  UpdateVehicleStatusInput,
} from "../validators/vehicle.validator.js";

export const vehicleController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const filterRaw = req.query.filter;
    const filter =
      typeof filterRaw === "string" &&
      ["available", "rented", "maintenance"].includes(filterRaw)
        ? (filterRaw as "available" | "rented" | "maintenance")
        : undefined;

    const vehicles = await vehicleService.list(filter);

    res.json({
      success: true,
      data: { vehicles },
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const vehicle = await vehicleService.getById(req.params.id as string);

    if (!vehicle) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Vehicle not found",
        },
      });
      return;
    }

    res.json({
      success: true,
      data: { vehicle },
    });
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body as UpdateVehicleStatusInput;
    const vehicle = await vehicleService.updateStatus(
      req.params.id as string,
      status,
    );

    res.json({
      success: true,
      data: {
        vehicle,
        message: "Vehicle status updated successfully.",
      },
    });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const vehicle = await vehicleService.update(
      req.params.id as string,
      req.body as UpdateVehicleInput,
    );

    res.json({
      success: true,
      data: {
        vehicle,
        message: "Vehicle updated successfully.",
      },
    });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await vehicleService.remove(req.params.id as string);

    res.json({
      success: true,
      data: {
        message: "Vehicle removed successfully.",
      },
    });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const vehicle = await vehicleService.create(req.body);

    res.status(201).json({
      success: true,
      data: {
        vehicle,
        message: "Vehicle submitted successfully and is under review.",
      },
    });
  }),
};
