const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });

// POST /auth/register -> hash password -> save User -> 201
exports.register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (await User.exists({ email })) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // bcrypt is deliberately slow and adds a random salt automatically (cost factor 10)
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    res.status(201).json({ message: 'User registered', user });
  } catch (err) {
    next(err);
  }
};

// POST /auth/login -> verify password -> sign JWT -> return token
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // Same message for "no user" and "wrong password" so attackers can't probe emails
    const isMatch = user && (await bcrypt.compare(password, user.password));
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    res.status(200).json({ token: signToken(user), user });
  } catch (err) {
    next(err);
  }
};

// GET /auth/me -> current user from the decoded token
exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User no longer exists' });
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};
