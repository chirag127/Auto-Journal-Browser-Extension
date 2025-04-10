// Auto-Journal - Settings Component
// Component for settings management

/**
 * Create settings section element
 * @param {Object} settings - Current settings
 * @param {Function} onSettingsChange - Settings change callback
 * @returns {HTMLElement} - Settings section element
 */
function createSettingsSection(settings, onSettingsChange) {
  const settingsSection = document.createElement('div');
  settingsSection.className = 'content-section';
  settingsSection.id = 'settings-section';

  settingsSection.innerHTML = `
    <div class="settings-group">
      <div class="settings-title">Logging Settings</div>
      <div class="setting-item">
        <div class="setting-label">Enable logging</div>
        <label class="toggle">
          <input type="checkbox" id="logging-toggle" ${settings.loggingEnabled ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>
      <div class="setting-item">
        <div class="setting-label">Capture page content</div>
        <label class="toggle">
          <input type="checkbox" id="content-toggle" ${settings.contentCaptureEnabled ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>
      <div class="setting-item">
        <div class="setting-label">Capture screenshots</div>
        <label class="toggle">
          <input type="checkbox" id="screenshot-toggle" ${settings.screenshotEnabled ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>
    </div>

    <div class="settings-group">
      <div class="settings-title">Privacy</div>
      <div class="setting-item">
        <div class="setting-label">Blacklisted domains</div>
        <div style="font-size: 12px; color: #4285f4; cursor: pointer;" id="edit-blacklist">Edit</div>
      </div>
    </div>

    <div class="settings-group">
      <div class="settings-title">Data</div>
      <div class="setting-item">
        <div class="setting-label">Export journal</div>
        <div style="font-size: 12px; color: #4285f4; cursor: pointer;" id="export-data">Export</div>
      </div>
      <div class="setting-item">
        <div class="setting-label">Clear all data</div>
        <div style="font-size: 12px; color: #f44336; cursor: pointer;" id="clear-data">Clear</div>
      </div>
    </div>

    <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #757575;">
      Auto-Journal v1.0.0
    </div>
  `;

  // Add event listeners
  const loggingToggle = settingsSection.querySelector('#logging-toggle');
  const contentToggle = settingsSection.querySelector('#content-toggle');
  const editBlacklist = settingsSection.querySelector('#edit-blacklist');
  const exportData = settingsSection.querySelector('#export-data');
  const clearData = settingsSection.querySelector('#clear-data');

  // Toggle event listeners
  loggingToggle.addEventListener('change', () => {
    settings.loggingEnabled = loggingToggle.checked;
    if (onSettingsChange) onSettingsChange(settings);
  });

  contentToggle.addEventListener('change', () => {
    settings.contentCaptureEnabled = contentToggle.checked;
    if (onSettingsChange) onSettingsChange(settings);
  });

  // Screenshot toggle
  const screenshotToggle = settingsSection.querySelector('#screenshot-toggle');
  screenshotToggle.addEventListener('change', () => {
    settings.screenshotEnabled = screenshotToggle.checked;
    if (onSettingsChange) onSettingsChange(settings);
  });

  // Edit blacklist
  editBlacklist.addEventListener('click', () => {
    const blacklist = settings.blacklistedDomains.join(', ');
    const newBlacklist = prompt('Enter blacklisted domains (comma-separated):', blacklist);

    if (newBlacklist !== null) {
      settings.blacklistedDomains = newBlacklist.split(',').map(domain => domain.trim());
      if (onSettingsChange) onSettingsChange(settings);
    }
  });

  // Export data
  exportData.addEventListener('click', () => {
    if (chrome.downloads) {
      exportJournalData();
    } else {
      alert('Export functionality requires the downloads permission.');
    }
  });

  // Clear data
  clearData.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all journal data? This cannot be undone.')) {
      chrome.storage.local.set({ journalEntries: [] }, () => {
        alert('Journal data cleared.');
      });
    }
  });

  return settingsSection;
}

/**
 * Export journal data
 */
function exportJournalData() {
  chrome.storage.local.get(['journalEntries', 'settings'], (data) => {
    const exportData = {
      journalEntries: data.journalEntries || [],
      settings: data.settings || {}
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    chrome.downloads.download({
      url: url,
      filename: `auto-journal-export-${dateStr}.json`
    });
  });
}

/**
 * Load settings from storage
 * @returns {Promise<Object>} - Settings object
 */
function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get('settings', (data) => {
      const defaultSettings = {
        loggingEnabled: true,
        contentCaptureEnabled: true,
        blacklistedDomains: ['mail.google.com', 'online-banking', 'accounts.google.com']
      };

      resolve(data.settings || defaultSettings);
    });
  });
}

/**
 * Save settings to storage
 * @param {Object} settings - Settings to save
 * @returns {Promise<void>}
 */
function saveSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ settings }, resolve);
  });
}

// Export functions
export {
  createSettingsSection,
  loadSettings,
  saveSettings,
  exportJournalData
};
