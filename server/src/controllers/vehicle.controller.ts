import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { vehicleService } from "../services/vehicle.service.js";
import type { UpdateVehicleStatusInput } from "../validators/vehicle.validator.js";
import { ApiError } from "../utils/ApiError.js";
import { getRequestUser } from "../utils/requestContext.js";
import { Review } from "../models/Review.js";

/**
 * Parses the supported vehicle list filter from the request query.
 */
function getVehicleFilter(query: Request["query"]) {
  const filter = query.filter;

  return typeof filter === "string" &&
    ["available", "rented", "maintenance"].includes(filter)
    ? (filter as "available" | "rented" | "maintenance")
    : undefined;
}

function getRequestedOwnerType(query: Request["query"]) {
  const ownerType = query.ownerType;

  return ownerType === "Company" || ownerType === "User"
    ? ownerType
    : undefined;
}

export const vehicleController = {
  /**
   * Lists vehicles with an optional status shortcut filter.
   * Standard endpoint - no owner enrichment.
   */
  list: asyncHandler(async (req: Request, res: Response) => {
    const ownerId = req.query.ownerId as string | undefined;
    const vehicles = await vehicleService.list(getVehicleFilter(req.query), ownerId);

    res.json({
      success: true,
      data: { vehicles },
    });
  }),

  /**
   * Lists vehicles for the public marketplace with enriched owner data.
   */
  listMarketplace: asyncHandler(async (req: Request, res: Response) => {
    const vehicles = await vehicleService.listPublic(getVehicleFilter(req.query));

    res.json({
      success: true,
      data: { vehicles },
    });
  }),
  
listInspired: asyncHandler(async (req: Request, res: Response) => {
  const query = req.query.query as string | undefined;

  const data = await vehicleService.listInspired({
    query,
  });

  res.json({
    success: true,
    data,
  });
}),
  /**
   * Lists vehicles owned by the current authenticated user or company.
   */
  listMine: asyncHandler(async (req: Request, res: Response) => {
    const user = getRequestUser(req);
    if (!user) {
      throw ApiError.unauthorized();
    }
    const vehicles = await vehicleService.listMine(
      user,
      getVehicleFilter(req.query),
      getRequestedOwnerType(req.query),
    );

    res.json({
      success: true,
      data: { vehicles },
    });
  }),

  /**
   * Returns a single vehicle by id.
   * Standard endpoint - no owner enrichment.
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    const vehicle = await vehicleService.getById(req.params.id as string);

    if (!vehicle) {
      throw ApiError.notFound("Vehicle not found");
    }

    res.json({
      success: true,
      data: { vehicle },
    });
  }),

  /**
   * Returns a single vehicle for marketplace with enriched owner data.
   */
  getMarketplaceById: asyncHandler(async (req: Request, res: Response) => {
    const vehicle = await vehicleService.getPublicById(req.params.id as string);

    if (!vehicle) {
      throw ApiError.notFound("Vehicle not found");
    }

    res.json({
      success: true,
      data: { vehicle },
    });
  }),

  /**
   * Returns blocked availability ranges for a single vehicle.
   */
  getAvailability: asyncHandler(async (req: Request, res: Response) => {
    const availability = await vehicleService.getAvailability(
      req.params.id as string,
    );

    res.json({
      success: true,
      data: { availability },
    });
  }),

  /**
   * Updates the lifecycle status of a vehicle.
   */
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

  /**
   * Creates a vehicle and uploads its media assets when needed.
   */
  create: asyncHandler(async (req: Request, res: Response) => {
    const user = getRequestUser(req);
    if (!user) {
      throw ApiError.unauthorized();
    }
    const vehicle = await vehicleService.create(user, req.body);

    res.status(201).json({
      success: true,
      data: {
        vehicle,
        message: "Vehicle submitted successfully and is under review.",
      },
    });
  }),
  // update
  update: asyncHandler(async (req: Request, res: Response) => {
    const vehicle = await vehicleService.update(
      req.params.id as string,
      req.body,
    );

    res.json({
      success: true,
      data: {
        vehicle,
        message: "Vehicle updated successfully.",
      },
    });
  }),
  //remove
  remove: asyncHandler(async (req: Request, res: Response) => {
    await vehicleService.remove(req.params.id as string);

    res.json({
      success: true,
      data: {
        message: "Vehicle removed successfully.",
      },
    });
  }),
  
  getReviews: asyncHandler(async (req: Request, res: Response) => {
  const vehicleId = req.params.id;

  const reviews = await Review.find({
    targetId: vehicleId,
    targetType: "Vehicle",
  })
    .populate("reviewerId", "name image")
    .sort({ createdAt: -1 })
    .lean();

  const count = reviews.length;

  const avg =
    count > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / count
      : 0;

  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  reviews.forEach((r) => {
    breakdown[r.rating as 1 | 2 | 3 | 4 | 5]++;
  });

  res.json({
    success: true,
    data: {
      reviews: reviews.map((r) => ({
        id: r._id,
        name: r.reviewerId?.name || "User",
        image: r.reviewerId?.image || null,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      })),
      ratingStats: {
        avg,
        count,
        breakdown,
      },
    },
  });
}),
};
