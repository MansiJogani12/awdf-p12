// The Express app on its own (no database connection, no listen()).
// server.js starts it for real; tests import it directly with supertest.
const express = require('express');
const cors = require('cors');
const logger = require('./middleware/logger');
const auth = require('./middleware/auth');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const taskRoutes = require('./routes/tasks');
const authRoutes = require('./routes/auth');
const { cache, enabled: cacheEnabled } = require('./cache');

// Register event listeners once at startup (without this, emit() does nothing)
require('./listeners');

const app = express();

// 0. CORS — lets the React dev server (localhost:5173) call this API
app.use(cors());

// 1. Body parser — without this req.body is undefined on POST/PUT
app.use(express.json());

// 2. Global request logger (kept quiet during tests)
if (process.env.NODE_ENV !== 'test') app.use(logger);

// 3. Routes
app.get('/', (req, res) => res.json({ message: 'Task Manager API is running' }));
app.use('/auth', authRoutes);
// Every /tasks route is protected: [auth] -> [validation] -> controller
app.use('/tasks', auth, taskRoutes);

// Cache hit/miss counters (node-cache tracks these for us)
app.get('/debug/cache', (req, res) => {
  const { hits, misses, keys } = cache.getStats();
  const total = hits + misses;
  res.json({
    enabled: cacheEnabled,
    ttlSeconds: cache.options.stdTTL,
    hits,
    misses,
    hitRate: total ? `${((hits / total) * 100).toFixed(1)}%` : 'n/a',
    keys,
    cachedKeys: cache.keys(),
  });
});

// Deliberately throws so the global error handler can be demonstrated
app.get('/debug/error', () => {
  throw new Error('Deliberate test error');
});

// 4. 404 for anything that did not match a route
app.use(notFound);

// 5. Global error handler — must be registered LAST
app.use(errorHandler);

module.exports = app;
