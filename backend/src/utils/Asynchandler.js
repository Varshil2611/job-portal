/**
 * Wraps async route handlers so we don't need try/catch in every controller.
 * Any thrown error (including ApiError) is passed to Express's next(),
 * which routes it to our global error handler.
 *
 * Usage:
 *   router.get('/route', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;