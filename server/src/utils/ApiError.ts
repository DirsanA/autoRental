/**
 * Custom API error class for consistent error handling.
 * Throw this from services/controllers; the global error handler will catch it.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, string>[] | undefined;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: Record<string, string>[] | undefined,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message: string, details?: Record<string, string>[]) {
    return new ApiError(400, "VALIDATION_ERROR", message, details);
  }

  static unauthorized(message = "Authentication required") {
    return new ApiError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message = "Insufficient permissions") {
    return new ApiError(403, "FORBIDDEN", message);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(404, "NOT_FOUND", message);
  }

  static conflict(message: string) {
    return new ApiError(409, "CONFLICT", message);
  }

  static unprocessable(message: string) {
    return new ApiError(422, "UNPROCESSABLE", message);
  }

  static internal(message = "An unexpected error occurred") {
    return new ApiError(500, "INTERNAL_ERROR", message);
  }

  static serviceUnavailable(message = "Service temporarily unavailable") {
    return new ApiError(503, "SERVICE_UNAVAILABLE", message);
  }
}
