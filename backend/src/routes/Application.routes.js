import { Router } from 'express';
import * as appController from '../controllers/application.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { uploadResume, handleMulterError } from '../middleware/upload.middleware.js';

const router = Router();

// All application routes require login
router.use(protect);

// Candidate routes
router.post(
  '/apply/:jobId',
  authorize('candidate'),
  handleMulterError(uploadResume),
  appController.applyToJob
);
router.get('/my', authorize('candidate'), appController.getMyApplications);
router.delete('/:id', authorize('candidate'), appController.withdrawApplication);

// Employer / Admin routes
router.get('/job/:jobId', authorize('employer', 'admin'), appController.getApplicantsForJob);
router.patch('/:id/status', authorize('employer', 'admin'), appController.updateApplicationStatus);

export default router;