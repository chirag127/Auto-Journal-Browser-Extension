// Auto-Journal - Summary Routes
// Handles routes for AI summarization

const express = require('express');
const router = express.Router();
const summaryController = require('../controllers/summaryController');

// @route   POST /api/summarize
// @desc    Summarize page content
// @access  Public
router.post('/', summaryController.summarizeContent);

// @route   POST /api/summarize/highlight
// @desc    Summarize highlighted text
// @access  Public
router.post('/highlight', summaryController.summarizeHighlight);

module.exports = router;
