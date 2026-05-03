import User from '../models/user.model.js';
import Application from '../models/application.model.js';
import Job from '../models/job.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { deleteFromCloudinary } from '../config/cloudinary.js';

// ─────────────────────────────────────────────────────────────────────────────
// @route   PUT /api/users/profile
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
  const allowedCandidateFields = ['name', 'bio', 'skills', 'experience', 'location'];
  const allowedEmployerFields = ['name', 'company'];

  const user = await User.findById(req.user._id);
  const fields = user.role === 'employer' ? allowedEmployerFields : allowedCandidateFields;

  fields.forEach((field) => {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  });

  await user.save();

  res.status(200).json(new ApiResponse(200, 'Profile updated successfully', user));
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/users/upload-resume
// @access  Private — candidate only
// ─────────────────────────────────────────────────────────────────────────────
export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No resume file provided.');

  const user = await User.findById(req.user._id);

  // Delete old resume from Cloudinary if exists
  if (user.resume?.publicId) {
    await deleteFromCloudinary(user.resume.publicId, 'raw');
  }

  user.resume = {
    url: req.file.path,
    publicId: req.file.filename,
    originalName: req.file.originalname,
  };

  await user.save();

  res.status(200).json(new ApiResponse(200, 'Resume uploaded successfully', { resume: user.resume }));
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/users/upload-logo
// @access  Private — employer only
// ─────────────────────────────────────────────────────────────────────────────
export const uploadCompanyLogo = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No image file provided.');

  const user = await User.findById(req.user._id);

  // Delete old logo from Cloudinary
  if (user.company?.logo?.publicId) {
    await deleteFromCloudinary(user.company.logo.publicId, 'image');
  }

  if (!user.company) user.company = {};
  user.company.logo = {
    url: req.file.path,
    publicId: req.file.filename,
  };

  await user.save();

  res.status(200).json(
    new ApiResponse(200, 'Company logo uploaded successfully', { logo: user.company.logo })
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/users/save-job/:jobId
// @access  Private — candidate only
// ─────────────────────────────────────────────────────────────────────────────
export const toggleSaveJob = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const jobId = req.params.jobId;

  const alreadySaved = user.savedJobs.includes(jobId);

  if (alreadySaved) {
    user.savedJobs = user.savedJobs.filter((id) => id.toString() !== jobId);
  } else {
    const jobExists = await Job.exists({ _id: jobId });
    if (!jobExists) throw new ApiError(404, 'Job not found.');
    user.savedJobs.push(jobId);
  }

  await user.save();

  res.status(200).json(
    new ApiResponse(200, alreadySaved ? 'Job removed from saved' : 'Job saved successfully', {
      savedJobs: user.savedJobs,
      isSaved: !alreadySaved,
    })
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/users/saved-jobs
// @access  Private — candidate only
// ─────────────────────────────────────────────────────────────────────────────
export const getSavedJobs = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'savedJobs',
    select: 'title company location jobType salary deadline isActive',
  });

  res.status(200).json(new ApiResponse(200, 'Saved jobs fetched', user.savedJobs));
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// @route   GET /api/users/admin/all
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = role;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(filter).select('-password').sort('-createdAt').skip(skip).limit(limitNum),
    User.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, 'Users fetched successfully', {
      users,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    })
  );
});

// @route   PATCH /api/users/admin/:id/toggle-active
export const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');

  if (user.role === 'admin') throw new ApiError(403, 'Cannot deactivate another admin.');

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, {
      isActive: user.isActive,
    })
  );
});

// @route   GET /api/users/admin/stats
export const getAdminStats = asyncHandler(async (_req, res) => {
  const [totalUsers, totalJobs, totalApplications, roleStats] = await Promise.all([
    User.countDocuments(),
    Job.countDocuments(),
    Application.countDocuments(),
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
  ]);

  res.status(200).json(
    new ApiResponse(200, 'Admin stats fetched', {
      totalUsers,
      totalJobs,
      totalApplications,
      roleBreakdown: roleStats,
    })
  );
});