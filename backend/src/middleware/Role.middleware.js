import ApiError from '../utils/ApiError.js';

/**
 * Restrict access to specific roles.
 * Must be used AFTER the `protect` middleware (req.user must exist).
 *
 * Usage:
 *   router.post('/', protect, authorize('employer', 'admin'), createJob)
 *
 * @param  {...string} roles - allowed roles
 */
export const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Role '${req.user.role}' is not authorized to access this route. Required: ${roles.join(', ')}`
      );
    }
    next();
  };
};