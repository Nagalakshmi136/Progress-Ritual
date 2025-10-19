const { ApiError, NotFoundError, InternalServerError } = require('../utils/apiError'); // Import custom errors

// --- 404 Not Found Middleware ---
// This middleware runs if no route matches the request
const notFound = (req, res, next) => {
  // Create a NotFoundError with the request URL
  const error = new NotFoundError(`Not Found - ${req.originalUrl}`);
  // Pass the error to the next error handling middleware
  next(error);
};


// --- General Error Handling Middleware ---
// This middleware catches all errors passed via next(err) or thrown in async handlers
// It MUST have exactly 4 parameters: (err, req, res, next)
const errorHandler = (err, req, res, next) => {
  // Set default status code and message
  let statusCode = err.statusCode || 500; // Use error's status code, default to 500
  let message = err.message || 'Internal Server Error'; // Use error's message, default to generic 500 message

  // --- Log the Error ---
  // In development, log the full stack trace for debugging
  // In production, log less detail or use a dedicated logging service
  console.error('--- ERROR ---');
  console.error(`Status: ${statusCode}`);
  console.error(`Message: ${err.message}`); // Log the specific error message for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack:', err.stack); // Log stack trace in dev
  }
  console.error('-------------');


  // --- Handle Specific Mongoose Errors (Examples) ---
  // Mongoose bad ObjectId (e.g., /api/tasks/12345 - invalid ID format)
  if (err.name === 'CastError') {
    statusCode = 400; // Bad Request
    message = `Resource not found with id of ${err.value}`; // Provide helpful message
    err = new BadRequestError(message); // Create a new operational error
  }

  // Mongoose duplicate key error (e.g., registering with an email that already exists)
  // This is also handled by schema validation, but catching the raw DB error is good too
  if (err.code === 11000) { // MongoDB duplicate key error code
    const value = Object.values(err.keyValue)[0];
    statusCode = 400; // Bad Request
    message = `Duplicate field value: "${value}". Please use a different value.`;
    err = new BadRequestError(message); // Create a new operational error
  }

  // Mongoose validation errors (e.g., missing required field, invalid format)
  if (err.name === 'ValidationError') {
    // err.errors object contains details about each validation failure
    const messages = Object.values(err.errors).map(val => val.message);
    statusCode = 400; // Bad Request
    message = messages.join(', '); // Join all validation error messages
    err = new BadRequestError(message); // Create a new operational error
  }


  // --- Send Response to Client ---
  // In production, don't send sensitive error details or stack trace.
  // Only send the message and status code for operational errors (e.g., 400, 404, 401).
  // For non-operational errors (500), send a generic message unless it's a specific caught error like the Mongoose ones above.

  const isOperational = err.isOperational; // Check if it's a trusted operational error

  res.status(statusCode).json({
    status: err.status || 'error', // Use error's status ('fail' or 'error'), default to 'error'
    message: isOperational || process.env.NODE_ENV === 'development'
      ? message // Send specific message for operational errors or in development
      : 'Internal Server Error', // Send generic message for non-operational errors in production
    // Optional: Send stack trace only in development for debugging
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};


// Export the middleware functions
module.exports = {
  notFound,
  errorHandler
};