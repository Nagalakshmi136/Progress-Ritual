const mongoose = require('mongoose');

// Define the schema for a Task document
const taskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Task name is required'],
        trim: true
    },
    description: {
        type: String,
        required: false,
        trim: true
    },
    priority: {
        type: String,
        required: false,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium'
    },
    startTime: { // Planned start time/date
        type: Date,
        required: false
    },
    endTime: { // Planned end time/date (deadline)
        type: Date,
        required: false
    },
    status: { // Use a status field: active, completed, backlog
        type: String,
        enum: ['active', 'completed', 'backlog'],
        default: 'active',
        required: true
    },
    completedAt: { // Timestamp when status was changed to 'completed'
        type: Date,
        required: false
    },
    motivationText: {
        type: String,
        required: false,
        trim: true
    },
    rewardInfo: { // What the reward *is* (text description or type)
        type: String,
        required: false,
        trim: true
    },
    rewardUnlocked: { // Whether the reward can be revealed (based on completion logic)
        type: Boolean,
        default: false
    },
    repeatRule: { // How the task repeats
        type: String,
        required: false,
        enum: ['daily', 'weekly', 'monthly', 'none'], // Simple rules
        default: 'none'
    },
    voicePreference: { // Add voice preference as requested in roadmap
        type: Boolean, // Example: true for voice, false for regular notification
        required: false,
        default: false
    },

    // Add other fields here later (e.g., time spent, consistency counters)

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Mongoose will automatically manage createdAt and updatedAt
});
// Removed manual createdAt/updatedAt fields as timestamps option is cleaner


// --- Add Indexes for Performance ---
// Index on the user field to quickly find tasks for a specific user
taskSchema.index({ user: 1 });
// Index on user and status for querying tasks by status quickly
taskSchema.index({ user: 1, status: 1 });
// Index on user, status, and endTime/startTime if you often query tasks by time ranges for a user
taskSchema.index({ user: 1, status: 1, endTime: 1 });


// Create the Mongoose model
const Task = mongoose.model('Task', taskSchema);

// Export the model
module.exports = Task;