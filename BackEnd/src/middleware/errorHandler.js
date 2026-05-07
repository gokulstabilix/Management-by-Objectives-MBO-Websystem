const AppError = require('../utils/AppError');

/**
 * Global error-handling middleware.
 * Distinguishes operational errors (AppError) from unexpected crashes.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // ── Mongoose-specific error transformations ──
  // Duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(', ');
    err = new AppError(`Duplicate value for field(s): ${field}. Please use a different value.`, 400);
  }

  // Validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    err = new AppError(messages.join('; '), 400);
  }

  // Cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    err = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  // ── Response ──
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }

  // Production: only send operational error details
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Programming / unknown error — don't leak details
  console.error('💥 UNEXPECTED ERROR:', err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong.',
  });
};

/**
 * 404 catch-all for undefined routes.
 */
const notFound = (req, _res, next) => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server.`, 404));
};

module.exports = { errorHandler, notFound };
