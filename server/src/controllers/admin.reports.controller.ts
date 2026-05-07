import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { adminReportsService } from "../services/admin.reports.service.js";
import PDFDocument from "pdfkit";

function parseYearMonth(req: Request) {
  const year = Number(req.query.year);
  const month = Number(req.query.month);
  if (!Number.isFinite(year) || year < 2000 || year > 2100) {
    throw ApiError.badRequest("Invalid year");
  }
  if (!Number.isFinite(month) || month < 1 || month > 12) {
    throw ApiError.badRequest("Invalid month");
  }
  return { year: Math.trunc(year), month: Math.trunc(month) };
}

function toCsvRow(values: Array<string | number>) {
  return values
    .map((v) => {
      const s = String(v ?? "");
      // RFC4180-style escaping
      if (/[\n\r",]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    })
    .join(",");
}

function buildMonthlyCsv(report: any) {
  const lines: string[] = [];
  lines.push(toCsvRow(["report", "Monthly Executive Report"]));
  lines.push(toCsvRow(["year", report.period.year]));
  lines.push(toCsvRow(["month", report.period.month]));
  lines.push(toCsvRow(["generatedAt", report.generatedAt]));
  lines.push("");

  lines.push(toCsvRow(["section", "Overview"]));
  lines.push(toCsvRow(["grossRevenue", report.overview.grossRevenue]));
  lines.push(toCsvRow(["platformCommission", report.overview.platformCommission]));
  lines.push(toCsvRow(["paidBookings", report.overview.paidBookings]));
  lines.push(toCsvRow(["totalBookings", report.overview.totalBookings]));
  lines.push(toCsvRow(["activeBookings", report.overview.activeBookings]));
  lines.push("");

  lines.push(toCsvRow(["section", "Users"]));
  lines.push(toCsvRow(["total", report.users.total]));
  lines.push(toCsvRow(["newThisMonth", report.users.newThisMonth]));
  lines.push(toCsvRow(["active", report.users.active]));
  lines.push(toCsvRow(["suspended", report.users.suspended]));
  lines.push(toCsvRow(["peerHosts", report.users.peerHosts]));
  lines.push(toCsvRow(["newPeerHostsThisMonth", report.users.newPeerHostsThisMonth]));
  lines.push("");

  lines.push(toCsvRow(["section", "Companies"]));
  lines.push(toCsvRow(["total", report.companies.total]));
  lines.push(toCsvRow(["newThisMonth", report.companies.newThisMonth]));
  lines.push(toCsvRow(["active", report.companies.active]));
  lines.push(toCsvRow(["pendingApproval", report.companies.pendingApproval]));
  lines.push(toCsvRow(["suspended", report.companies.suspended]));
  lines.push(toCsvRow(["verified", report.companies.verified]));
  lines.push(toCsvRow(["newlyVerifiedThisMonth", report.companies.newlyVerifiedThisMonth]));
  lines.push("");

  lines.push(toCsvRow(["section", "Supply"]));
  lines.push(toCsvRow(["vehiclesTotal", report.supply.vehiclesTotal]));
  lines.push(toCsvRow(["vehiclesNewThisMonth", report.supply.vehiclesNewThisMonth]));
  lines.push(toCsvRow(["vehiclesAvailable", report.supply.vehiclesAvailable]));
  lines.push(toCsvRow(["vehiclesPendingApproval", report.supply.vehiclesPendingApproval]));
  lines.push(toCsvRow(["vehiclesSuspended", report.supply.vehiclesSuspended]));
  lines.push("");

  lines.push(toCsvRow(["section", "TrustAndSafety"]));
  lines.push(toCsvRow(["verificationsSubmittedThisMonth", report.trustAndSafety.verificationsSubmittedThisMonth]));
  lines.push(toCsvRow(["verificationsPending", report.trustAndSafety.verificationsPending]));
  lines.push(toCsvRow(["verificationsApprovedThisMonth", report.trustAndSafety.verificationsApprovedThisMonth]));
  lines.push(toCsvRow(["verificationsRejectedThisMonth", report.trustAndSafety.verificationsRejectedThisMonth]));
  lines.push(toCsvRow(["reportsOpenedThisMonth", report.trustAndSafety.reportsOpenedThisMonth]));
  lines.push(toCsvRow(["reportsOpenNow", report.trustAndSafety.reportsOpenNow]));
  lines.push(toCsvRow(["reportsResolvedThisMonth", report.trustAndSafety.reportsResolvedThisMonth]));
  return lines.join("\n");
}

function formatMonthLabel(year: number, month: number) {
  const d = new Date(Date.UTC(year, month - 1, 1));
  return d.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

function buildMonthlyHtml(report: any) {
  const title = `Monthly Executive Report - ${formatMonthLabel(report.period.year, report.period.month)}`;

  // Simple, print-friendly HTML that works with browser "Save as PDF".
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      :root { color-scheme: light; }
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; margin: 28px; color: #0f172a; }
      h1 { font-size: 20px; margin: 0 0 6px; }
      .sub { color: #475569; font-size: 12px; margin: 0 0 18px; }
      .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
      .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; }
      .label { color: #475569; font-size: 11px; margin-bottom: 4px; }
      .value { font-weight: 700; font-size: 16px; }
      h2 { font-size: 14px; margin: 18px 0 8px; }
      table { width: 100%; border-collapse: collapse; }
      td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
      td:first-child { color: #334155; width: 55%; }
      td:last-child { text-align: right; font-weight: 600; }
      @media print { body { margin: 14mm; } }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    <p class="sub">Generated at ${new Date(report.generatedAt).toISOString()}</p>

    <div class="grid">
      <div class="card"><div class="label">Gross Revenue</div><div class="value">${report.overview.grossRevenue}</div></div>
      <div class="card"><div class="label">Platform Commission</div><div class="value">${report.overview.platformCommission}</div></div>
      <div class="card"><div class="label">Paid Bookings</div><div class="value">${report.overview.paidBookings}</div></div>
    </div>

    <h2>Users</h2>
    <table>
      <tr><td>Total</td><td>${report.users.total}</td></tr>
      <tr><td>New This Month</td><td>${report.users.newThisMonth}</td></tr>
      <tr><td>Active</td><td>${report.users.active}</td></tr>
      <tr><td>Suspended</td><td>${report.users.suspended}</td></tr>
      <tr><td>Peer Hosts</td><td>${report.users.peerHosts}</td></tr>
      <tr><td>New Peer Hosts (by updatedAt)</td><td>${report.users.newPeerHostsThisMonth}</td></tr>
    </table>

    <h2>Companies</h2>
    <table>
      <tr><td>Total</td><td>${report.companies.total}</td></tr>
      <tr><td>New This Month</td><td>${report.companies.newThisMonth}</td></tr>
      <tr><td>Active</td><td>${report.companies.active}</td></tr>
      <tr><td>Pending Approval</td><td>${report.companies.pendingApproval}</td></tr>
      <tr><td>Suspended</td><td>${report.companies.suspended}</td></tr>
      <tr><td>Verified</td><td>${report.companies.verified}</td></tr>
      <tr><td>Newly Verified This Month</td><td>${report.companies.newlyVerifiedThisMonth}</td></tr>
    </table>

    <h2>Supply</h2>
    <table>
      <tr><td>Vehicles (Total)</td><td>${report.supply.vehiclesTotal}</td></tr>
      <tr><td>Vehicles (New This Month)</td><td>${report.supply.vehiclesNewThisMonth}</td></tr>
      <tr><td>Available</td><td>${report.supply.vehiclesAvailable}</td></tr>
      <tr><td>Pending Approval</td><td>${report.supply.vehiclesPendingApproval}</td></tr>
      <tr><td>Suspended</td><td>${report.supply.vehiclesSuspended}</td></tr>
    </table>

    <h2>Trust & Safety</h2>
    <table>
      <tr><td>Verifications Submitted This Month</td><td>${report.trustAndSafety.verificationsSubmittedThisMonth}</td></tr>
      <tr><td>Verifications Pending (Now)</td><td>${report.trustAndSafety.verificationsPending}</td></tr>
      <tr><td>Verifications Approved This Month</td><td>${report.trustAndSafety.verificationsApprovedThisMonth}</td></tr>
      <tr><td>Verifications Rejected This Month</td><td>${report.trustAndSafety.verificationsRejectedThisMonth}</td></tr>
      <tr><td>Reports Opened This Month</td><td>${report.trustAndSafety.reportsOpenedThisMonth}</td></tr>
      <tr><td>Reports Open/Under Review (Now)</td><td>${report.trustAndSafety.reportsOpenNow}</td></tr>
      <tr><td>Reports Resolved/Closed This Month</td><td>${report.trustAndSafety.reportsResolvedThisMonth}</td></tr>
    </table>
  </body>
</html>`;
}

async function buildMonthlyPdfBuffer(report: any): Promise<Buffer> {
  return await new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 48, info: { Title: "Monthly Executive Report" } });
      const chunks: Buffer[] = [];

      doc.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const title = `Monthly Executive Report - ${formatMonthLabel(report.period.year, report.period.month)}`;

      doc.fontSize(18).font("Helvetica-Bold").text(title);
      doc.moveDown(0.25);
      doc.fontSize(10).font("Helvetica").fillColor("#475569").text(`Generated at: ${report.generatedAt}`);
      doc.fillColor("#0f172a");
      doc.moveDown(1);

      doc.fontSize(12).font("Helvetica-Bold").text("Overview");
      doc.moveDown(0.4);
      doc.fontSize(11).font("Helvetica");
      doc.text(`Gross Revenue: ${report.overview.grossRevenue}`);
      doc.text(`Platform Commission: ${report.overview.platformCommission}`);
      doc.text(`Paid Bookings: ${report.overview.paidBookings}`);
      doc.text(`Total Bookings: ${report.overview.totalBookings}`);
      doc.text(`Active Bookings: ${report.overview.activeBookings}`);
      doc.moveDown(0.8);

      doc.fontSize(12).font("Helvetica-Bold").text("Users");
      doc.moveDown(0.4);
      doc.fontSize(11).font("Helvetica");
      doc.text(`Total: ${report.users.total}`);
      doc.text(`New This Month: ${report.users.newThisMonth}`);
      doc.text(`Active: ${report.users.active}`);
      doc.text(`Suspended: ${report.users.suspended}`);
      doc.text(`Peer Hosts: ${report.users.peerHosts}`);
      doc.text(`New Peer Hosts (by updatedAt): ${report.users.newPeerHostsThisMonth}`);
      doc.moveDown(0.8);

      doc.fontSize(12).font("Helvetica-Bold").text("Companies");
      doc.moveDown(0.4);
      doc.fontSize(11).font("Helvetica");
      doc.text(`Total: ${report.companies.total}`);
      doc.text(`New This Month: ${report.companies.newThisMonth}`);
      doc.text(`Active: ${report.companies.active}`);
      doc.text(`Pending Approval: ${report.companies.pendingApproval}`);
      doc.text(`Suspended: ${report.companies.suspended}`);
      doc.text(`Verified: ${report.companies.verified}`);
      doc.text(`Newly Verified This Month: ${report.companies.newlyVerifiedThisMonth}`);
      doc.moveDown(0.8);

      doc.fontSize(12).font("Helvetica-Bold").text("Supply");
      doc.moveDown(0.4);
      doc.fontSize(11).font("Helvetica");
      doc.text(`Vehicles (Total): ${report.supply.vehiclesTotal}`);
      doc.text(`Vehicles (New This Month): ${report.supply.vehiclesNewThisMonth}`);
      doc.text(`Available: ${report.supply.vehiclesAvailable}`);
      doc.text(`Pending Approval: ${report.supply.vehiclesPendingApproval}`);
      doc.text(`Suspended: ${report.supply.vehiclesSuspended}`);
      doc.moveDown(0.8);

      doc.fontSize(12).font("Helvetica-Bold").text("Trust & Safety");
      doc.moveDown(0.4);
      doc.fontSize(11).font("Helvetica");
      doc.text(`Verifications Submitted This Month: ${report.trustAndSafety.verificationsSubmittedThisMonth}`);
      doc.text(`Verifications Pending (Now): ${report.trustAndSafety.verificationsPending}`);
      doc.text(`Verifications Approved This Month: ${report.trustAndSafety.verificationsApprovedThisMonth}`);
      doc.text(`Verifications Rejected This Month: ${report.trustAndSafety.verificationsRejectedThisMonth}`);
      doc.text(`Reports Opened This Month: ${report.trustAndSafety.reportsOpenedThisMonth}`);
      doc.text(`Reports Open/Under Review (Now): ${report.trustAndSafety.reportsOpenNow}`);
      doc.text(`Reports Resolved/Closed This Month: ${report.trustAndSafety.reportsResolvedThisMonth}`);

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

export const adminReportsController = {
  /**
   * GET /api/admin/reports/monthly?year=2026&month=5
   * Optional: format=json|csv|html (default json)
   */
  getMonthlyExecutive: asyncHandler(async (req: Request, res: Response) => {
    const { year, month } = parseYearMonth(req);
    const format = String(req.query.format || "json").toLowerCase();

    const report = await adminReportsService.getMonthlyExecutiveReport({ year, month });

    if (format === "csv") {
      const csv = buildMonthlyCsv(report);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="monthly-executive-report-${year}-${String(month).padStart(2, "0")}.csv"`,
      );
      res.status(200).send(csv);
      return;
    }

    if (format === "pdf") {
      const pdf = await buildMonthlyPdfBuffer(report);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="monthly-executive-report-${year}-${String(month).padStart(2, "0")}.pdf"`,
      );
      res.status(200).send(pdf);
      return;
    }

    if (format === "html") {
      const html = buildMonthlyHtml(report);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.status(200).send(html);
      return;
    }

    if (format !== "json") {
      throw ApiError.badRequest("Invalid format");
    }

    res.status(200).json({ success: true, data: { report } });
  }),
};
