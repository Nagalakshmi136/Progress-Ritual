const User = require('../models/User');
const generateToken = require('../utils/generateToken');
// Import the custom error classes
const { BadRequestError, UnauthorizedError } = require('../utils/apiError');
const asyncHandler = require('express-async-handler');


// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// Wrap the async function with asyncHandler
const registerUser = asyncHandler(async (req, res) => {
    const { email, password, username } = req.body;

    // --- Input Validation ---
    if (!email || !password) {
        // Throw a custom BadRequestError instead of sending a response directly
        throw new BadRequestError('Please enter all required fields (email, password).');
    }
    if (password.length < 6) {
        throw new BadRequestError('Password must be at least 6 characters long.');
    }

    // Check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new BadRequestError('User with that email already exists.');
    }

    // Create new user instance (password hashing happens in User model's pre-save hook)
    const newUser = new User({
        email,
        password,
        username,
    });
    console.log('New user created:', newUser);
    // Save user to database (async operation - asyncHandler catches errors here)
    await newUser.save();

    // Respond with success and token
    res.status(201).json({
        token: generateToken(newUser._id),
        user: {
            id: newUser._id,
            email: newUser.email,
            username: newUser.username,
        },
        message: 'User registered successfully.'
    });
});


// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
// Wrap the async function with asyncHandler
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // --- Input Validation ---
    if (!email || !password) {
        throw new BadRequestError('Please enter email and password.');
    }

    // Find user by email, explicitly including password
    const user = await User.findOne({ email }).select('+password');

    // If user not found or passwords don't match, use UnauthorizedError or BadRequestError
    // Using BadRequestError with a generic message is often preferred for security
    if (!user || !(await user.comparePassword(password))) {
        throw new BadRequestError('Invalid credentials.'); // Generic message
    }

    // Respond with success and token
    res.status(200).json({
        token: generateToken(user._id),
        user: {
            id: user._id,
            email: user.email,
            username: user.username,
        },
        message: 'Login successful.'
    });
});


// Export the controller functions
module.exports = {
    registerUser,
    loginUser,
};