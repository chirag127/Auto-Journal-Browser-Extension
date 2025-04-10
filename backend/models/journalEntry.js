// Auto-Journal - Journal Entry Model
// Defines the schema for journal entries

const mongoose = require('mongoose');

const HighlightSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    default: '',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const JournalEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: 'default', // For future multi-user support
    },
    url: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    favicon: {
      type: String,
      default: '',
    },
    visitTime: {
      type: Date,
      default: Date.now,
    },
    content: {
      text: {
        type: String,
        default: '',
      },
      summary: {
        type: String,
        default: '',
      },
    },
    screenshot: {
      type: String,
      default: '',
    },
    highlights: [HighlightSchema],
    tags: [String],
    category: {
      type: String,
      default: '',
    },
    domain: {
      type: String,
      required: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for userId and url
JournalEntrySchema.index({ userId: 1, url: 1 }, { unique: true });

// Create text index for search
JournalEntrySchema.index({
  title: 'text',
  'content.text': 'text',
  'content.summary': 'text',
  'highlights.text': 'text',
  'highlights.note': 'text',
  tags: 'text',
});

module.exports = mongoose.model('JournalEntry', JournalEntrySchema);
