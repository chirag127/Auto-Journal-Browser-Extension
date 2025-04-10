// Auto-Journal - Authentication Routes
// Handles user authentication

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Login user and get token
// @access  Public
router.post('/login', authController.login);

// @route   GET /api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', authenticate, authController.getUser);

// @route   PUT /api/auth/settings
// @desc    Update user settings
// @access  Private
router.put('/settings', authenticate, authController.updateSettings);

module.exports = router;
