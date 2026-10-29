const express = require('express');
const requireJson = require('../middleware/requireJson');
const validateId = require('../middleware/validateId');
const { validateCreateTask, validateUpdateTask } = require('../middleware/validate');
const {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

const router = express.Router();

// The auth middleware is applied to this whole router in server.js.
// Order per route: [validate id] -> [require JSON] -> [validate body] -> controller
router.get('/', getAllTasks);
router.get('/:id', validateId, getTask);
router.post('/', requireJson, validateCreateTask, createTask);
router.put('/:id', validateId, requireJson, validateUpdateTask, updateTask);
router.delete('/:id', validateId, deleteTask);

module.exports = router;
