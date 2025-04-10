// Auto-Journal - Popup Script
// Handles the popup UI and user interactions

// Import modules
import AuthUtil from './utils/auth.js';
import { createAuthContainer } from './components/login.js';

// Configuration
const config = {
  apiBaseUrl: 'http://localhost:3000',
  entriesPerPage: 10,
  maxSummaryLength: 150
};

// DOM Elements
const journalSection = document.getElementById('journal-section');
const highlightsSection = document.getElementById('highlights-section');
const settingsSection = document.getElementById('settings-section');
const journalEntries = document.getElementById('journal-entries');
const highlightsList = document.getElementById('highlights-list');
const searchInput = document.querySelector('.search-input');
const navTabs = document.querySelectorAll('.nav-tab');
const settingsButton = document.getElementById('settings-button');
const loggingToggle = document.getElementById('logging-toggle');
const contentToggle = document.getElementById('content-toggle');
const editBlacklist = document.getElementById('edit-blacklist');
const exportData = document.getElementById('export-data');
const clearData = document.getElementById('clear-data');

// State
let currentTab = 'journal';
let journalData = [];
let highlightsData = [];
let settings = {
  loggingEnabled: true,
  contentCaptureEnabled: true,
  blacklistedDomains: ['mail.google.com', 'online-banking', 'accounts.google.com']
};

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is authenticated
  const isAuthenticated = await AuthUtil.isAuthenticated();

  if (isAuthenticated) {
    // User is authenticated, load the app
    initializeApp();
  } else {
    // User is not authenticated, show login form
    showLoginForm();
  }
});

// Initialize the app
function initializeApp() {
  // Load settings
  loadSettings();

  // Load journal entries
  loadJournalEntries();

  // Set up event listeners
  setupEventListeners();
}

// Show login form
function showLoginForm() {
  // Clear the body
  document.body.innerHTML = '';

  // Create auth container
  const authContainer = createAuthContainer(handleLoginSuccess);

  // Add auth container to body
  document.body.appendChild(authContainer);
}

// Handle login success
function handleLoginSuccess(data) {
  // Store user settings
  if (data.user && data.user.settings) {
    chrome.storage.local.set({ settings: data.user.settings });
  }

  // Reload the popup
  window.location.reload();
}

// Load settings from storage
function loadSettings() {
  chrome.storage.local.get('settings', (data) => {
    if (data.settings) {
      settings = data.settings;

      // Update UI
      loggingToggle.checked = settings.loggingEnabled;
      contentToggle.checked = settings.contentCaptureEnabled;
    }
  });
}

// Load journal entries from storage
function loadJournalEntries() {
  chrome.storage.local.get('journalEntries', (data) => {
    if (data.journalEntries && data.journalEntries.length > 0) {
      journalData = data.journalEntries;

      // Sort by visit time (newest first)
      journalData.sort((a, b) => new Date(b.visitTime) - new Date(a.visitTime));

      // Render journal entries
      renderJournalEntries(journalData);

      // Extract highlights
      extractHighlights(journalData);
    } else {
      // Show empty state
      showEmptyState(journalSection);
      showEmptyState(highlightsSection);
    }
  });
}

// Extract highlights from journal entries
function extractHighlights(entries) {
  highlightsData = [];

  entries.forEach(entry => {
    if (entry.highlights && entry.highlights.length > 0) {
      entry.highlights.forEach(highlight => {
        highlightsData.push({
          ...highlight,
          url: entry.url,
          title: entry.title,
          favicon: entry.favicon
        });
      });
    }
  });

  // Sort by timestamp (newest first)
  highlightsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Render highlights
  renderHighlights(highlightsData);
}

// Render journal entries
function renderJournalEntries(entries) {
  // Hide loading state
  journalSection.querySelector('.loading').style.display = 'none';

  if (entries.length === 0) {
    showEmptyState(journalSection);
    return;
  }

  // Hide empty state
  journalSection.querySelector('.empty-state').style.display = 'none';

  // Clear existing entries
  journalEntries.innerHTML = '';

  // Add entries
  entries.slice(0, config.entriesPerPage).forEach(entry => {
    const entryElement = createJournalEntryElement(entry);
    journalEntries.appendChild(entryElement);
  });
}

// Create journal entry element
function createJournalEntryElement(entry) {
  const entryElement = document.createElement('div');
  entryElement.className = 'journal-entry';

  // Format date
  const visitDate = new Date(entry.visitTime);
  const formattedDate = formatDate(visitDate);

  // Truncate summary
  const summary = entry.content.summary || 'No summary available';
  const truncatedSummary = summary.length > config.maxSummaryLength
    ? summary.substring(0, config.maxSummaryLength) + '...'
    : summary;

  // Create tags HTML
  const tagsHtml = entry.tags.map(tag => `<div class="tag">${tag}</div>`).join('');

  // Set HTML
  entryElement.innerHTML = `
    <div class="entry-header">
      <img class="favicon" src="${entry.favicon || 'icons/icon16.png'}" alt="">
      <div class="entry-title">${entry.title}</div>
      <div class="entry-time">${formattedDate}</div>
    </div>
    <div class="entry-summary">${truncatedSummary}</div>
    <div class="entry-tags">${tagsHtml}</div>
    <div class="entry-actions">
      <div class="entry-action" data-action="view" data-url="${entry.url}">View</div>
      <div class="entry-action" data-action="delete" data-url="${entry.url}">Delete</div>
    </div>
  `;

  // Add event listeners
  const viewAction = entryElement.querySelector('[data-action="view"]');
  const deleteAction = entryElement.querySelector('[data-action="delete"]');

  viewAction.addEventListener('click', () => {
    chrome.tabs.create({ url: entry.url });
  });

  deleteAction.addEventListener('click', () => {
    deleteJournalEntry(entry.url);
  });

  return entryElement;
}

// Render highlights
function renderHighlights(highlights) {
  // Hide loading state
  highlightsSection.querySelector('.loading').style.display = 'none';

  if (highlights.length === 0) {
    showEmptyState(highlightsSection);
    return;
  }

  // Hide empty state
  highlightsSection.querySelector('.empty-state').style.display = 'none';

  // Clear existing highlights
  highlightsList.innerHTML = '';

  // Add highlights
  highlights.forEach(highlight => {
    const highlightElement = createHighlightElement(highlight);
    highlightsList.appendChild(highlightElement);
  });
}

// Create highlight element
function createHighlightElement(highlight) {
  const highlightElement = document.createElement('div');
  highlightElement.className = 'journal-entry';

  // Format date
  const timestamp = new Date(highlight.timestamp);
  const formattedDate = formatDate(timestamp);

  // Set HTML
  highlightElement.innerHTML = `
    <div class="entry-header">
      <img class="favicon" src="${highlight.favicon || 'icons/icon16.png'}" alt="">
      <div class="entry-title">${highlight.title}</div>
      <div class="entry-time">${formattedDate}</div>
    </div>
    <div class="entry-summary" style="font-style: italic; color: #555;">"${highlight.text}"</div>
    ${highlight.note ? `<div class="entry-summary">${highlight.note}</div>` : ''}
    <div class="entry-actions">
      <div class="entry-action" data-action="view" data-url="${highlight.url}">View Source</div>
    </div>
  `;

  // Add event listeners
  const viewAction = highlightElement.querySelector('[data-action="view"]');

  viewAction.addEventListener('click', () => {
    chrome.tabs.create({ url: highlight.url });
  });

  return highlightElement;
}

// Show empty state
function showEmptyState(section) {
  section.querySelector('.loading').style.display = 'none';
  section.querySelector('.empty-state').style.display = 'block';
}

// Delete journal entry
function deleteJournalEntry(url) {
  chrome.storage.local.get('journalEntries', (data) => {
    if (data.journalEntries) {
      const entries = data.journalEntries;
      const updatedEntries = entries.filter(entry => entry.url !== url);

      // Update storage
      chrome.storage.local.set({ journalEntries: updatedEntries }, () => {
        // Reload entries
        journalData = updatedEntries;
        renderJournalEntries(journalData);
        extractHighlights(journalData);
      });
    }
  });
}

// Set up event listeners
function setupEventListeners() {
  // Tab navigation
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      switchTab(tabName);
    });
  });

  // Settings button
  settingsButton.addEventListener('click', () => {
    switchTab('settings');
  });

  // Logout button
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      if (confirm('Are you sure you want to logout?')) {
        await AuthUtil.logout();
        window.location.reload();
      }
    });
  }

  // Search input
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();

    if (currentTab === 'journal') {
      const filteredEntries = journalData.filter(entry =>
        entry.title.toLowerCase().includes(query) ||
        entry.content.text.toLowerCase().includes(query) ||
        entry.content.summary.toLowerCase().includes(query) ||
        entry.tags.some(tag => tag.toLowerCase().includes(query))
      );

      renderJournalEntries(filteredEntries);
    } else if (currentTab === 'highlights') {
      const filteredHighlights = highlightsData.filter(highlight =>
        highlight.title.toLowerCase().includes(query) ||
        highlight.text.toLowerCase().includes(query) ||
        (highlight.note && highlight.note.toLowerCase().includes(query))
      );

      renderHighlights(filteredHighlights);
    }
  });

  // Settings toggles
  loggingToggle.addEventListener('change', () => {
    settings.loggingEnabled = loggingToggle.checked;
    saveSettings();
  });

  contentToggle.addEventListener('change', () => {
    settings.contentCaptureEnabled = contentToggle.checked;
    saveSettings();
  });

  // Edit blacklist
  editBlacklist.addEventListener('click', () => {
    const blacklist = settings.blacklistedDomains.join(', ');
    const newBlacklist = prompt('Enter blacklisted domains (comma-separated):', blacklist);

    if (newBlacklist !== null) {
      settings.blacklistedDomains = newBlacklist.split(',').map(domain => domain.trim());
      saveSettings();
    }
  });

  // Export data
  exportData.addEventListener('click', () => {
    chrome.storage.local.get(['journalEntries', 'settings'], (data) => {
      const exportData = {
        journalEntries: data.journalEntries || [],
        settings: data.settings || {}
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      chrome.downloads.download({
        url: url,
        filename: `auto-journal-export-${formatDateForFilename(new Date())}.json`
      });
    });
  });

  // Clear data
  clearData.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all journal data? This cannot be undone.')) {
      chrome.storage.local.set({ journalEntries: [] }, () => {
        journalData = [];
        highlightsData = [];
        renderJournalEntries(journalData);
        renderHighlights(highlightsData);
      });
    }
  });
}

// Switch tab
function switchTab(tabName) {
  // Update current tab
  currentTab = tabName;

  // Update tab UI
  navTabs.forEach(tab => {
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Show/hide sections
  const sections = [journalSection, highlightsSection, settingsSection];
  sections.forEach(section => {
    section.classList.remove('active');
  });

  if (tabName === 'journal') {
    journalSection.classList.add('active');
  } else if (tabName === 'highlights') {
    highlightsSection.classList.add('active');
  } else if (tabName === 'settings') {
    settingsSection.classList.add('active');
  }

  // Show/hide search bar
  const searchBar = document.querySelector('.search-bar');
  if (tabName === 'settings') {
    searchBar.style.display = 'none';
  } else {
    searchBar.style.display = 'block';
  }
}

// Save settings
function saveSettings() {
  chrome.storage.local.set({ settings });
}

// Format date
function formatDate(date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.getDate() === today.getDate() &&
                 date.getMonth() === today.getMonth() &&
                 date.getFullYear() === today.getFullYear();

  const isYesterday = date.getDate() === yesterday.getDate() &&
                     date.getMonth() === yesterday.getMonth() &&
                     date.getFullYear() === yesterday.getFullYear();

  if (isToday) {
    return `Today at ${formatTime(date)}`;
  } else if (isYesterday) {
    return `Yesterday at ${formatTime(date)}`;
  } else {
    return `${date.toLocaleDateString()} at ${formatTime(date)}`;
  }
}

// Format time
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Format date for filename
function formatDateForFilename(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
