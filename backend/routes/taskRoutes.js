const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  completeTask, // Import new controller functions
  backlogTask,
  reactivateTask,
} = require('../controllers/taskController');

const authMiddleware = require('../middleware/auth'); // Import auth middleware

// --- Task Routes ---
// All routes below this point will use the authMiddleware

// Use the authMiddleware for ALL routes defined in this router
// This is a more concise way than adding it to each router.METHOD call
router.use(authMiddleware);

// @route   GET /api/tasks
// @desc    Get all tasks for the logged-in user (optional status filter)
// @access  Private
router.get('/', getTasks); // authMiddleware already applied by router.use()

// @route   POST /api/tasks
// @desc    Create a new task for the logged-in user
// @access  Private
router.post('/', createTask);

// @route   GET /api/tasks/:id
// @desc    Get a single task by ID for the logged-in user
// @access  Private
router.get('/:id', getTaskById);

// @route   PUT /api/tasks/:id
// @desc    Update a task by ID for the logged-in user (general details)
// @access  Private
router.put('/:id', updateTask);

// @route   DELETE /api/tasks/:id
// @desc    Delete a task by ID for the logged-in user
// @access  Private
router.delete('/:id', deleteTask);

// --- Specific Status Update Routes (using POST for actions) ---

// @route   POST /api/tasks/:id/complete
// @desc    Mark a task as completed
// @access  Private
router.post('/:id/complete', completeTask);

// @route   POST /api/tasks/:id/backlog
// @desc    Move a task to the backlog
// @access  Private
router.post('/:id/backlog', backlogTask);

// @route   POST /api/tasks/:id/reactivate
// @desc    Reactivate a task from completed or backlog
// @access  Private
router.post('/:id/reactivate', reactivateTask);


// Export the router
module.exports = router;