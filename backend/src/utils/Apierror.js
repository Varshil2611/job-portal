/**
 * Custom API Error class that extends the built-in Error.
 * Used throughout controllers to throw structured errors
 * that the global error handler knows how to format.
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;