import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ApiError from '../utils/ApiError.js';

// Create uploads folder if it doesn't exist
const uploadDir = 'uploads/resumes';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const logoDir = 'uploads/logos';
if (!fs.existsSync(logoDir)) {
  fs.mkdirSync(logoDir, { recursive: true });
}

// ── Disk storage for resumes ──────────────────────────────────────────────────
const resumeStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/resumes');
  },
  filename: (_req, file, cb) => {
    const uniqueName = `resume_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// ── Disk storage for logos ────────────────────────────────────────────────────
const logoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/logos');
  },
  filename: (_req, file, cb) => {
    const uniqueName = `logo_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

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

export const uploadResume = multer({
  storage: resumeStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('resume');

export const uploadLogo = multer({
  storage: logoStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
}).single('logo');

// Wrap multer errors → Express error handler
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