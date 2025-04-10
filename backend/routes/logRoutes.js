// Auto-Journal - Log Routes
// Handles routes for logging browsing data

const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

// @route   POST /api/log
// @desc    Log a page visit
// @access  Public
router.post('/', logController.logPageVisit);

// @route   GET /api/log/stats
// @desc    Get logging statistics
// @access  Public
router.get('/stats', logController.getLogStats);

module.exports = router;
