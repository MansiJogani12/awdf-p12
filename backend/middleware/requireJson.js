// Rejects POST/PUT requests that are not sent as JSON
module.exports = (req, res, next) => {
  if (!req.is('application/json')) {
    return res.status(415).json({ error: 'Content-Type must be application/json' });
  }
  next();
};
