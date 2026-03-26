import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node";
import { createApiRoutes } from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { generalLimiter, authLimiter } from "./middlewares/rateLimiter.js";
import { ENV } from "./config/env.js";
import type { Auth } from "./config/auth.js";

/**
 * Creates and configures the Express application.
 * Takes the better-auth instance as a parameter (must be created after DB connection).
 */
export function createApp(auth: Auth) {
  const app = express();

  // --- Security ---
  app.use(helmet());
  app.use(generalLimiter);

  // --- CORS ---
  app.use(
    cors({
      origin: ENV.FRONTEND_URL,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true,
    }),
  );

  // --- Logging ---
  app.use(morgan("dev"));

  // --- Body parsing ---
  // Mounted before API routes so our custom auth endpoints can read req.body.
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // --- Health check ---
  app.get("/health", (_req, res) => {
    res.json({ success: true, message: "ok", timestamp: new Date().toISOString() });
  });

  // --- API routes (includes our custom /api/auth/* endpoints) ---
  // MUST be mounted BEFORE the better-auth catch-all so our custom
  // registration/login endpoints take priority.
  app.use("/api", createApiRoutes(auth));

  // --- better-auth handler ---
  // Catches remaining /api/auth/* requests (email verification callbacks,
  // native sign-up/sign-in if the client calls them directly, etc.)
  // better-auth parses its own body from the raw request.
  app.all("/api/auth/*splat", authLimiter, toNodeHandler(auth));

  // --- Global error handler (must be last) ---
  app.use(errorHandler);

  return app;
}
