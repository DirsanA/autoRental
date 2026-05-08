import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { p2PAdminService } from "../services/p2p.admin.service.js";
import { requireRequestUser } from "../utils/requestContext.js";
import type { AdminP2PDecisionInput } from "../validators/p2p.admin.validator.js";
import { v2 as cloudinary } from "cloudinary";
import { ENV } from "../config/env.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
  api_key: ENV.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_API_SECRET,
});

/**
 * Creates P2P admin route handlers.
 */
export function createP2PAdminController() {
  return {
    /**
     * GET /api/admin/p2p
     * Lists P2P host applicants for admin review.
     */
    listHosts: asyncHandler(async (req: Request, res: Response) => {
      const data = await p2PAdminService.listHosts({
        status: req.query.status as any,
        search: req.query.search as string,
        page: req.query.page as any,
        limit: req.query.limit as any,
      });

      res.json({
        success: true,
        data,
      });
    }),

    /**
     * GET /api/admin/p2p/:hostId
     * Gets detailed information about a P2P host applicant.
     */
    getHostDetail: asyncHandler(async (req: Request, res: Response) => {
      const hostId = Array.isArray(req.params.hostId)
        ? req.params.hostId[0]
        : req.params.hostId;
      if (!hostId) {
        throw new Error("Host ID is required");
      }
      const data = await p2PAdminService.getHostDetail(hostId);

      res.json({
        success: true,
        data,
      });
    }),

    /**
     * POST /api/admin/p2p/:hostId/decision
     * Approves or rejects a peer-host application.
     */
    reviewHost: asyncHandler(async (req: Request, res: Response) => {
      const hostId = Array.isArray(req.params.hostId)
        ? req.params.hostId[0]
        : req.params.hostId;
      if (!hostId) {
        throw new Error("Host ID is required");
      }
      const data = await p2PAdminService.reviewHostApplication(
        requireRequestUser(req),
        hostId,
        req.body as AdminP2PDecisionInput,
      );

      res.json({
        success: true,
        data,
      });
    }),

    /**
     * GET /api/admin/p2p/vehicles/:vehicleId
     * Gets detailed information about a specific vehicle for admin review.
     */
    getVehicleDetail: asyncHandler(async (req: Request, res: Response) => {
      const vehicleId = Array.isArray(req.params.vehicleId)
        ? req.params.vehicleId[0]
        : req.params.vehicleId;
      if (!vehicleId) {
        throw new Error("Vehicle ID is required");
      }
      const data = await p2PAdminService.getVehicleDetail(vehicleId);

      res.json({
        success: true,
        data,
      });
    }),

    /**
     * POST /api/admin/p2p/vehicles/:vehicleId/decision
     * Approves or rejects a specific vehicle.
     */
    reviewVehicle: asyncHandler(async (req: Request, res: Response) => {
      const vehicleId = Array.isArray(req.params.vehicleId)
        ? req.params.vehicleId[0]
        : req.params.vehicleId;
      if (!vehicleId) {
        throw new Error("Vehicle ID is required");
      }
      const data = await p2PAdminService.reviewVehicle(
        requireRequestUser(req),
        vehicleId,
        req.body,
      );

      res.json({
        success: true,
        data,
      });
    }),

    /**
     * GET /api/admin/p2p/proxy-file
     * Proxies a file to avoid CORS issues and force correct content headers.
     */
    proxyFile: asyncHandler(async (req: Request, res: Response) => {
      const url = req.query.url as string;
      const download = req.query.download === "true";
      const filename = (req.query.filename as string) || "file";

      if (!url) {
        throw new Error("URL is required");
      }

      let fetchUrl = url;

      // If it's a cloudinary URL, we generate a signed URL to bypass "Unauthorized" errors for private assets
      if (url.includes("cloudinary.com")) {
        try {
          const parts = url.split("/upload/");
          if (parts.length > 1) {
            const pathParts = parts[1].split("/");
            // Remove version if present (v12345678)
            if (pathParts[0].startsWith("v") && /^\d+$/.test(pathParts[0].substring(1))) {
              pathParts.shift();
            }
            // Join back and remove extension
            const fullPath = pathParts.join("/");
            const dotIndex = fullPath.lastIndexOf(".");
            const publicId = dotIndex > -1 ? fullPath.substring(0, dotIndex) : fullPath;
            const extension = dotIndex > -1 ? fullPath.substring(dotIndex + 1) : "pdf";
            
            // Generate signed URL
            fetchUrl = cloudinary.utils.private_download_url(publicId, extension, {
              resource_type: "image", // PDFs are usually in the image category in Cloudinary
              type: "upload",
              attachment: download,
            });
          }
        } catch (err) {
          console.error("Error signing Cloudinary URL:", err);
          // Fallback to original URL
        }
      }

      const response = await fetch(fetchUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText} (${response.status})`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType) {
        res.setHeader("Content-Type", contentType);
      }

      if (download) {
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"`,
        );
      } else {
        res.setHeader("Content-Disposition", "inline");
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      res.send(buffer);
    }),
  };
}
