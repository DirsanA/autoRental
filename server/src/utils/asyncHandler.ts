import type { Request, Response, NextFunction } from "express";

/**
 * Wraps an async Express handler so that rejected promises
 * are automatically forwarded to the error-handling middleware.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
