const jwt = require('jsonwebtoken');

// Verifies "Authorization: Bearer <token>" and attaches the decoded payload to req.user
module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    // jwt.verify throws on a bad signature or an expired token — answer 401, don't crash
    const error = err.name === 'TokenExpiredError' ? 'Token expired, please log in again' : 'Invalid token';
    res.status(401).json({ error });
  }
};
