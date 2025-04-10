// Auto-Journal - Summary Controller
// Handles AI summarization

const JournalEntry = require('../models/journalEntry');
const geminiClient = require('../config/gemini');
const { updateTagCount } = require('../utils/tagging');

// @route   POST /api/summarize
// @desc    Summarize page content
// @access  Public
exports.summarizeContent = async (req, res) => {
  try {
    const { url, title, text } = req.body;
    
    if (!url || !title || !text) {
      return res.status(400).json({ error: 'URL, title, and text are required' });
    }
    
    // Generate summary using Gemini API
    const summary = await geminiClient.generateSummary(text, title, url);
    
    // Generate tags
    const tags = await geminiClient.generateTags(text, title);
    
    // Determine category
    const category = await geminiClient.determineCategory(text, title);
    
    // Update tag counts
    if (tags.length > 0) {
      await Promise.all(tags.map(tag => updateTagCount(tag, category)));
    }
    
    // Find and update the journal entry
    const entry = await JournalEntry.findOneAndUpdate(
      { url },
      {
        $set: {
          'content.summary': summary,
          tags,
          category
        }
      },
      { new: true }
    );
    
    res.status(200).json({
      summary,
      tags,
      category,
      entry
    });
  } catch (error) {
    console.error('Error summarizing content:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   POST /api/summarize/highlight
// @desc    Summarize highlighted text
// @access  Public
exports.summarizeHighlight = async (req, res) => {
  try {
    const { url, title, text } = req.body;
    
    if (!url || !text) {
      return res.status(400).json({ error: 'URL and text are required' });
    }
    
    // Generate note for highlight
    const note = await geminiClient.generateHighlightNote(text, title || '');
    
    // Create highlight object
    const highlight = {
      text,
      note,
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
      note,
      highlight,
      message: 'Highlight added to journal entry'
    });
  } catch (error) {
    console.error('Error summarizing highlight:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
