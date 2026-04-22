import type { Request, Response, NextFunction } from "express";
import { z, type ZodType } from "zod";
import { ApiError } from "../utils/ApiError.js";

type ValidationSchemas = {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
};

type ValidationErrorDetail = { field: string; message: string };

/**
 * Converts Zod issues into the API validation error shape.
 */
function appendIssues(
  errors: ValidationErrorDetail[],
  issues: z.ZodIssue[],
  prefix = "",
): void {
  for (const issue of issues) {
    errors.push({
      field: prefix ? `${prefix}.${issue.path.join(".")}` : issue.path.join("."),
      message: issue.message,
    });
  }
}

/**
 * Replaces the contents of a mutable request segment without reassigning the object.
 */
function replaceObjectValues(
  target: Record<string, unknown>,
  next: Record<string, unknown>,
): void {
  for (const key of Object.keys(target)) {
    delete target[key];
  }

  Object.assign(target, next);
}

/**
 * Validates request body, query, and params against Zod schemas.
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const errors: ValidationErrorDetail[] = [];

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        appendIssues(errors, result.error.issues);
      } else {
        req.body = result.data;
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        appendIssues(errors, result.error.issues, "query");
      } else {
        replaceObjectValues(
          req.query as Record<string, unknown>,
          result.data as Record<string, unknown>,
        );
      }
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        appendIssues(errors, result.error.issues, "params");
      } else {
        replaceObjectValues(
          req.params as Record<string, unknown>,
          result.data as Record<string, unknown>,
        );
      }
    }

    if (errors.length > 0) {
      next(ApiError.badRequest("Request validation failed", errors));
      return;
    }

    next();
  };
}
