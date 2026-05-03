import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendTokenResponse } from '../utils/generateToken.js';

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Prevent direct admin registration through API
  if (role === 'admin') {
    throw new ApiError(403, 'Admin accounts cannot be created through registration.');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const user = await User.create({ name, email, password, role: role || 'candidate' });

  sendTokenResponse(res, user, 201, 'Account created successfully');
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Explicitly select password (select: false in schema)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated. Contact support.');
  }

  sendTokenResponse(res, user, 200, 'Logged in successfully');
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/logout
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  res.status(200).json(new ApiResponse(200, 'Logged out successfully'));
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/auth/me
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  // req.user is attached by protect middleware — already fetched from DB
  res.status(200).json(new ApiResponse(200, 'User fetched successfully', req.user));
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/auth/change-password
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(401, 'Current password is incorrect.');
  }

  if (currentPassword === newPassword) {
    throw new ApiError(400, 'New password must be different from current password.');
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(res, user, 200, 'Password changed successfully');
});