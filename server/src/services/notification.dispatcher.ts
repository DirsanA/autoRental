import { Notification } from "../models/Notification.js";
import { emailService } from "./email.service.js";
import type { Types } from "mongoose";

/**
 * Notification action types for admin actions
 */
export type AdminNotificationAction =
  // User Management
  | "ACCOUNT_SUSPENDED"
  | "ACCOUNT_ACTIVATED"
  | "ACCOUNT_DELETED"
  // PeerHost (P2P) Verifications
  | "VERIFICATION_APPROVED"
  | "VERIFICATION_REJECTED"
  | "P2P_STATUS_CHANGED"
  // Company
  | "COMPANY_APPROVED"
  | "COMPANY_REJECTED"
  | "COMPANY_SUSPENDED"
  | "COMPANY_ACTIVATED";

/**
 * Payload for sending admin action notifications
 */
export interface AdminActionNotificationPayload {
  recipientId: string | Types.ObjectId;
  recipientEmail: string;
  recipientName: string;
  action: AdminNotificationAction;
  reason?: string | undefined;
  entityType: "User" | "PeerHost" | "Company";
  entityId: string | Types.ObjectId;
  adminId?: string | Types.ObjectId;
}

/**
 * Maps action types to human-readable descriptions
 */
const ACTION_DESCRIPTIONS: Record<
  AdminNotificationAction,
  { title: string; description: string }
> = {
  ACCOUNT_SUSPENDED: {
    title: "Account Suspended",
    description: "has been suspended",
  },
  ACCOUNT_ACTIVATED: {
    title: "Account Activated",
    description: "has been reactivated",
  },
  ACCOUNT_DELETED: {
    title: "Account Deleted",
    description: "has been permanently deleted",
  },
  VERIFICATION_APPROVED: {
    title: "Verification Approved",
    description: "verification has been approved",
  },
  VERIFICATION_REJECTED: {
    title: "Verification Rejected",
    description: "verification has been rejected",
  },
  P2P_STATUS_CHANGED: {
    title: "Host Status Changed",
    description: "host status has been updated",
  },
  COMPANY_APPROVED: {
    title: "Company Approved",
    description: "company registration has been approved",
  },
  COMPANY_REJECTED: {
    title: "Company Rejected",
    description: "company registration has been rejected",
  },
  COMPANY_SUSPENDED: {
    title: "Company Suspended",
    description: "company account has been suspended",
  },
  COMPANY_ACTIVATED: {
    title: "Company Activated",
    description: "company account has been reactivated",
  },
};

/**
 * Determines notification category based on action type
 */
function getCategory(action: AdminNotificationAction): string {
  if (action.includes("VERIFICATION")) return "VERIFICATION";
  if (action.includes("COMPANY")) return "ACCOUNT";
  return "ACCOUNT";
}

/**
 * Determines notification priority based on action type
 */
function getPriority(action: AdminNotificationAction): string {
  if (
    action.includes("SUSPENDED") ||
    action.includes("REJECTED") ||
    action.includes("DELETED")
  ) {
    return "HIGH";
  }
  return "MEDIUM";
}

/**
 * Generates email HTML for admin action notifications
 */
function generateEmailHtml(
  recipientName: string,
  action: AdminNotificationAction,
  entityType: string,
  reason?: string,
): string {
  const actionInfo = ACTION_DESCRIPTIONS[action];
  const timestamp = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const reasonSection = reason
    ? `<div style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; margin: 16px 0;">
        <strong>Reason:</strong> ${escapeHtml(reason)}
       </div>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${actionInfo.title} - AutoRental</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="padding: 20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" align="center" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; border-bottom: 1px solid #e5e7eb;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #111827;">AutoRental</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #111827;">
                ${actionInfo.title}
              </h2>
              
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.5; color: #374151;">
                Hello ${escapeHtml(recipientName)},
              </p>
              
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.5; color: #374151;">
                We're writing to inform you that your <strong>${entityType.toLowerCase()}</strong> ${actionInfo.description}.
              </p>
              
              ${reasonSection}
              
              <p style="margin: 16px 0 0; font-size: 14px; color: #6b7280;">
                <strong>Action taken:</strong> ${timestamp}
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
              
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #4b5563;">
                If you believe this action was taken in error or have any questions, please contact our support team.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #4b5563;">
                <strong>Need help?</strong> Contact our support team:
              </p>
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                Email: <a href="mailto:support@autorental.com" style="color: #3b82f6; text-decoration: none;">support@autorental.com</a>
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #9ca3af;">
                This is an automated notification from AutoRental.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Escapes HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = { toString: () => text };
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Notification Dispatcher Service
 *
 * Handles both email delivery and in-app notification creation.
 * Creates Notification documents for future in-app UI while sending emails immediately.
 */
export class NotificationDispatcher {
  /**
   * Sends an admin action notification to a user.
   * Creates both in-app notification and sends email.
   */
  async sendAdminActionNotification(
    payload: AdminActionNotificationPayload,
  ): Promise<{ notificationId: string | null; emailSent: boolean }> {
    const {
      recipientId,
      recipientEmail,
      recipientName,
      action,
      reason,
      entityType,
      entityId,
      adminId,
    } = payload;

    const actionInfo = ACTION_DESCRIPTIONS[action];
    const category = getCategory(action);
    const priority = getPriority(action);

    // Create in-app notification
    let notificationId: string | null = null;
    try {
      const notification = await Notification.create({
        recipientId,
        title: actionInfo.title,
        message: `Your ${entityType.toLowerCase()} ${actionInfo.description}.${reason ? ` Reason: ${reason}` : ""}`,
        category,
        priority,
        channels: ["IN_APP", "EMAIL"],
        relatedEntity: {
          id: entityId,
          entityType,
        },
        metadata: {
          action,
          reason,
          adminId,
          entityType,
        },
      });
      notificationId = notification._id.toString();
    } catch (error) {
      console.error("Failed to create in-app notification:", error);
      // Continue to send email even if in-app fails
    }

    // Send email notification
    let emailSent = false;
    if (recipientEmail) {
      try {
        const html = generateEmailHtml(
          recipientName,
          action,
          entityType,
          reason,
        );
        emailSent = await emailService.send({
          to: recipientEmail,
          subject: `[AutoRental] ${actionInfo.title} - Your ${entityType} has been updated`,
          html,
        });
      } catch (error) {
        console.error("Failed to send email notification:", error);
        // Log error but don't throw - admin action should still complete
      }
    }

    return { notificationId, emailSent };
  }

  /**
   * Sends a verification-specific notification with document details
   */
  async sendVerificationNotification(
    payload: AdminActionNotificationPayload & { documentType?: string },
  ): Promise<{ notificationId: string | null; emailSent: boolean }> {
    const {
      recipientId,
      recipientEmail,
      recipientName,
      action,
      reason,
      entityId,
      documentType,
    } = payload;

    const actionInfo = ACTION_DESCRIPTIONS[action];
    const docTypeLabel = documentType
      ? `${documentType.replace(/_/g, " ")} `
      : "";

    // Create in-app notification
    let notificationId: string | null = null;
    try {
      const notification = await Notification.create({
        recipientId,
        title: actionInfo.title,
        message: `Your ${docTypeLabel}verification ${action === "VERIFICATION_APPROVED" ? "has been approved" : "has been rejected"}.${reason ? ` Reason: ${reason}` : ""}`,
        category: "VERIFICATION",
        priority: action === "VERIFICATION_REJECTED" ? "HIGH" : "MEDIUM",
        channels: ["IN_APP", "EMAIL"],
        relatedEntity: {
          id: entityId,
          entityType: "Verification",
        },
        metadata: {
          action,
          reason,
          documentType,
        },
      });
      notificationId = notification._id.toString();
    } catch (error) {
      console.error("Failed to create verification notification:", error);
    }

    // Send email
    let emailSent = false;
    if (recipientEmail) {
      try {
        const html = generateVerificationEmailHtml(
          recipientName,
          action,
          documentType,
          reason,
        );
        emailSent = await emailService.send({
          to: recipientEmail,
          subject: `[AutoRental] ${actionInfo.title} - ${docTypeLabel}Verification Update`,
          html,
        });
      } catch (error) {
        console.error("Failed to send verification email:", error);
      }
    }

    return { notificationId, emailSent };
  }
}

/**
 * Generates email HTML specifically for verification notifications
 */
function generateVerificationEmailHtml(
  recipientName: string,
  action: AdminNotificationAction,
  documentType?: string,
  reason?: string,
): string {
  const actionInfo = ACTION_DESCRIPTIONS[action];
  const docTypeLabel = documentType
    ? `${documentType.replace(/_/g, " ")} `
    : "";
  const timestamp = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const reasonSection = reason
    ? `<div style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; margin: 16px 0;">
        <strong>Reason:</strong> ${escapeHtml(reason)}
       </div>`
    : "";

  const nextSteps =
    action === "VERIFICATION_REJECTED"
      ? `<p style="margin: 16px 0 0; font-size: 14px; line-height: 1.5; color: #4b5563;">
        You may submit new verification documents after addressing the issues mentioned above.
       </p>`
      : `<p style="margin: 16px 0 0; font-size: 14px; line-height: 1.5; color: #4b5563;">
        Your account now has the associated verification benefits and privileges.
       </p>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${actionInfo.title} - AutoRental</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="padding: 20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" align="center" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 32px 32px 24px; border-bottom: 1px solid #e5e7eb;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #111827;">AutoRental</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #111827;">
                ${actionInfo.title}
              </h2>
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.5; color: #374151;">
                Hello ${escapeHtml(recipientName)},
              </p>
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.5; color: #374151;">
                We're writing to inform you that your <strong>${docTypeLabel}verification</strong> ${action === "VERIFICATION_APPROVED" ? "has been approved" : "has been rejected"}.
              </p>
              ${reasonSection}
              ${nextSteps}
              <p style="margin: 16px 0 0; font-size: 14px; color: #6b7280;">
                <strong>Reviewed:</strong> ${timestamp}
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
              <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #4b5563;">
                If you have any questions about this decision, please contact our support team.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #4b5563;">
                <strong>Need help?</strong> Contact our support team:
              </p>
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                Email: <a href="mailto:support@autorental.com" style="color: #3b82f6; text-decoration: none;">support@autorental.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export const notificationDispatcher = new NotificationDispatcher();
