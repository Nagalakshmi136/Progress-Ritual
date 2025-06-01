const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables from .env

// Get JWT Secret from environment variables
const jwtSecret = process.env.JWT_SECRET;

/**
 * Generates a JSON Web Token (JWT) for a given user ID.
 * @param {string} id - The user ID (typically MongoDB ObjectId).
 * @returns {string} The generated JWT.
 */
const generateToken = (id) => {
  // Sign the token with the user's ID and your secret key
  // Set an expiration time (e.g., '30d' for 30 days, or '1h' for 1 hour)
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

module.exports = generateToken;