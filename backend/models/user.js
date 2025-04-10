// Auto-Journal - User Model
// Defines the schema for users (for future authentication)

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    hash: {
      type: String
    },
    salt: {
      type: String
    }
  },
  settings: {
    syncEnabled: {
      type: Boolean,
      default: false
    },
    blacklistedDomains: {
      type: [String],
      default: ['mail.google.com', 'online-banking', 'accounts.google.com']
    },
    loggingEnabled: {
      type: Boolean,
      default: true
    },
    contentCaptureEnabled: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
