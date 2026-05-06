import { Router } from "express";
import { z } from "zod";
import * as controller from "../controllers/report.controller.js";
import { createAuthMiddleware } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { createAuth } from "../config/auth.js";
import { REPORT_TYPES, REPORT_STATUSES, REPORT_PRIORITIES } from "../models/Report.js";

const reportSchema = z.object({
  type: z.enum(REPORT_TYPES),
  subjectId: z.string().optional(),
  subjectModel: z.enum(["User", "Vehicle", "Company", "Booking"]).optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  evidenceUrls: z.array(z.string()).default([]),
  priority: z.enum(REPORT_PRIORITIES).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const adminActionSchema = z.object({
  status: z.enum(REPORT_STATUSES),
  resolutionNotes: z.string().optional(),
  actionTaken: z.string().optional(),
});

const internalNoteSchema = z.object({
  content: z.string().min(1, "Content is required"),
});

export function createReportRoutes(auth: ReturnType<typeof createAuth>): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(auth);

  router.use(authenticate);

  // User routes
  router.post("/", validate({ body: reportSchema }), controller.createReport);
  router.get("/my", controller.getMyReports);

  // Admin routes (Ideally protected with an authorize("admin") middleware)
  router.get("/admin", controller.adminListReports);
  router.get("/admin/:id", controller.getReportDetail);
  router.patch("/admin/:id/action", validate({ body: adminActionSchema }), controller.adminTakeAction);
  router.post("/admin/:id/notes", validate({ body: internalNoteSchema }), controller.addInternalNote);

  return router;
}
