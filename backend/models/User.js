const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Library for hashing passwords

// Define the schema for a User document
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'], // Make email required
        unique: true, // Ensure emails are unique
        lowercase: true, // Store emails in lowercase
        trim: true, // Remove whitespace
        // Basic email format validation (more robust validation can be added later)
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'], // Make password required
        minlength: [6, 'Password must be at least 6 characters long'], // Minimum password length
        select: false // Do NOT return the password by default in queries
    },
    username: { // Optional username field
        type: String,
        required: false,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now // Automatically add creation timestamp
    }
});

// --- Mongoose Middleware (Hooks) ---
// This function runs BEFORE a user is saved to the database
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next(); // If password hasn't changed, move on
    }

    // Generate a salt (random string to add complexity to hash)
    const salt = await bcrypt.genSalt(10); // 10 is a good default strength

    // Hash the password using the generated salt
    const hashedPassword = await bcrypt.hash(this.password, salt);

    // Replace the plain text password with the hashed version
    this.password = hashedPassword;

    next(); // Move to the next middleware or save operation
});

// --- Mongoose Schema Methods ---
// Method to compare a candidate password (from login attempt) with the stored hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
    // bcrypt.compare takes the plain text password and the hash to compare against
    // It returns true if they match, false otherwise.
    // 'this.password' here works because we explicitly select the password in the login route
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
};


// Create the Mongoose model from the schema
const User = mongoose.model('User', userSchema);

// Export the model
module.exports = User;