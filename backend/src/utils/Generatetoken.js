import jwt from 'jsonwebtoken';

/**
 * Generate a signed JWT access token for a user.
 * @param {string} userId - MongoDB ObjectId as string
 * @returns {string} JWT token
 */
export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Send JWT as an httpOnly cookie AND in the JSON response body.
 * httpOnly cookie   → protects against XSS (Angular can't read it, browser auto-sends it)
 * response body     → useful for mobile clients / Angular's HttpClient interceptors
 *
 * @param {object} res   - Express response object
 * @param {object} user  - Mongoose user document
 */
export const sendTokenResponse = (res, user, statusCode, message) => {
  const token = generateAccessToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  };

  res.cookie('accessToken', token, cookieOptions);

  // Remove password before sending user data
  const userObj = user.toObject();
  delete userObj.password;

  res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data: { user: userObj, token },
  });
};