const { ValidationError } = require('sequelize');

/**
 * Custom error handler middleware
 * Formats errors consistently for API responses
 */
const errorHandler = (err, req, res, next) => {
  console.error('\x1b[31m%s\x1b[0m', '[ERROR]', err);
  
  // Log request information for debugging
  console.error(
    '\x1b[33m%s\x1b[0m',
    `[REQUEST] ${req.method} ${req.originalUrl}`,
    req.body
  );
  
  // Handle Sequelize validation errors
  if (err instanceof ValidationError) {
    return res.status(400).json({
      message: 'Validation Error',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      message: 'Invalid token. Please log in again.' 
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      message: 'Token expired. Please log in again.' 
    });
  }
  
  // Default error response
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
