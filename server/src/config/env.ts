import dotenv from "dotenv";

// Loads environment variables before any config consumers read process.env.
dotenv.config();

// Centralizes runtime configuration and applies safe local defaults where possible.
export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL,

  // better-auth
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "",
  BETTER_AUTH_URL:
    process.env.BETTER_AUTH_URL ||
    `http://localhost:${process.env.PORT || 5000}`,

  // Frontend origin (for CORS & email links)
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",

  // email
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
};
