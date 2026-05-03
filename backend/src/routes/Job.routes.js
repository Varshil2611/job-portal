import { Router } from 'express';
import { body } from 'express-validator';
import * as jobController from '../controllers/job.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import validate from '../middleware/validate.middleware.js';

const router = Router();

const jobRules = [
  body('title').trim().notEmpty().withMessage('Job title is required').isLength({ max: 100 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ min: 50 }),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('jobType')
    .isIn(['full-time', 'part-time', 'remote', 'hybrid', 'contract', 'internship'])
    .withMessage('Invalid job type'),
  body('category')
    .isIn(['Technology', 'Marketing', 'Finance', 'Healthcare', 'Education', 'Design', 'Sales', 'Operations', 'HR', 'Other'])
    .withMessage('Invalid category'),
  body('experienceLevel')
    .isIn(['fresher', 'junior', 'mid', 'senior', 'lead'])
    .withMessage('Invalid experience level'),
  body('skillsRequired').isArray({ min: 1 }).withMessage('At least one skill is required'),
  body('deadline').isISO8601().withMessage('Deadline must be a valid date').toDate(),
];

// Public routes
router.get('/', jobController.getAllJobs);
router.get('/employer/my-jobs', protect, authorize('employer'), jobController.getMyPostedJobs);
router.get('/:id', jobController.getJobById);

// Protected routes
router.post('/', protect, authorize('employer'), jobRules, validate, jobController.createJob);
router.put('/:id', protect, authorize('employer', 'admin'), jobController.updateJob);
router.delete('/:id', protect, authorize('employer', 'admin'), jobController.deleteJob);

export default router;