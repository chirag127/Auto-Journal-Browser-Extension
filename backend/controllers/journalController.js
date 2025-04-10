// Auto-Journal - Journal Controller
// Handles journal retrieval and search

const JournalEntry = require('../models/journalEntry');

// @route   GET /api/journal
// @desc    Get all journal entries
// @access  Public
exports.getJournalEntries = async (req, res) => {
  try {
    const { limit = 50, skip = 0, sort = 'visitTime', order = 'desc' } = req.query;
    
    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;
    
    // Get entries
    const entries = await JournalEntry.find()
      .sort(sortObj)
      .skip(Number(skip))
      .limit(Number(limit));
    
    // Get total count
    const total = await JournalEntry.countDocuments();
    
    res.status(200).json({
      entries,
      total,
      limit: Number(limit),
      skip: Number(skip)
    });
  } catch (error) {
    console.error('Error getting journal entries:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   GET /api/journal/search
// @desc    Search journal entries
// @access  Public
exports.searchJournalEntries = async (req, res) => {
  try {
    const { q, tags, category, domain, startDate, endDate, limit = 50, skip = 0 } = req.query;
    
    // Build query
    const query = {};
    
    // Text search
    if (q) {
      query.$text = { $search: q };
    }
    
    // Tags filter
    if (tags) {
      const tagList = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagList };
    }
    
    // Category filter
    if (category) {
      query.category = category;
    }
    
    // Domain filter
    if (domain) {
      query.domain = domain;
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.visitTime = {};
      
      if (startDate) {
        query.visitTime.$gte = new Date(startDate);
      }
      
      if (endDate) {
        query.visitTime.$lte = new Date(endDate);
      }
    }
    
    // Get entries
    const entries = await JournalEntry.find(query)
      .sort({ visitTime: -1 })
      .skip(Number(skip))
      .limit(Number(limit));
    
    // Get total count
    const total = await JournalEntry.countDocuments(query);
    
    res.status(200).json({
      entries,
      total,
      limit: Number(limit),
      skip: Number(skip)
    });
  } catch (error) {
    console.error('Error searching journal entries:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   GET /api/journal/:url
// @desc    Get a specific journal entry by URL
// @access  Public
exports.getJournalEntryByUrl = async (req, res) => {
  try {
    const url = decodeURIComponent(req.params.url);
    
    const entry = await JournalEntry.findOne({ url });
    
    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    res.status(200).json(entry);
  } catch (error) {
    console.error('Error getting journal entry:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   DELETE /api/journal/:url
// @desc    Delete a journal entry
// @access  Public
exports.deleteJournalEntry = async (req, res) => {
  try {
    const url = decodeURIComponent(req.params.url);
    
    const entry = await JournalEntry.findOneAndDelete({ url });
    
    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    res.status(200).json({ message: 'Journal entry deleted' });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   POST /api/journal/highlight
// @desc    Add a highlight to a journal entry
// @access  Public
exports.addHighlight = async (req, res) => {
  try {
    const { url, text, note } = req.body;
    
    if (!url || !text) {
      return res.status(400).json({ error: 'URL and text are required' });
    }
    
    // Create highlight object
    const highlight = {
      text,
      note: note || '',
      timestamp: new Date()
    };
    
    // Find the journal entry
    const entry = await JournalEntry.findOne({ url });
    
    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    // Add highlight to entry
    entry.highlights.push(highlight);
    await entry.save();
    
    res.status(200).json({
      highlight,
      message: 'Highlight added to journal entry'
    });
  } catch (error) {
    console.error('Error adding highlight:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
