// Auto-Journal - Background Script
// Handles tab events, storage, and API communication

// Configuration
const config = {
  apiBaseUrl: 'https://auto-journal-browser-extension.onrender.com',
  contentCaptureEnabled: true,
  loggingEnabled: true,
  screenshotEnabled: true, // Whether to capture screenshots
  blacklistedDomains: ['mail.google.com', 'online-banking', 'accounts.google.com'],
  maxContentLength: 1000 // Maximum number of words to capture
};

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Auto-Journal extension installed');

  // Initialize storage with default settings
  chrome.storage.local.get(['settings', 'journalEntries'], (data) => {
    const existingSettings = data.settings || {};
    const existingEntries = data.journalEntries || [];

    // Create merged settings object
    const mergedSettings = {
      loggingEnabled: existingSettings.loggingEnabled !== undefined ? existingSettings.loggingEnabled : config.loggingEnabled,
      contentCaptureEnabled: existingSettings.contentCaptureEnabled !== undefined ? existingSettings.contentCaptureEnabled : config.contentCaptureEnabled,
      screenshotEnabled: existingSettings.screenshotEnabled !== undefined ? existingSettings.screenshotEnabled : config.screenshotEnabled,
      blacklistedDomains: existingSettings.blacklistedDomains || config.blacklistedDomains
    };

    console.log('Initializing with settings:', mergedSettings);

    // Save settings and keep existing entries
    chrome.storage.local.set({
      settings: mergedSettings,
      journalEntries: existingEntries
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error initializing settings:', chrome.runtime.lastError);
      } else {
        console.log('Settings initialized successfully');
      }
    });
  });

  // Create context menu for highlighting
  chrome.contextMenus.create({
    id: 'save-highlight',
    title: 'Save to Auto-Journal',
    contexts: ['selection']
  });
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only process if the page has completed loading and has a valid URL
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    // Check if the domain is blacklisted
    const domain = new URL(tab.url).hostname;

    chrome.storage.local.get('settings', (data) => {
      const settings = data.settings || {};

      // Skip if logging is disabled or domain is blacklisted
      if (!settings.loggingEnabled ||
          settings.blacklistedDomains?.some(blacklisted => domain.includes(blacklisted))) {
        console.log(`Skipping logging for ${domain} (blacklisted or logging disabled)`);
        return;
      }

      // Request content from the tab
      chrome.tabs.sendMessage(tabId, { action: 'getPageContent' });
    });
  }
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'save-highlight' && info.selectionText) {
    // Save the highlighted text
    saveHighlight(info.selectionText, tab.url, tab.title);
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'pageContent') {
    // Process and store the page content
    processPageContent(message.data, sender.tab);
    sendResponse({ status: 'received' });
  } else if (message.action === 'saveHighlight') {
    // Save highlight from content script
    saveHighlight(message.text, sender.tab.url, sender.tab.title);
    sendResponse({ status: 'highlight saved' });
  } else if (message.action === 'captureScreenshot') {
    // Check if screenshot capture is enabled
    chrome.storage.local.get('settings', (data) => {
      const settings = data.settings || {};

      // Skip if screenshot capture is disabled
      if (settings.screenshotEnabled === false) {
        console.log('Screenshot capture is disabled in settings');
        sendResponse({ screenshot: null });
        return;
      }

      console.log('Attempting to capture screenshot...');

      // Capture screenshot of the current tab
      captureScreenshot(sender.tab.id)
        .then(dataUrl => {
          console.log('Screenshot captured, sending response');
          sendResponse({ screenshot: dataUrl });
        })
        .catch(error => {
          console.error('Error capturing screenshot:', error);
          sendResponse({ screenshot: null });
        });
    });

    // Return true to indicate async response
    return true;
  }

  // Return true to indicate async response
  return true;
});

// Capture screenshot of a tab
async function captureScreenshot(tabId) {
  return new Promise((resolve, reject) => {
    try {
      // Use chrome.tabs.captureVisibleTab to capture the current tab
      chrome.tabs.captureVisibleTab(
        null, // Use the current window
        { format: 'png', quality: 80 }, // Format and quality
        (dataUrl) => {
          if (chrome.runtime.lastError) {
            console.error('Error capturing screenshot:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            console.log('Screenshot captured successfully');
            resolve(dataUrl);
          }
        }
      );
    } catch (error) {
      console.error('Exception capturing screenshot:', error);
      reject(error);
    }
  });
}

// Process page content
async function processPageContent(data, tab) {
  try {
    // Create journal entry
    const entry = {
      url: tab.url,
      title: tab.title,
      favicon: tab.favIconUrl || '',
      visitTime: new Date().toISOString(),
      domain: new URL(tab.url).hostname,
      content: {
        text: data.text,
        summary: '' // Will be filled by API
      },
      screenshot: data.screenshot || '', // Include screenshot if available
      highlights: [],
      tags: [],
      category: '',
      isPrivate: false
    };

    console.log('Processing page:', entry.title);

    // Store locally first
    storeEntryLocally(entry);

    // Send to backend for processing if content capture is enabled
    chrome.storage.local.get('settings', async (data) => {
      const settings = data.settings || {};

      if (settings.contentCaptureEnabled && entry.content.text) {
        try {
          // Send to backend for summarization
          const response = await fetch(`${config.apiBaseUrl}/api/summarize`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              url: entry.url,
              title: entry.title,
              text: entry.content.text
            })
          });

          if (response.ok) {
            const result = await response.json();

            // Update the entry with the summary and tags
            entry.content.summary = result.summary;
            entry.tags = result.tags || [];
            entry.category = result.category || '';

            // Update the stored entry
            updateStoredEntry(entry);

            console.log('Entry updated with summary');
          } else {
            console.error('Failed to get summary from API');
          }
        } catch (error) {
          console.error('API error:', error);
        }
      }
    });
  } catch (error) {
    console.error('Error processing page content:', error);
  }
}

// Save highlight
async function saveHighlight(text, url, pageTitle) {
  if (!text || !url) return;

  console.log('Saving highlight:', text.substring(0, 50) + '...');

  const highlight = {
    text: text,
    note: '', // Will be filled by API
    timestamp: new Date().toISOString()
  };

  // Find the entry for this URL
  chrome.storage.local.get('journalEntries', async (data) => {
    const entries = data.journalEntries || [];
    const entryIndex = entries.findIndex(entry => entry.url === url);

    if (entryIndex >= 0) {
      // Add highlight to existing entry
      entries[entryIndex].highlights.push(highlight);

      // Update storage
      chrome.storage.local.set({ journalEntries: entries });

      // Send to backend for processing
      try {
        const response = await fetch(`${config.apiBaseUrl}/api/highlight`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: url,
            title: pageTitle,
            text: text
          })
        });

        if (response.ok) {
          const result = await response.json();

          // Update the highlight with the note
          const highlightIndex = entries[entryIndex].highlights.length - 1;
          entries[entryIndex].highlights[highlightIndex].note = result.note;

          // Update storage
          chrome.storage.local.set({ journalEntries: entries });

          console.log('Highlight updated with note');
        }
      } catch (error) {
        console.error('API error for highlight:', error);
      }
    } else {
      console.error('No journal entry found for this URL');
    }
  });
}

// Store entry locally
function storeEntryLocally(entry) {
  chrome.storage.local.get('journalEntries', (data) => {
    const entries = data.journalEntries || [];

    // Check if entry for this URL already exists
    const existingIndex = entries.findIndex(e => e.url === entry.url);

    if (existingIndex >= 0) {
      // Update existing entry
      entries[existingIndex] = {
        ...entries[existingIndex],
        visitTime: entry.visitTime, // Update visit time
        content: entry.content
      };
    } else {
      // Add new entry
      entries.push(entry);
    }

    // Store updated entries
    chrome.storage.local.set({ journalEntries: entries });
    console.log('Entry stored locally');
  });
}

// Update stored entry
function updateStoredEntry(updatedEntry) {
  chrome.storage.local.get('journalEntries', (data) => {
    const entries = data.journalEntries || [];

    // Find and update the entry
    const index = entries.findIndex(entry => entry.url === updatedEntry.url);

    if (index >= 0) {
      entries[index] = updatedEntry;
      chrome.storage.local.set({ journalEntries: entries });
    }
  });
}
