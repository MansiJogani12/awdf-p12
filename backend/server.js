require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

// Refuse to start without a signing secret (it must come from .env, never the code)
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, then start accepting requests
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
