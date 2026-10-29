const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  // Always a bcrypt hash — never the plain-text password
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Never leak the hash when a user document is sent as JSON
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
