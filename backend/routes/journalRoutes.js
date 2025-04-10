// Auto-Journal - Journal Routes
// Handles routes for journal retrieval and search

const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');

// @route   GET /api/journal
// @desc    Get all journal entries
// @access  Public
router.get('/', journalController.getJournalEntries);

// @route   GET /api/journal/search
// @desc    Search journal entries
// @access  Public
router.get('/search', journalController.searchJournalEntries);

// @route   GET /api/journal/:url
// @desc    Get a specific journal entry by URL
// @access  Public
router.get('/:url', journalController.getJournalEntryByUrl);

// @route   DELETE /api/journal/:url
// @desc    Delete a journal entry
// @access  Public
router.delete('/:url', journalController.deleteJournalEntry);

// @route   POST /api/journal/highlight
// @desc    Add a highlight to a journal entry
// @access  Public
router.post('/highlight', journalController.addHighlight);

module.exports = router;
