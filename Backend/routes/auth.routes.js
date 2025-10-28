const express = require('express');
const router = express.Router();
const { signup, login, getMe, updatePassword } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { authValidation } = require('../middleware/validators');
const validate = require('../middleware/validate');

// Public routes
router.post('/signup', authValidation.signup, validate, signup);
router.post('/login', authValidation.login, validate, login);

// Protected routes
router.get('/me', authenticateToken, getMe);
router.put('/password', authenticateToken, updatePassword);

module.exports = router;
