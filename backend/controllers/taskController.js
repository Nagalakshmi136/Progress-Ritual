const Task = require('../models/Task');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/apiError');
const asyncHandler = require('express-async-handler');


// @desc    Get all tasks for the logged-in user, with optional status filter
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
    // Get the optional status filter from query parameters (e.g., /api/tasks?status=completed)
    const { status } = req.query; // status will be a string or undefined

    // Build the query object: always filter by user, optionally filter by status
    const query = { user: req.user };
    if (status) {
        // Validate that the provided status is one of the allowed enum values
        const allowedStatuses = ['active', 'completed', 'backlog'];
        if (!allowedStatuses.includes(status)) {
            throw new BadRequestError(`Invalid status filter: "${status}". Allowed values are ${allowedStatuses.join(', ')}.`);
        }
        query.status = status;
    }

    // Find tasks based on the query. Sort by createdAt descending (newest first).
    // You might want a different sort order, e.g., by startTime for active tasks.
    const tasks = await Task.find(query).sort('-createdAt');

    res.status(200).json({
        tasks,
        count: tasks.length,
        message: 'Tasks fetched successfully.'
    });
});

// @desc    Get a single task by ID for the logged-in user
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = asyncHandler(async (req, res) => {
    const taskId = req.params.id;

    // Find the task by ID AND ensure it belongs to the authenticated user
    const task = await Task.findOne({ _id: taskId, user: req.user });

    if (!task) {
        // Use NotFoundError if the specific task ID for this user doesn't exist
        throw new NotFoundError(`Task not found with id ${taskId}`);
    }

    res.status(200).json({
        task,
        message: 'Task fetched successfully.'
    });
});

// @desc    Create a new task for the logged-in user
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
    // Destructure task fields from the request body
    // Only allow specific fields to be set during creation
    const { name, description, priority, startTime, endTime, motivationText, rewardInfo, repeatRule, voicePreference } = req.body;

    // --- Input Validation (Basic) ---
    if (!name) {
        throw new BadRequestError('Task name is required.');
    }
    // Mongoose schema validation will handle other types/formats and enum values

    // Create a new Task instance
    const newTask = new Task({
        user: req.user, // Assign the task to the authenticated user
        name,
        description,
        priority,
        startTime,
        endTime,
        motivationText,
        rewardInfo,
        repeatRule,
        voicePreference,
        status: 'active', // New tasks are active by default
        // completedAt is not set on creation
        // rewardUnlocked defaults to false
    });

    // Save the new task to the database
    const createdTask = await newTask.save();

    res.status(201).json({
        task: createdTask,
        message: 'Task created successfully.'
    });
});

// @desc    Update a task by ID for the logged-in user
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    // Get update fields from request body. BE CAREFUL which fields you allow updates for.
    // For instance, user ID should NOT be updatable this way.
    const { name, description, priority, startTime, endTime, motivationText, rewardInfo, repeatRule, voicePreference } = req.body;
    // status update should be handled by specific endpoints like /complete or /backlog, NOT via PUT

    // Find the task by ID AND ensure it belongs to the authenticated user
    // Use findById to get the document first so Mongoose hooks (like pre('save')) work
    let task = await Task.findOne({ _id: taskId, user: req.user });

    if (!task) {
        throw new NotFoundError(`Task not found with id ${taskId}`);
    }

    // --- Apply Updates for Allowed Fields ---
    // Update only the fields that were provided in the request body and are allowed
    if (name !== undefined) task.name = name;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (startTime !== undefined) task.startTime = startTime;
    if (endTime !== undefined) task.endTime = endTime;
    if (motivationText !== undefined) task.motivationText = motivationText;
    if (rewardInfo !== undefined) task.rewardInfo = rewardInfo;
    if (repeatRule !== undefined) task.repeatRule = repeatRule;
    if (voicePreference !== undefined) task.voicePreference = voicePreference;

    // status and completedAt should ONLY be updated via /complete or /backlog endpoints
    // isComplete is replaced by status


    // Save the updated task
    const updatedTask = await task.save(); // Mongoose timestamps will update `updatedAt`

    res.status(200).json({
        task: updatedTask,
        message: 'Task updated successfully.'
    });
});

// @desc    Delete a task by ID for the logged-in user
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
    const taskId = req.params.id;

    // Find and delete the task by ID AND ensure it belongs to the authenticated user
    // findOneAndDelete is efficient and still allows checking if the document existed
    const task = await Task.findOneAndDelete({ _id: taskId, user: req.user });

    if (!task) {
        throw new NotFoundError(`Task not found with id ${taskId}`);
    }

    res.status(200).json({
        message: 'Task removed successfully.'
    });
});

// --- Specific Task Status Update Endpoints ---

// @desc    Mark a task as completed
// @route   POST /api/tasks/:id/complete
// @access  Private
const completeTask = asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    // Optional: Get feedback or completion time from body if needed for logging
    // const { actualCompletionTime } = req.body;

    // Find the task by ID and ensure it belongs to the user
    let task = await Task.findOne({ _id: taskId, user: req.user });

    if (!task) {
        throw new NotFoundError(`Task not found with id ${taskId}`);
    }

    // Prevent completing a task that's already completed or in backlog
    if (task.status === 'completed' || task.status === 'backlog') {
        throw new BadRequestError(`Task is already in status: ${task.status}. Cannot mark as complete.`);
    }

    // Update status and completion timestamp
    task.status = 'completed';
    task.completedAt = new Date(); // Set completion time
    task.rewardUnlocked = true; // Assuming reward unlocks on successful completion
    // You could add logic here to compare completedAt to endTime for 'on time' rewards

    // Save the updated task
    const updatedTask = await task.save(); // Mongoose timestamps will update `updatedAt`

    res.status(200).json({
        task: updatedTask,
        message: 'Task marked as completed.'
    });
});

// @desc    Move a task to the backlog
// @route   POST /api/tasks/:id/backlog
// @access  Private
const backlogTask = asyncHandler(async (req, res) => {
    const taskId = req.params.id;

    // Find the task by ID and ensure it belongs to the user
    let task = await Task.findOne({ _id: taskId, user: req.user });

    if (!task) {
        throw new NotFoundError(`Task not found with id ${taskId}`);
    }

    // Prevent moving a task that's already completed or already in backlog
    if (task.status === 'completed' || task.status === 'backlog') {
        throw new BadRequestError(`Task is already in status: ${task.status}. Cannot move to backlog.`);
    }


    // Update status
    task.status = 'backlog';
    task.completedAt = undefined; // Clear completion time if it somehow had one
    task.rewardUnlocked = false; // Rewards typically not unlocked from backlog

    // Save the updated task
    const updatedTask = await task.save(); // Mongoose timestamps will update `updatedAt`

    res.status(200).json({
        task: updatedTask,
        message: 'Task moved to backlog.'
    });
});

// @desc    Reactivate a task from completed or backlog
// @route   POST /api/tasks/:id/reactivate
// @access  Private
const reactivateTask = asyncHandler(async (req, res) => {
    const taskId = req.params.id;

    let task = await Task.findOne({ _id: taskId, user: req.user });

    if (!task) {
        throw new NotFoundError(`Task not found with id ${taskId}`);
    }

    // Only reactivate if it's completed or in backlog
    if (task.status === 'active') {
        throw new BadRequestError(`Task is already active.`);
    }

    // Update status
    task.status = 'active';
    task.completedAt = undefined; // Clear completion time
    task.rewardUnlocked = false; // Reward is no longer unlocked

    // Save the updated task
    const reactivatedTask = await task.save();

    res.status(200).json({
        task: reactivatedTask,
        message: 'Task reactivated.'
    });
});


// Export the controller functions
module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    backlogTask,
    reactivateTask, // Added reactivate based on common flow
};