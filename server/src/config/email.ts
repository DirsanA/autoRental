import nodemailer from "nodemailer";
import { ENV } from "./env.js";

/**
 * Creates and returns a nodemailer transport.
 * Uses SMTP settings from environment variables.
 */
export function createTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  // Falls back to a local no-op transport when SMTP credentials are not configured.
  // For testing: if vars aren't provided, use Ethereal (mock SMTP for local dev)
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    if (ENV.NODE_ENV === "production") {
      console.warn("⚠️ SMTP credentials missing in production environment!");
    }
    
    // Fallback: This will return a dummy transport or log a warning if needed
    // In dev, one could use nodemailer.createTestAccount() but that's async.
    // Let's create a null-transport for now if missing.
    return nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10),
    secure: parseInt(SMTP_PORT, 10) === 465, // true for 465, false for others
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

// Reuses one configured mail transport across the application.
export const transport = createTransport();
