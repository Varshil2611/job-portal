import Application from "../models/application.model.js";
import Job from "../models/job.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { deleteFromCloudinary } from "../config/cloudinary.js";

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/applications/apply/:jobId
// @access  Private — candidate only
// ─────────────────────────────────────────────────────────────────────────────
export const applyToJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { coverLetter } = req.body;

  // Check job exists and is active
  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, "Job not found.");

  // Check already applied
  const alreadyApplied = await Application.findOne({
    job: jobId,
    applicant: req.user._id,
  });
  if (alreadyApplied) {
    throw new ApiError(409, "You have already applied for this job.");
  }

  // Resume must be uploaded via Multer (req.file) or use profile resume
  let resumeData;

if (req.file) {
  resumeData = {
    url: `uploads/resumes/${req.file.filename}`,
    publicId: req.file.filename,
    originalName: req.file.originalname,
  };
} else if (req.user.resume?.url) {
  resumeData = req.user.resume;
} else {
  throw new ApiError(400, 'Please upload a resume or add one to your profile first.');
}

  const application = await Application.create({
    job: jobId,
    applicant: req.user._id,
    resume: resumeData,
    coverLetter,
    statusHistory: [{ status: "pending", changedBy: req.user._id }],
  });

  await application.populate([
    { path: "job", select: "title company location" },
    { path: "applicant", select: "name email" },
  ]);

  res
    .status(201)
    .json(
      new ApiResponse(201, "Application submitted successfully", application),
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/applications/my
// @access  Private — candidate only (their own applications)
// ─────────────────────────────────────────────────────────────────────────────
export const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ applicant: req.user._id })
    .populate("job", "title company location jobType salary deadline isActive")
    .sort("-createdAt")
    .lean();

  res.status(200).json(
    new ApiResponse(200, "Applications fetched successfully", {
      applications,
      total: applications.length,
    }),
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/applications/job/:jobId
// @access  Private — employer (who posted the job) or admin
// ─────────────────────────────────────────────────────────────────────────────
export const getApplicantsForJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) throw new ApiError(404, "Job not found.");

  const isOwner = job.postedBy.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    throw new ApiError(403, "Not authorized to view applicants for this job.");
  }

  const { status, page = 1, limit = 20 } = req.query;
  const filter = { job: req.params.jobId };
  if (status) filter.status = status;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Number(limit));
  const skip = (pageNum - 1) * limitNum;

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate("applicant", "name email skills experience location resume bio")
      .sort("-createdAt")
      .skip(skip)
      .limit(limitNum),
    Application.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, "Applicants fetched successfully", {
      applications,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    }),
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/applications/:id/status
// @access  Private — employer (who posted job) or admin
// ─────────────────────────────────────────────────────────────────────────────
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, employerNote } = req.body;

  const validStatuses = [
    "pending",
    "reviewing",
    "shortlisted",
    "accepted",
    "rejected",
  ];
  if (!validStatuses.includes(status)) {
    throw new ApiError(
      400,
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    );
  }

  const application = await Application.findById(req.params.id).populate(
    "job",
    "postedBy",
  );
  if (!application) throw new ApiError(404, "Application not found.");

  const isOwner =
    application.job.postedBy.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    throw new ApiError(403, "Not authorized to update this application.");
  }

  application.status = status;
  application.statusHistory.push({ status, changedBy: req.user._id });
  if (employerNote) application.employerNote = employerNote;

  await application.save();

  res
    .status(200)
    .json(new ApiResponse(200, "Application status updated", application));
});

// ─────────────────────────────────────────────────────────────────────────────
// @route   DELETE /api/applications/:id
// @access  Private — candidate withdraws their own application
// ─────────────────────────────────────────────────────────────────────────────
export const withdrawApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) throw new ApiError(404, "Application not found.");

  const isOwner = application.applicant.toString() === req.user._id.toString();
  if (!isOwner) {
    throw new ApiError(403, "You can only withdraw your own applications.");
  }

  if (['shortlisted', 'reviewing', 'accepted', 'rejected'].includes(application.status)) {
    throw new ApiError(
      400,
      "Cannot withdraw an application that has already been decided.",
    );
  }

  await application.deleteOne();

  res
    .status(200)
    .json(new ApiResponse(200, "Application withdrawn successfully"));
});
