import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { ENV } from "../config/env.js";

/**
 * Global error handler middleware.
 * Must be registered LAST in the middleware chain (after all routes).
 *
 * Catches ApiError instances and returns structured JSON responses.
 * Unknown errors get a generic 500 response (no stack trace in production).
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Converts domain-level ApiError instances into the shared API error response shape.
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
    return;
  }

  // Normalizes better-auth errors so auth failures match the rest of the API contract.
  // Handle better-auth's built-in APIError
  if (err.name === "APIError" || ("statusCode" in err && "body" in err)) {
    const beError = err as any;
    res.status(beError.statusCode || 400).json({
      success: false,
      error: {
        code: beError.body?.code || "AUTH_ERROR",
        message: beError.body?.message || err.message,
      },
    });
    return;
  }

  // Falls back to a generic 500 response and only exposes stack traces in development.
  // Log unexpected errors
  console.error("Unhandled error:", err);

  const isDev = ENV.NODE_ENV === "development";

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
      ...(isDev && { stack: err.stack }),
    },
  });
}
