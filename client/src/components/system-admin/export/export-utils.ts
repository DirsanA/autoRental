/**
 * Export utilities for generating Excel-compatible CSV files.
 * CSV files open natively in Excel without external libraries.
 */

import type { AdminUserSummary } from "@/lib/admin-users-api";
import type { AdminCompanySummary } from "@/lib/admin-companies-api";
import type { P2PHostSummary } from "@/lib/admin-p2p-api";

/**
 * Escapes CSV field values to handle commas, quotes, and newlines.
 */
function escapeCsv(value: string | number | boolean | null | undefined): string {
  const stringValue = String(value ?? "");
  // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

/**
 * Converts array of objects to CSV string with UTF-8 BOM for Excel compatibility.
 */
function convertToCsv(headers: string[], rows: Record<string, string | number | boolean | null | undefined>[]): string {
  const headerLine = headers.map(escapeCsv).join(",");
  const dataLines = rows.map((row) =>
    headers.map((header) => escapeCsv(row[header])).join(",")
  );
  // Add UTF-8 BOM for proper Excel encoding
  const bom = "\uFEFF";
  return bom + [headerLine, ...dataLines].join("\n");
}

/**
 * Triggers browser download of CSV file.
 */
function downloadCsv(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Gets current date string for filename.
 */
function getDateString(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Exports users to Excel-compatible CSV.
 */
export function exportUsersToExcel(users: AdminUserSummary[]): void {
  const headers = [
    "ID",
    "Name",
    "Username",
    "Email",
    "Role",
    "Account Type",
    "Status",
    "Joined Date",
  ];

  const rows = users.map((user) => ({
    ID: user.id,
    Name: user.name,
    Username: user.username,
    Email: user.email,
    Role: user.role,
    "Account Type": user.accountType ?? "N/A",
    Status: user.status,
    "Joined Date": user.joined ? new Date(user.joined).toLocaleDateString("en-US") : "N/A",
  }));

  const csv = convertToCsv(headers, rows);
  downloadCsv(`users-export-${getDateString()}.csv`, csv);
}

/**
 * Exports companies to Excel-compatible CSV.
 */
export function exportCompaniesToExcel(companies: AdminCompanySummary[]): void {
  const headers = [
    "ID",
    "Name",
    "Status",
    "Verification Status",
    "TIN Number",
    "Contact Email",
    "Contact Phone",
    "Website",
    "Created Date",
    "Auth Account Name",
    "Auth Account Email",
  ];

  const rows = companies.map((company) => ({
    ID: company.id,
    Name: company.name,
    Status: company.status,
    "Verification Status": company.isVerified ? "Verified" : "Not Verified",
    "TIN Number": company.tinNumber ?? "N/A",
    "Contact Email": company.contactEmail ?? "N/A",
    "Contact Phone": company.contactPhone ?? "N/A",
    Website: company.website ?? "N/A",
    "Created Date": company.createdAt ? new Date(company.createdAt).toLocaleDateString("en-US") : "N/A",
    "Auth Account Name": company.authAccount?.name ?? "N/A",
    "Auth Account Email": company.authAccount?.email ?? "N/A",
  }));

  const csv = convertToCsv(headers, rows);
  downloadCsv(`companies-export-${getDateString()}.csv`, csv);
}

/**
 * Exports P2P hosts to Excel-compatible CSV.
 */
export function exportP2PHostsToExcel(hosts: P2PHostSummary[]): void {
  const headers = [
    "ID",
    "User ID",
    "Name",
    "Email",
    "Phone Number",
    "Verification Level",
    "Status",
    "Vehicles Owned",
    "Vehicles Pending",
    "Vehicles Approved",
    "Submitted Date",
    "Can Promote",
    "Blocker Count",
  ];

  const rows = hosts.map((host) => ({
    ID: host.id,
    "User ID": host.userId,
    Name: host.name,
    Email: host.email,
    "Phone Number": host.phoneNumber ?? "N/A",
    "Verification Level": host.verificationLevel,
    Status: host.status,
    "Vehicles Owned": host.vehiclesOwned,
    "Vehicles Pending": host.vehiclesPendingApproval,
    "Vehicles Approved": host.vehiclesApproved,
    "Submitted Date": host.submittedAt ? new Date(host.submittedAt).toLocaleDateString("en-US") : "N/A",
    "Can Promote": host.reviewReadiness.canPromote ? "Yes" : "No",
    "Blocker Count": host.reviewReadiness.blockerCount,
  }));

  const csv = convertToCsv(headers, rows);
  downloadCsv(`p2p-hosts-export-${getDateString()}.csv`, csv);
}
