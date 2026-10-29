const Task = require('../models/Task');
const { cache, enabled, keys } = require('../cache');
const taskEvents = require('../events');

const notFound = (res, id) => res.status(404).json({ error: `Task with id ${id} not found` });

// Every query is scoped to req.user.id (set by the auth middleware),
// so users can only ever see and change their own tasks.
// req.body has already been validated and sanitised by middleware/validate.js.

// Read-through cache: HIT -> return immediately, MISS -> query MongoDB, store, return.
// The X-Cache header makes HIT/MISS visible in Postman.
async function cached(res, key, query) {
  if (enabled) {
    const hit = cache.get(key);
    if (hit !== undefined) {
      res.set('X-Cache', 'HIT');
      return hit;
    }
  }
  const data = await query();
  if (enabled && data) cache.set(key, data);
  res.set('X-Cache', enabled ? 'MISS' : 'DISABLED');
  return data;
}

// Called after every successful write so stale data is never served
function invalidate(userId, taskId) {
  cache.del(keys.allTasks(userId));
  if (taskId) cache.del(keys.task(userId, taskId));
}

exports.getAllTasks = async (req, res, next) => {
  try {
    // .lean() returns plain JS objects instead of full Mongoose documents — faster to
    // build and safe to cache. The { user, createdAt } index (models/Task.js) backs this query.
    const tasks = await cached(res, keys.allTasks(req.user.id), () =>
      Task.find({ user: req.user.id }).sort({ createdAt: -1 }).lean()
    );
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await cached(res, keys.task(req.user.id, req.params.id), () =>
      Task.findOne({ _id: req.params.id, user: req.user.id }).lean()
    );
    if (!task) return notFound(res, req.params.id);
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const task = await Task.create({ ...req.body, user: req.user.id });
    invalidate(req.user.id);

    // 1. Respond first...
    console.log(`[API] Response sent at ${new Date().toISOString()}`);
    res.status(201).json(task);
    // 2. ...then hand the side effect to the background listener (listeners.js)
    taskEvents.emit('task-created', { task, user: req.user });
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!task) return notFound(res, req.params.id);
    invalidate(req.user.id, req.params.id);
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) return notFound(res, req.params.id);
    invalidate(req.user.id, req.params.id);
    res.status(200).json({ message: 'Task deleted', task });
    taskEvents.emit('task-deleted', { task, user: req.user });
  } catch (err) {
    next(err);
  }
};
