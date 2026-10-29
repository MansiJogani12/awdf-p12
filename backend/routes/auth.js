const express = require('express');
const requireJson = require('../middleware/requireJson');
const auth = require('../middleware/auth');
const { validateCredentials } = require('../middleware/validate');
const { register, login, me } = require('../controllers/authController');

const router = express.Router();

router.post('/register', requireJson, validateCredentials, register);
router.post('/login', requireJson, validateCredentials, login);
router.get('/me', auth, me);

module.exports = router;
