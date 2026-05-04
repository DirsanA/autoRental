import type { Request, Response } from "express";
import { reportService } from "../services/report.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const createReport = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const report = await reportService.createReport({
    ...req.body,
    reportedBy: userId,
  });

  res.status(201).json({
    success: true,
    data: report,
  });
});

export const getMyReports = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const reports = await reportService.listUserReports(userId);

  res.status(200).json({
    success: true,
    data: reports,
  });
});

export const adminListReports = asyncHandler(async (req: Request, res: Response) => {
  const { status, type, priority, page, limit } = req.query;
  const result = await reportService.listAllReports({
    status: status as any,
    type: type as any,
    priority: priority as any,
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
  });

  res.status(200).json({
    success: true,
    data: result.reports,
    pagination: result.pagination,
  });
});

export const getReportDetail = asyncHandler(async (req: Request, res: Response) => {
  const report = await reportService.getReportById(req.params.id);

  res.status(200).json({
    success: true,
    data: report,
  });
});

export const adminTakeAction = asyncHandler(async (req: Request, res: Response) => {
  const adminId = (req as any).user.id;
  const { status, resolutionNotes, actionTaken } = req.body;

  const report = await reportService.takeAdminAction(req.params.id, {
    adminId,
    status,
    resolutionNotes,
    actionTaken,
  });

  res.status(200).json({
    success: true,
    data: report,
  });
});

export const addInternalNote = asyncHandler(async (req: Request, res: Response) => {
  const adminId = (req as any).user.id;
  const { content } = req.body;

  const report = await reportService.addInternalNote(req.params.id, {
    adminId,
    content,
  });

  res.status(200).json({
    success: true,
    data: report,
  });
});
