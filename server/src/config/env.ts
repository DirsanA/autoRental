import dotenv from "dotenv";

// Load environment variables from the .env file,
// this ensures it runs before anything else imports from this file.
dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL,
};
