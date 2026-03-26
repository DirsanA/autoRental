import mongoose from "mongoose";
import { ENV } from "./env.js";

/**
 * Connect to MongoDB using Mongoose.
 * Exits the process on connection failure — fail fast in production.
 */
export async function connectDatabase(): Promise<void> {
  const uri = ENV.DATABASE_URL;
  // Refuses to boot without a database target so failures surface immediately.
  if (!uri) {
    console.error("DATABASE_URL is not set in environment variables.");
    process.exit(1);
  }

  // Opens the primary Mongoose connection before the rest of the app is initialized.
  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }

  // Keeps operational visibility on the shared Mongoose connection after startup.
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected. Attempting to reconnect...");
  });
}

/**
 * Returns the underlying MongoDB client for use with better-auth's mongodbAdapter.
 * Must be called AFTER connectDatabase() has resolved.
 */
export function getMongoClient() {
  // Exposes the raw Mongo client for integrations that need direct driver access.
  const client = mongoose.connection.getClient();
  return client;
}
