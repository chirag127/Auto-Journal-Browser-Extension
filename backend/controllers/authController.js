// Auto-Journal - Authentication Controller
// Handles user authentication

const User = require('../models/user');
const { generateToken, createOrUpdateUser } = require('../middleware/auth');
const crypto = require('crypto');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
exports.register = async (req, res) => {
  try {
    const { userId, password } = req.body;
    
    if (!userId || !password) {
      return res.status(400).json({ error: 'Please provide userId and password' });
    }
    
    // Check if user already exists
    let user = await User.findOne({ userId });
    
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Generate salt and hash password
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    
    // Create new user
    user = new User({
      userId,
      password: {
        hash,
        salt
      }
    });
    
    await user.save();
    
    // Generate token
    const token = generateToken(userId);
    
    res.status(201).json({
      token,
      user: {
        userId: user.userId,
        settings: user.settings
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   POST /api/auth/login
// @desc    Login user and get token
// @access  Public
exports.login = async (req, res) => {
  try {
    const { userId, password } = req.body;
    
    if (!userId || !password) {
      return res.status(400).json({ error: 'Please provide userId and password' });
    }
    
    // Find user
    const user = await User.findOne({ userId });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if password is set (for users created before auth implementation)
    if (!user.password || !user.password.hash || !user.password.salt) {
      return res.status(401).json({ error: 'Please reset your password' });
    }
    
    // Verify password
    const hash = crypto.pbkdf2Sync(password, user.password.salt, 1000, 64, 'sha512').toString('hex');
    
    if (hash !== user.password.hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = generateToken(userId);
    
    res.status(200).json({
      token,
      user: {
        userId: user.userId,
        settings: user.settings
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   GET /api/auth/user
// @desc    Get user data
// @access  Private
exports.getUser = async (req, res) => {
  try {
    // User is already set in req by the authenticate middleware
    const user = req.user;
    
    res.status(200).json({
      userId: user.userId,
      settings: user.settings
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   PUT /api/auth/settings
// @desc    Update user settings
// @access  Private
exports.updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!settings) {
      return res.status(400).json({ error: 'Please provide settings' });
    }
    
    // User is already set in req by the authenticate middleware
    const user = req.user;
    
    // Update settings
    user.settings = {
      ...user.settings,
      ...settings
    };
    
    await user.save();
    
    res.status(200).json({
      userId: user.userId,
      settings: user.settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
