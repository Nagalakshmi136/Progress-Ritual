const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  completeTask,
  backlogTask,
  reactivateTask,
  extendTask,
  getTaskStats
} = require('../controllers/taskController');
const authMiddleware = require('../middleware/auth');

// Protect all task-related routes
router.use(authMiddleware);

// --- Main Routes ---
router.route('/')
  .get(getTasks)
  .post(createTask);

// New dedicated route for statistics
router.get('/stats', getTaskStats);

// --- Routes for a specific task ID ---
router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

// --- Action-based Routes for a specific task ID ---
router.post('/:id/complete', completeTask);
router.post('/:id/backlog', backlogTask);
router.post('/:id/reactivate', reactivateTask);
router.post('/:id/extend', extendTask);

module.exports = router;