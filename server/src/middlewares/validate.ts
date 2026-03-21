import type { Request, Response, NextFunction } from "express";
import { z, type ZodType } from "zod";

/**
 * Request validation middleware factory.
 * Validates body, query, and/or params against Zod schemas.
 *
 * Usage:
 *   router.post("/", validate({ body: createCompanySchema }), controller.create);
 */
export function validate(schemas: {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Aggregates validation issues across body, query, and params into one consistent error response.
    const errors: { field: string; message: string }[] = [];

    if (schemas.body) {
      // Replaces the raw body with parsed data so downstream handlers receive sanitized values.
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        for (const issue of result.error.issues) {
          errors.push({
            field: issue.path.join("."),
            message: issue.message,
          });
        }
      } else {
        req.body = result.data;
      }
    }

    if (schemas.query) {
      // Validates query parameters separately so client errors point to the exact request segment.
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        for (const issue of result.error.issues) {
          errors.push({
            field: `query.${issue.path.join(".")}`,
            message: issue.message,
          });
        }
      }
    }

    if (schemas.params) {
      // Validates route params independently to keep identifier-related errors explicit.
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        for (const issue of result.error.issues) {
          errors.push({
            field: `params.${issue.path.join(".")}`,
            message: issue.message,
          });
        }
      }
    }

    if (errors.length > 0) {
      // Stops the request early whenever any configured schema fails validation.
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: errors,
        },
      });
      return;
    }

    // Continues only after every requested schema has passed validation.
    next();
  };
}
