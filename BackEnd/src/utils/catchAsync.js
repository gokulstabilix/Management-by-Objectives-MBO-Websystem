/**
 * Wraps an async route handler so rejected promises
 * are automatically forwarded to the global error handler.
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
