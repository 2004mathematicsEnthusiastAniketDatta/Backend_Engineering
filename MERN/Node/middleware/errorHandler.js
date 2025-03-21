/**
 * Global error handling middleware
 */
export default function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  // Logging
  console.error(`[ERROR] ${err.name}: ${err.message}`);
  
  // Determine if we should show detailed error info
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Response format
  const errorResponse = {
    status,
    message: err.message,
    ...(isProduction ? {} : { stack: err.stack, error: err })
  };

  // Send error response
  res.status(statusCode).json(errorResponse);
}