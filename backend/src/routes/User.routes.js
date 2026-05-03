import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { uploadResume, uploadLogo, handleMulterError } from '../middleware/upload.middleware.js';

const router = Router();

router.use(protect);

// Profile
router.put('/profile', userController.updateProfile);

// Resume (candidate only)
router.post(
  '/upload-resume',
  authorize('candidate'),
  handleMulterError(uploadResume),
  userController.uploadResume
);

// Company logo (employer only)
router.post(
  '/upload-logo',
  authorize('employer'),
  handleMulterError(uploadLogo),
  userController.uploadCompanyLogo
);

// Saved jobs (candidate)
router.post('/save-job/:jobId', authorize('candidate'), userController.toggleSaveJob);
router.get('/saved-jobs', authorize('candidate'), userController.getSavedJobs);

// Admin routes
router.get('/admin/all', authorize('admin'), userController.getAllUsers);
router.get('/admin/stats', authorize('admin'), userController.getAdminStats);
router.patch('/admin/:id/toggle-active', authorize('admin'), userController.toggleUserActive);

export default router;