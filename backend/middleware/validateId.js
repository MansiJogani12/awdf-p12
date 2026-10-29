const mongoose = require('mongoose');

// Checks that :id is a valid MongoDB ObjectId before the controller runs
module.exports = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: `Invalid task id "${req.params.id}"` });
  }
  next();
};
