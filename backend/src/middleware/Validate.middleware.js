import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Run after express-validator chains.
 * Collects all errors and throws ApiError so global handler formats them.
 *
 * Usage:
 *   router.post('/register', registerValidation, validate, authController.register)
 */
const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    throw new ApiError(422, messages[0], messages);
  }
  next();
};

export default validate;