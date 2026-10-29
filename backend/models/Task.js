const mongoose = require('mongoose');

// MongoDB itself is schema-less; Mongoose enforces this shape in the application
// before any document reaches the database.
const taskSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'title is required'] },
  description: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  priority: {
    type: String,
    enum: { values: ['low', 'medium', 'high'], message: 'priority must be low, medium or high' },
    default: 'medium',
  },
  createdAt: { type: Date, default: Date.now },
  // Owner of the task (set from the JWT, never from the request body)
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
});

// Pre-save hook: trim whitespace from the title.
// Note: save hooks run on create()/save(), not on findByIdAndUpdate().
taskSchema.pre('save', function (next) {
  if (typeof this.title === 'string') this.title = this.title.trim();
  next();
});

// Compound index matching GET /tasks: filter by user, newest first
taskSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);
