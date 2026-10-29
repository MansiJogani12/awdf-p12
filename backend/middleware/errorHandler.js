// Four arguments tell Express this is an error-handling middleware.
// The stack trace is logged on the server but never sent to the client.
module.exports = (err, req, res, next) => {
  // Mongoose schema validation failed -> clean, structured 400
  if (err.name === 'ValidationError') {
    const details = Object.fromEntries(
      Object.entries(err.errors).map(([field, e]) => [field, e.message])
    );
    return res.status(400).json({ error: 'Validation failed', details });
  }

  // A value could not be cast to the schema type (e.g. completed: "maybe")
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Invalid value for ${err.path}` });
  }

  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Something went wrong' });
};
