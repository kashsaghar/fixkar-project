// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Public
router.post('/register', authController.register);
router.post('/login', authController.login);

// Private
router.get('/user', auth, authController.getCurrentUser);

module.exports = router;
