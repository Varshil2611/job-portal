import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import User from '../models/user.model.js';

/**
 * Protect routes — verifies JWT from:
 *   1. httpOnly cookie (browser clients)
 *   2. Authorization: Bearer <token> header (mobile / Postman / Angular interceptors)
 */
export const protect = asyncHandler(async (req, _res, next) => {
  let token;

  // 1. Try cookie first
  if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }
  // 2. Fallback to Authorization header
  else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Access denied. Please log in.');
  }

  // Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Session expired. Please log in again.');
    }
    throw new ApiError(401, 'Invalid token. Please log in again.');
  }

  // Fetch user (exclude password)
  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    throw new ApiError(401, 'User belonging to this token no longer exists.');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated. Contact support.');
  }

  // Attach user to request for downstream use
  req.user = user;
  next();
});