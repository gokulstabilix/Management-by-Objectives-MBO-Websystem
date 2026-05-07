const AppError = require('../utils/AppError');

/**
 * Factory function: returns middleware that restricts
 * access to users whose role is in the allowed list.
 *
 * Usage: authorize('admin', 'hr')
 */
const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401));
  }

  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action.', 403));
  }

  next();
};

module.exports = authorize;
