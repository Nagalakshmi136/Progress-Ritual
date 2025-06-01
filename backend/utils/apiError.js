/**
 * Base class for API errors.
 * All custom API errors should extend this class.
 */
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message); // Call the parent Error class constructor

    this.statusCode = statusCode; // HTTP status code for the error
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // 'fail' for 4xx, 'error' for 5xx
    this.isOperational = true; // Flag to identify trusted, operational errors (errors we expected and handled)

    // Capture the stack trace, excluding the constructor call
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error for requests to resources that do not exist (404 Not Found).
 */
class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * Error for invalid client input (400 Bad Request).
 */
class BadRequestError extends ApiError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

/**
 * Error for authentication failures (401 Unauthorized).
 */
class UnauthorizedError extends ApiError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}

/**
 * Error for forbidden actions (403 Forbidden).
 */
class ForbiddenError extends ApiError {
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}

/**
 * Error for unexpected server issues (500 Internal Server Error).
 * These are usually non-operational errors (bugs in code) and should not expose details to the client.
 */
class InternalServerError extends ApiError {
    constructor(message = 'Internal server error') {
        super(message, 500);
        this.isOperational = false; // Mark as non-operational
    }
}


// Export the custom error classes
module.exports = {
  ApiError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError
};