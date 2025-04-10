// Auto-Journal - Storage Utility
// Provides functions for interacting with browser storage

const StorageUtil = {
  /**
   * Get data from storage
   * @param {string|Array<string>} keys - Key(s) to retrieve
   * @returns {Promise<Object>} - Retrieved data
   */
  get: (keys) => {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (result) => {
        resolve(result);
      });
    });
  },
  
  /**
   * Set data in storage
   * @param {Object} data - Data to store
   * @returns {Promise<void>}
   */
  set: (data) => {
    return new Promise((resolve) => {
      chrome.storage.local.set(data, () => {
        resolve();
      });
    });
  },
  
  /**
   * Remove data from storage
   * @param {string|Array<string>} keys - Key(s) to remove
   * @returns {Promise<void>}
   */
  remove: (keys) => {
    return new Promise((resolve) => {
      chrome.storage.local.remove(keys, () => {
        resolve();
      });
    });
  },
  
  /**
   * Clear all data from storage
   * @returns {Promise<void>}
   */
  clear: () => {
    return new Promise((resolve) => {
      chrome.storage.local.clear(() => {
        resolve();
      });
    });
  },
  
  /**
   * Add a journal entry to storage
   * @param {Object} entry - Journal entry to add
   * @returns {Promise<void>}
   */
  addJournalEntry: async (entry) => {
    const { journalEntries = [] } = await StorageUtil.get('journalEntries');
    
    // Check if entry for this URL already exists
    const existingIndex = journalEntries.findIndex(e => e.url === entry.url);
    
    if (existingIndex >= 0) {
      // Update existing entry
      journalEntries[existingIndex] = {
        ...journalEntries[existingIndex],
        visitTime: entry.visitTime, // Update visit time
        content: entry.content
      };
    } else {
      // Add new entry
      journalEntries.push(entry);
    }
    
    // Store updated entries
    return StorageUtil.set({ journalEntries });
  },
  
  /**
   * Update a journal entry in storage
   * @param {Object} updatedEntry - Updated journal entry
   * @returns {Promise<void>}
   */
  updateJournalEntry: async (updatedEntry) => {
    const { journalEntries = [] } = await StorageUtil.get('journalEntries');
    
    // Find and update the entry
    const index = journalEntries.findIndex(entry => entry.url === updatedEntry.url);
    
    if (index >= 0) {
      journalEntries[index] = updatedEntry;
      return StorageUtil.set({ journalEntries });
    }
    
    return Promise.resolve();
  },
  
  /**
   * Delete a journal entry from storage
   * @param {string} url - URL of the entry to delete
   * @returns {Promise<void>}
   */
  deleteJournalEntry: async (url) => {
    const { journalEntries = [] } = await StorageUtil.get('journalEntries');
    
    // Filter out the entry
    const updatedEntries = journalEntries.filter(entry => entry.url !== url);
    
    // Store updated entries
    return StorageUtil.set({ journalEntries: updatedEntries });
  },
  
  /**
   * Add a highlight to a journal entry
   * @param {string} url - URL of the entry
   * @param {Object} highlight - Highlight to add
   * @returns {Promise<void>}
   */
  addHighlight: async (url, highlight) => {
    const { journalEntries = [] } = await StorageUtil.get('journalEntries');
    
    // Find the entry
    const entryIndex = journalEntries.findIndex(entry => entry.url === url);
    
    if (entryIndex >= 0) {
      // Add highlight to entry
      if (!journalEntries[entryIndex].highlights) {
        journalEntries[entryIndex].highlights = [];
      }
      
      journalEntries[entryIndex].highlights.push(highlight);
      
      // Store updated entries
      return StorageUtil.set({ journalEntries });
    }
    
    return Promise.resolve();
  },
  
  /**
   * Get settings from storage
   * @returns {Promise<Object>} - Settings object
   */
  getSettings: async () => {
    const { settings } = await StorageUtil.get('settings');
    
    // Return settings with defaults
    return {
      loggingEnabled: true,
      contentCaptureEnabled: true,
      blacklistedDomains: ['mail.google.com', 'online-banking', 'accounts.google.com'],
      ...settings
    };
  },
  
  /**
   * Save settings to storage
   * @param {Object} settings - Settings to save
   * @returns {Promise<void>}
   */
  saveSettings: (settings) => {
    return StorageUtil.set({ settings });
  }
};

export default StorageUtil;
