const express = require('express');
const router = express.Router(); // Use Express Router
const { registerUser, loginUser } = require('../controllers/authController'); // Import controller functions
const authMiddleware = require('../middleware/auth'); // Import middleware (for future use)

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser); // Link route to controller function

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginUser); // Link route to controller function

// @route   GET /api/auth/me (Example of a protected route - uncomment and use middleware later)
// @desc    Get authenticated user profile
// @access  Private
router.get('/me', authMiddleware, (req, res) => {
    // The authMiddleware adds req.user = userId
    // The actual logic to fetch the user will go into a controller function
    res.send('Protected route - User ID from token: ' + req.user);
});


// Export the router
module.exports = router;