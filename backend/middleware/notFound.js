// Structured JSON 404 for routes that do not exist
module.exports = (req, res) => {
  res.status(404).json({ error: 'Route not found', method: req.method, path: req.originalUrl });
};
