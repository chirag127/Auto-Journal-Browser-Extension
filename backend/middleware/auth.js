// Auto-Journal - Authentication Middleware
// Handles user authentication (for future implementation)

const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * Authenticate user with JWT
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');
    
    // Check if no token
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findOne({ userId: decoded.userId });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Set user in request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @returns {string} - JWT token
 */
exports.generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

/**
 * Create or update user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User object
 */
exports.createOrUpdateUser = async (userId) => {
  try {
    // Find user
    let user = await User.findOne({ userId });
    
    if (!user) {
      // Create new user
      user = new User({ userId });
      await user.save();
    }
    
    return user;
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
};
