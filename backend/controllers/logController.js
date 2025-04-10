// Auto-Journal - Log Controller
// Handles logging browsing data

const JournalEntry = require('../models/journalEntry');
const geminiClient = require('../config/gemini');
const { updateTagCount } = require('../utils/tagging');
const { uploadToFreeImageHost } = require('../utils/imageUpload');

// @route   POST /api/log
// @desc    Log a page visit
// @access  Public
exports.logPageVisit = async (req, res) => {
  try {
    const { url, title, text, favicon, screenshot } = req.body;

    if (!url || !title) {
      return res.status(400).json({ error: 'URL and title are required' });
    }

    // Extract domain from URL
    const domain = new URL(url).hostname;

    // Check if entry already exists
    let entry = await JournalEntry.findOne({ url });

    // Upload screenshot if provided
    let screenshotUrl = '';
    if (screenshot) {
      try {
        // Remove the data:image/png;base64, prefix if present
        const base64Data = screenshot.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
        screenshotUrl = await uploadToFreeImageHost(base64Data);
        console.log('Screenshot uploaded:', screenshotUrl);
      } catch (uploadError) {
        console.error('Error uploading screenshot:', uploadError);
        // Continue without screenshot if upload fails
      }
    }

    if (entry) {
      // Update existing entry
      entry.visitTime = new Date();

      // Only update content if provided
      if (text) {
        entry.content.text = text;
      }

      // Update favicon if provided
      if (favicon) {
        entry.favicon = favicon;
      }

      // Update screenshot if uploaded successfully
      if (screenshotUrl) {
        entry.screenshot = screenshotUrl;
      }

      await entry.save();

      return res.status(200).json({
        message: 'Journal entry updated',
        entry,
      });
    }

    // Create new entry
    entry = new JournalEntry({
      url,
      title,
      domain,
      favicon: favicon || '',
      screenshot: screenshotUrl,
      content: {
        text: text || '',
      },
    });

    // Save entry
    await entry.save();

    res.status(201).json({
      message: 'Journal entry created',
      entry,
    });
  } catch (error) {
    console.error('Error logging page visit:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   GET /api/log/stats
// @desc    Get logging statistics
// @access  Public
exports.getLogStats = async (req, res) => {
  try {
    // Get total count
    const totalEntries = await JournalEntry.countDocuments();

    // Get count by domain
    const domainStats = await JournalEntry.aggregate([
      {
        $group: {
          _id: '$domain',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Get count by category
    const categoryStats = await JournalEntry.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Get count by day
    const dayStats = await JournalEntry.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$visitTime' },
            month: { $month: '$visitTime' },
            day: { $dayOfMonth: '$visitTime' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 },
      },
      {
        $limit: 30,
      },
    ]);

    res.status(200).json({
      totalEntries,
      domainStats,
      categoryStats,
      dayStats,
    });
  } catch (error) {
    console.error('Error getting log stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
