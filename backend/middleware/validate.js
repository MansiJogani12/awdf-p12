// Server-side validation + sanitisation. Runs before the controller, so malformed
// requests never reach the database — even if a client skips frontend validation.

const PRIORITIES = ['low', 'medium', 'high'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const reject = (res, details) => res.status(400).json({ error: 'Validation failed', details });

// partial = true for PUT (fields optional), false for POST (title required)
const validateTask = (partial) => (req, res, next) => {
  const { title, description, completed, priority } = req.body;
  const details = {};
  const clean = {};

  if (title !== undefined || !partial) {
    if (typeof title !== 'string' || !title.trim()) details.title = 'title is required';
    else if (title.trim().length > 120) details.title = 'title must be 120 characters or fewer';
    else clean.title = title.trim();
  }
  if (description !== undefined) {
    if (typeof description !== 'string') details.description = 'description must be a string';
    else clean.description = description.trim().slice(0, 500);
  }
  if (completed !== undefined) {
    if (typeof completed !== 'boolean') details.completed = 'completed must be true or false';
    else clean.completed = completed;
  }
  if (priority !== undefined) {
    if (!PRIORITIES.includes(priority)) details.priority = 'priority must be low, medium or high';
    else clean.priority = priority;
  }

  if (Object.keys(details).length) return reject(res, details);
  // Only whitelisted, trimmed fields continue — anything else in the body is dropped
  req.body = clean;
  next();
};

exports.validateCreateTask = validateTask(false);
exports.validateUpdateTask = validateTask(true);

exports.validateCredentials = (req, res, next) => {
  const { email, password } = req.body;
  const details = {};

  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) details.email = 'a valid email is required';
  if (typeof password !== 'string' || password.length < 6) details.password = 'password must be at least 6 characters';

  if (Object.keys(details).length) return reject(res, details);
  req.body = { email: email.trim().toLowerCase(), password };
  next();
};
