import mongoose from "mongoose";
import { MongoClient } from "mongodb";
import { ENV } from "./env.js";

let authMongoClient: MongoClient | null = null;
let authMongoConnectPromise: Promise<MongoClient> | null = null;

function getRequiredDatabaseUrl(): string {
  const uri = ENV.DATABASE_URL;
  if (!uri) {
    console.error("DATABASE_URL is not set in environment variables.");
    process.exit(1);
  }

  return uri;
}

function createAuthMongoClient(uri: string) {
  return new MongoClient(uri);
}

async function connectAuthMongoClient(): Promise<MongoClient> {
  if (authMongoClient) {
    return authMongoClient;
  }

  if (!authMongoConnectPromise) {
    const uri = getRequiredDatabaseUrl();
    const client = createAuthMongoClient(uri);

    authMongoConnectPromise = client
      .connect()
      .then((connectedClient) => {
        authMongoClient = connectedClient;
        return connectedClient;
      })
      .catch((error) => {
        authMongoConnectPromise = null;
        throw error;
      });
  }

  return authMongoConnectPromise;
}

/**
 * Connect to MongoDB for both Mongoose models and better-auth collections.
 * Exits the process on connection failure so startup fails fast.
 */
export async function connectDatabase(): Promise<void> {
  const uri = getRequiredDatabaseUrl();

  try {
    await mongoose.connect(uri, {
      maxPoolSize: 10, // Increased to handle more concurrent dashboard requests
    });
    await connectAuthMongoClient();
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected. Attempting to reconnect...");
  });
}

/**
 * Returns the dedicated MongoDB driver client used by better-auth and auth collections.
 * Must be called after connectDatabase() has resolved.
 */
export function getMongoClient() {
  if (!authMongoClient) {
    const uri = getRequiredDatabaseUrl();
    authMongoClient = createAuthMongoClient(uri);
  }

  return authMongoClient;
}
