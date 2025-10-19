const jwt = require('jsonwebtoken');
require('dotenv').config(); 
// Get JWT Secret from environment variables
const jwtSecret = process.env.JWT_SECRET;

// Middleware function to protect routes
const User = require('../models/User');
module.exports = async function (req, res, next) {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtSecret);

    // Fetch full user document (excluding password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user; // Attach entire user object
    next();

  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};