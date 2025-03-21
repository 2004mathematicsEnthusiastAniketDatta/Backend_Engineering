/**
 * 404 Not Found handler
 */
export default function notFoundHandler(req, res, next) {
  const error = new Error(`Resource not found - ${req.originalUrl}`);
  error.statusCode = 404;
  error.status = 'fail';
  next(error);
}