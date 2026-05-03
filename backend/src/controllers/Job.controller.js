import Job from '../models/job.model.js';
import Application from '../models/application.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/jobs
// @access  Public  — search, filter, paginate
// ─────────────────────────────────────────────────────────────────────────────
export const getAllJobs = asyncHandler(async (req, res) => {
  const {
    keyword,
    location,
    jobType,
    category,
    experienceLevel,
    salaryMin,
    salaryMax,
    page = 1,
    limit = 10,
    sort = '-createdAt',
  } = req.query;

  const filter = {};

  // Keyword search (title, description, skills)
  if (keyword) {
    filter.$text = { $search: keyword };
  }

  if (location) filter.location = { $regex: location, $options: 'i' };
  if (jobType) filter.jobType = jobType;
  if (category) filter.category = category;
  if (experienceLevel) filter.experienceLevel = experienceLevel;
  
  if (salaryMin || salaryMax) {
  filter.salary = {};

  if (salaryMin) filter.salary.$gte = Number(salaryMin);
  if (salaryMax) filter.salary.$lte = Number(salaryMax);
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .populate('postedBy', 'name company.name company.logo')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Job.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, 'Jobs fetched successfully', {
      jobs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    })
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/jobs/:id
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate('postedBy', 'name email company');

  if (!job) throw new ApiError(404, 'Job not found.');

  // Increment view count (fire-and-forget)
  Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();

  res.status(200).json(new ApiResponse(200, 'Job fetched successfully', job));
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/jobs
// @access  Private — employer only
// ─────────────────────────────────────────────────────────────────────────────
export const createJob = asyncHandler(async (req, res) => {
  const {
    title, description, requirements, location,
    jobType, category, experienceLevel, salary,
    skillsRequired, deadline,
  } = req.body;

  const job = await Job.create({
    title,
    description,
    requirements,
    location,
    jobType,
    category,
    experienceLevel,
    salary,
    skillsRequired,
    deadline,
    postedBy: req.user._id,
    company: {
      name: req.user.company?.name,
      logo: req.user.company?.logo?.url,
      website: req.user.company?.website,
    },
  });

  res.status(201).json(new ApiResponse(201, 'Job posted successfully', job));
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   PUT /api/jobs/:id
// @access  Private — employer (own job) or admin
// ─────────────────────────────────────────────────────────────────────────────
export const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found.');

  // Only the posting employer or admin can update
  const isOwner = job.postedBy.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to update this job.');
  }

  const allowedFields = [
    'title', 'description', 'requirements', 'location',
    'jobType', 'category', 'experienceLevel', 'salary',
    'skillsRequired', 'deadline', 'isActive',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) job[field] = req.body[field];
  });

  await job.save();

  res.status(200).json(new ApiResponse(200, 'Job updated successfully', job));
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   DELETE /api/jobs/:id
// @access  Private — employer (own job) or admin
// ─────────────────────────────────────────────────────────────────────────────
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found.');

  const isOwner = job.postedBy.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to delete this job.');
  }

  // Delete all applications for this job
  await Application.deleteMany({ job: job._id });
  await job.deleteOne();

  res.status(200).json(new ApiResponse(200, 'Job and its applications deleted successfully'));
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/jobs/employer/my-jobs
// @access  Private — employer only
// ─────────────────────────────────────────────────────────────────────────────
export const getMyPostedJobs = asyncHandler(async (req, res) => {
  // Bypass the auto-filter pre-hook by directly using Model.find with postedBy
  const jobs = await Job.find({ postedBy: req.user._id })
    .sort('-createdAt')
    .lean();

  res.status(200).json(
    new ApiResponse(200, 'Your posted jobs fetched successfully', {
      jobs,
      total: jobs.length,
    })
  );
});