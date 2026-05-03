import ApiError from '../utils/ApiError.js';

/**
 * 404 handler — catches any route not matched above.
 */
export const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Global error handler — last middleware in the chain.
 * Converts all errors into a consistent JSON shape for Angular to consume.
 */
export const errorHandler = (err, _req, res, _next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // ── Mongoose: Cast Error (invalid ObjectId) ──────────────────────────────
  if (err.name === 'CastError') {
    error = new ApiError(400, `Invalid ID format: ${err.value}`);
  }

  // ── Mongoose: Duplicate key (e.g. email already exists) ──────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    error = new ApiError(409, `'${field}' already exists. Please use a different value.`);
  }

  // ── Mongoose: Validation errors ───────────────────────────────────────────
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(422, 'Validation failed', messages);
  }

  // ── JWT errors ────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token. Please log in again.');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token expired. Please log in again.');
  }

  // Log full error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 ERROR:', err);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    statusCode: error.statusCode || 500,
    message: error.message || 'Internal Server Error',
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};