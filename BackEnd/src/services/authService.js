const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
} = require('../utils/tokenUtils');

class AuthService {
  /**
   * Login: validate credentials, return tokens + user.
   */
  async login(email, password, res) {
    // 1. Find user with password
    const user = await userRepository.findByEmail(email, true);
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    // 2. Check active
    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Contact an administrator.', 403);
    }

    // 3. Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    // 4. Generate tokens
    const accessToken = signAccessToken(user._id, user.role);
    const refreshToken = signRefreshToken(user._id);

    // 5. Set refresh cookie
    setRefreshCookie(res, refreshToken);

    // 6. Return access token + sanitized user
    const userObj = user.toJSON();
    return { accessToken, user: userObj };
  }

  /**
   * Refresh: verify refresh cookie, issue new access token.
   */
  async refresh(refreshTokenCookie, res) {
    if (!refreshTokenCookie) {
      throw new AppError('No refresh token provided.', 401);
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshTokenCookie);
    } catch {
      throw new AppError('Invalid or expired refresh token. Please log in again.', 401);
    }

    const user = await userRepository.findById(decoded.id);
    if (!user || !user.isActive) {
      throw new AppError('User not found or deactivated.', 401);
    }

    const accessToken = signAccessToken(user._id, user.role);
    
    // Implement stateless refresh token rotation (sliding session)
    // Issuing a new refresh token with each request extends the session dynamically
    const newRefreshToken = signRefreshToken(user._id);
    setRefreshCookie(res, newRefreshToken);

    const userObj = user.toJSON();
    return { accessToken, user: userObj };
  }

  /**
   * Logout: clear the refresh cookie.
   */
  logout(res) {
    clearRefreshCookie(res);
  }

  /**
   * Change password: verify current, hash new.
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findById(userId, true);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError('Current password is incorrect.', 401);
    }

    user.passwordHash = newPassword; // pre-save hook will hash
    await user.save();
  }
}

module.exports = new AuthService();
