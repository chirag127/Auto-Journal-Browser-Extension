// Auto-Journal - Tag Routes
// Handles routes for tag management

const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');

// @route   GET /api/tags
// @desc    Get all tags
// @access  Public
router.get('/', tagController.getAllTags);

// @route   PATCH /api/tags/:url
// @desc    Update tags for a journal entry
// @access  Public
router.patch('/:url', tagController.updateTags);

// @route   GET /api/tags/categories
// @desc    Get all tag categories
// @access  Public
router.get('/categories', tagController.getCategories);

module.exports = router;
