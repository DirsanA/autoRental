import { Report, type ReportStatus, type ReportPriority, type ReportType, type ReportSubjectModel } from "../models/Report.js";
import { Notification } from "../models/Notification.js";
import { ApiError } from "../utils/ApiError.js";
import { resolveUploadValue } from "../utils/cloudinary.js";
import mongoose from "mongoose";

export interface CreateReportInput {
  reportedBy: string;
  type: ReportType;
  subjectId?: string;
  subjectModel?: ReportSubjectModel;
  description: string;
  evidenceUrls: string[];
  priority?: ReportPriority;
  metadata?: Record<string, any>;
}

export interface AdminActionInput {
  adminId: string;
  status: ReportStatus;
  resolutionNotes?: string;
  actionTaken?: string;
}

export interface InternalNoteInput {
  adminId: string;
  content: string;
}

export class ReportService {
  async createReport(input: CreateReportInput) {
    // Process evidence images if they are data URLs
    const uploadedUrls = await Promise.all(
      input.evidenceUrls.map((url, index) =>
        resolveUploadValue(url, "reports", `evidence_${index}`)
      )
    );

    const report = await Report.create({
      ...input,
      evidenceUrls: uploadedUrls,
      status: "OPEN",
    });

    return report;
  }

  async listUserReports(userId: string) {
    return Report.find({ reportedBy: userId }).sort({ createdAt: -1 });
  }

  async listAllReports(query: {
    status?: ReportStatus;
    type?: ReportType;
    priority?: ReportPriority;
    subjectId?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, type, priority, subjectId, page = 1, limit = 20 } = query;
    const filter: any = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (subjectId) filter.subjectId = subjectId;

    const skip = (page - 1) * limit;
    
    const [rawReports, total] = await Promise.all([
      Report.find(filter)
        .select("type description status priority subjectId subjectModel reportedBy createdAt updatedAt")
        .populate("reportedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Report.countDocuments(filter),
    ]);

    // .lean() bypasses toJSON, so normalise _id → id
    const reports = rawReports.map((r: any) => ({
      ...r,
      id: r._id?.toString(),
    }));

    return {
      reports,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getReportById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest("Invalid report ID");
    }

    const raw = await Report.findById(id)
      .populate("reportedBy", "name email phoneNumber")
      .populate("subjectId")
      .lean() as any;

    if (!raw) {
      throw ApiError.notFound("Report not found");
    }

    // normalise _id → id for lean result and populated subdocs
    const reportedBy = raw.reportedBy
      ? { ...raw.reportedBy, id: raw.reportedBy._id?.toString() }
      : raw.reportedBy;

    const subjectId = raw.subjectId && typeof raw.subjectId === "object"
      ? { ...raw.subjectId, id: raw.subjectId._id?.toString() }
      : raw.subjectId;

    return { ...raw, id: raw._id?.toString(), reportedBy, subjectId };
  }

  async addInternalNote(reportId: string, input: InternalNoteInput) {
    const report = await Report.findById(reportId);
    if (!report) throw ApiError.notFound("Report not found");

    report.internalNotes.push({
      authorId: new mongoose.Types.ObjectId(input.adminId) as any,
      content: input.content,
      createdAt: new Date(),
    });

    await report.save();
    return report;
  }

  async takeAdminAction(reportId: string, input: AdminActionInput) {
    const report = await Report.findById(reportId);
    if (!report) throw ApiError.notFound("Report not found");

    report.status = input.status;
    
    if (input.status === "RESOLVED" || input.status === "CLOSED") {
      report.adminResolution = {
        resolvedBy: new mongoose.Types.ObjectId(input.adminId) as any,
        resolutionNotes: input.resolutionNotes || "",
        actionTaken: input.actionTaken || "NONE",
        resolvedAt: new Date(),
      };

      await Notification.create({
        recipientId: report.reportedBy,
        title: `Report ${input.status === "RESOLVED" ? "Resolved" : "Closed"}`,
        message: `Your report regarding a ${report.type.replace(/_/g, " ").toLowerCase()} has been ${input.status.toLowerCase()}. ${input.resolutionNotes ? `Admin notes: ${input.resolutionNotes}` : ""}`,
        category: "SYSTEM_ALERT",
        priority: "MEDIUM",
        relatedEntity: {
          id: report._id,
          entityType: "Report",
        },
      });
    } else if (input.status === "UNDER_REVIEW") {
      await Notification.create({
        recipientId: report.reportedBy,
        title: "Report Under Review",
        message: `Your report regarding a ${report.type.replace(/_/g, " ").toLowerCase()} is now being reviewed by our team.`,
        category: "SYSTEM_ALERT",
        priority: "MEDIUM",
        relatedEntity: {
          id: report._id,
          entityType: "Report",
        },
      });
    }

    await report.save();
    return report;
  }
}

export const reportService = new ReportService();
