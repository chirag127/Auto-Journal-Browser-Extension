// Auto-Journal - Tag Model
// Defines the schema for tags

const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    default: ''
  },
  count: {
    type: Number,
    default: 1
  },
  userId: {
    type: String,
    default: 'default' // For future multi-user support
  }
}, {
  timestamps: true
});

// Create compound index for userId and name
TagSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Tag', TagSchema);
