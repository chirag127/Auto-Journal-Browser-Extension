// Auto-Journal - Background Script
// Handles tab events, storage, and API communication

// Configuration
const config = {
  apiBaseUrl: 'http://localhost:3000',
  contentCaptureEnabled: true,
  loggingEnabled: true,
  blacklistedDomains: ['mail.google.com', 'online-banking', 'accounts.google.com'],
  maxContentLength: 1000 // Maximum number of words to capture
};

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Auto-Journal extension installed');
  
  // Initialize storage with default settings
  chrome.storage.local.set({
    settings: {
      loggingEnabled: config.loggingEnabled,
      contentCaptureEnabled: config.contentCaptureEnabled,
      blacklistedDomains: config.blacklistedDomains
    },
    journalEntries: []
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
  }
  
  // Return true to indicate async response
  return true;
});

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
