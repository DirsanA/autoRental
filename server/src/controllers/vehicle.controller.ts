import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { vehicleService } from "../services/vehicle.service.js";

export const vehicleController = {
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
