import { transport } from "../config/email.js";
import { ENV } from "../config/env.js";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

/**
 * Service to handle all outbound email logic.
 * Wraps nodemailer and adds templates if needed.
 */
export class EmailService {
  /**
   * Send a general email.
   * Logs send result in dev; suppresses failures to avoid blocking the main user flow.
   */
  async send(options: SendEmailOptions): Promise<boolean> {
    // Falls back to a default sender so transactional emails still render without explicit overrides.
    const from = options.from || process.env.EMAIL_FROM || "noreply@autorental.com";

    // Sends the message through the shared transport and keeps callers insulated from nodemailer details.
    try {
      const info = await transport.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      if (ENV.NODE_ENV === "development") {
        console.log(`📧 Email sent to ${options.to}: ${options.subject}`);
        if ((info as any).envelope) {
           // If using streamTransport (mock), check the buffer
           // info.message is the buffer
        }
      }

      return true;
    } catch (error) {
      console.error(`❌ Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  /**
   * Verification email for better-auth
   */
  async sendVerificationEmail(to: string, url: string): Promise<boolean> {
    // Builds the account activation email body expected by the verification flow.
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Welcome to AutoRental!</h2>
        <p>Please click the button below to verify your email address and activate your account:</p>
        <a href="${url}" style="display: inline-block; background-color: #3b82f6; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 20px 0;">
          Verify Email
        </a>
        <p>Or copy and paste this URL into your browser:</p>
        <p>${url}</p>
        <p>This link will expire in 1 hour.</p>
        <hr style="border-top: 1px solid #eee; margin-top: 30px;">
        <p style="font-size: 12px; color: #666;">If you did not sign up for an account, please ignore this email.</p>
      </div>
    `;

    return this.send({
      to,
      subject: "Verify your email address",
      html,
    });
  }

  /**
   * Password reset email for better-auth
   */
  async sendPasswordResetEmail(to: string, url: string): Promise<boolean> {
    // Builds the password reset email body expected by the recovery flow.
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Reset Your Password</h2>
        <p>We received a request to reset your AutoRental password. Click the button below to choose a new one:</p>
        <a href="${url}" style="display: inline-block; background-color: #3b82f6; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 20px 0;">
          Reset Password
        </a>
        <p>Or copy and paste this URL into your browser:</p>
        <p>${url}</p>
        <p>This link will expire in 1 hour.</p>
        <hr style="border-top: 1px solid #eee; margin-top: 30px;">
        <p style="font-size: 12px; color: #666;">If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `;

    return this.send({
      to,
      subject: "Reset your password",
      html,
    });
  }
}

export const emailService = new EmailService();
