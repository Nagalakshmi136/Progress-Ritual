const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables

// Get JWT Secret from environment variables
const jwtSecret = process.env.JWT_SECRET;

// Middleware function to protect routes
module.exports = function(req, res, next) {
  // Get token from header
  // Tokens are typically sent in the Authorization header like "Bearer TOKEN_STRING"
  const authHeader = req.header('Authorization');

  // Check if not token
  if (!authHeader) {
    // 401 Unauthorized - user needs to authenticate
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Split the header value to get the token part
  // Expecting format "Bearer TOKEN"
  const token = authHeader.split(' ')[1];

  // Verify token
  try {
    // jwt.verify decodes the token using the secret
    // If valid, it returns the payload (the object we signed, { id: user._id })
    const decoded = jwt.verify(token, jwtSecret);

    // Attach the user's ID from the token payload to the request object
    // This makes the user ID available in the route handlers that use this middleware
    req.user = decoded.id;

    // Call next() to proceed to the next middleware or the route handler
    next();

  } catch (err) {
    // If token is invalid (e.g., expired, wrong signature)
    // 401 Unauthorized - token is there but invalid
    res.status(401).json({ message: 'Token is not valid' });
  }
};