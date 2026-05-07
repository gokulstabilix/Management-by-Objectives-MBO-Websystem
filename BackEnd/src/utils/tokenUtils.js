const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Sign a short-lived access token.
 */
const signAccessToken = (userId, role) =>
  jwt.sign({ id: userId, role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });

/**
 * Sign a long-lived refresh token.
 */
const signRefreshToken = (userId) =>
  jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });

/**
 * Verify an access token — throws on invalid/expired.
 */
const verifyAccessToken = (token) =>
  jwt.verify(token, env.JWT_ACCESS_SECRET);

/**
 * Verify a refresh token — throws on invalid/expired.
 */
const verifyRefreshToken = (token) =>
  jwt.verify(token, env.JWT_REFRESH_SECRET);

/**
 * Attach refresh token as HttpOnly cookie on the response.
 */
const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: env.JWT_REFRESH_COOKIE_MAX_AGE,
    path: '/',
  });
};

/**
 * Clear the refresh-token cookie (logout).
 */
const clearRefreshCookie = (res) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
    path: '/',
  });
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
};
