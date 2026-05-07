const AppError = require('../utils/AppError');
const { verifyAccessToken } = require('../utils/tokenUtils');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');

/**
 * Extracts and verifies the JWT access token from the Authorization header.
 * Attaches the full user document to req.user.
 */
const authenticate = catchAsync(async (req, _res, next) => {
  // 1. Extract token
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }

  // 2. Verify token
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Your session has expired. Please refresh your token.', 401));
    }
    return next(new AppError('Invalid token. Please log in again.', 401));
  }

  // 3. Check user still exists and is active
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Contact an administrator.', 403));
  }

  // 4. Attach user to request
  req.user = user;
  next();
});

module.exports = authenticate;
