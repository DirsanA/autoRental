import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { vehicleService } from "../services/vehicle.service.js";

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
