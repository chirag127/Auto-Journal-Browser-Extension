// Auto-Journal - Tag Controller
// Handles tag management

const JournalEntry = require('../models/journalEntry');
const Tag = require('../models/tag');
const { updateTagCount } = require('../utils/tagging');

// @route   GET /api/tags
// @desc    Get all tags
// @access  Public
exports.getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ count: -1 });
    
    res.status(200).json(tags);
  } catch (error) {
    console.error('Error getting tags:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   PATCH /api/tags/:url
// @desc    Update tags for a journal entry
// @access  Public
exports.updateTags = async (req, res) => {
  try {
    const url = decodeURIComponent(req.params.url);
    const { tags } = req.body;
    
    if (!Array.isArray(tags)) {
      return res.status(400).json({ error: 'Tags must be an array' });
    }
    
    // Find the journal entry
    const entry = await JournalEntry.findOne({ url });
    
    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    // Get old tags for comparison
    const oldTags = [...entry.tags];
    
    // Update entry tags
    entry.tags = tags;
    await entry.save();
    
    // Update tag counts
    const tagsToDecrement = oldTags.filter(tag => !tags.includes(tag));
    const tagsToIncrement = tags.filter(tag => !oldTags.includes(tag));
    
    // Process tag count updates
    await Promise.all([
      ...tagsToDecrement.map(tag => updateTagCount(tag, entry.category, -1)),
      ...tagsToIncrement.map(tag => updateTagCount(tag, entry.category, 1))
    ]);
    
    res.status(200).json({
      message: 'Tags updated',
      entry
    });
  } catch (error) {
    console.error('Error updating tags:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   GET /api/tags/categories
// @desc    Get all tag categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    // Get unique categories
    const categories = await JournalEntry.distinct('category');
    
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
