const NodeCache = require('node-cache');

// One shared, process-local cache. stdTTL = default time-to-live in seconds.
// useClones: false hands back the stored array as-is (it is plain JSON from .lean()),
// which avoids a deep copy on every hit.
const cache = new NodeCache({ stdTTL: Number(process.env.CACHE_TTL) || 60, useClones: false });

// Set CACHE_ENABLED=false in .env to measure the uncached response times
const enabled = process.env.CACHE_ENABLED !== 'false';

// Keys are per user: tasks are private since Practical 7, so a single global
// 'all_tasks' key would serve one user's tasks to another.
const keys = {
  allTasks: (userId) => `tasks:${userId}`,
  task: (userId, taskId) => `task:${userId}:${taskId}`,
};

module.exports = { cache, enabled, keys };
