import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
import ApiError from '../utils/ApiError.js';

// ─── Cloudinary storage for resumes (PDF only) ────────────────────────────────
const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: `job-portal/resumes/${req.user._id}`,
    resource_type: 'raw',           // 'raw' is required for non-image files like PDF
    allowed_formats: ['pdf'],
    public_id: `resume_${Date.now()}`,
    use_filename: false,
  }),
});

// ─── Cloudinary storage for company logos / profile pictures (images) ─────────
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, _file) => ({
    folder: `job-portal/images/${req.user._id}`,
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'limit' }],
    public_id: `img_${Date.now()}`,
  }),
});

// ─── File filter helpers ──────────────────────────────────────────────────────
const pdfFilter = (_req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only PDF files are allowed for resume upload'), false);
  }
};

const imageFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only image files (JPG, PNG, WebP) are allowed'), false);
  }
};

// ─── Exported middleware ───────────────────────────────────────────────────────
export const uploadResume = multer({
  storage: resumeStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
}).single('resume');

export const uploadLogo = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB max
}).single('logo');

/**
 * Wrap multer middleware to forward errors to Express's error handler.
 * Without this, multer errors bypass the global error handler.
 */
export const handleMulterError = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new ApiError(400, 'File too large. Maximum size exceeded.'));
      }
      return next(new ApiError(400, `Upload error: ${err.message}`));
    }
    if (err) return next(err);
    next();
  });
};