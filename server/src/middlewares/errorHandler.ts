import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { ENV } from "../config/env.js";

type BetterAuthError = Error & {
  statusCode?: number;
  body?: {
    code?: string;
    message?: string;
  };
};

/**
 * Detects the structured errors returned by better-auth.
 */
function isBetterAuthError(error: Error): error is BetterAuthError {
  return error.name === "APIError" || ("statusCode" in error && "body" in error);
}

/**
 * Global error handler middleware.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
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

  if (isBetterAuthError(err)) {
    res.status(err.statusCode || 400).json({
      success: false,
      error: {
        code: err.body?.code || "AUTH_ERROR",
        message: err.body?.message || err.message,
      },
    });
    return;
  }

  console.error("Unhandled error:", err);

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
      ...(ENV.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
}
