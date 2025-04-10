// Auto-Journal - History Script
// Handles the history page UI and functionality

import AuthUtil from './utils/auth.js';
import ApiUtil from './utils/api.js';

// Configuration
const config = {
  entriesPerPage: 10,
  maxSummaryLength: 200
};

// State
let journalData = [];
let filteredData = [];
let currentPage = 1;
let categories = [];
let tags = [];

// DOM Elements
const journalEntriesContainer = document.getElementById('journal-entries');
const loadingState = document.getElementById('loading-state');
const emptyState = document.getElementById('empty-state');
const paginationContainer = document.getElementById('pagination');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const tagFilter = document.getElementById('tag-filter');
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');
const backButton = document.getElementById('back-button');

// Initialize history page
document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is authenticated
  const isAuthenticated = await AuthUtil.isAuthenticated();
  
  if (!isAuthenticated) {
    // Redirect to popup for authentication
    window.close();
    return;
  }
  
  // Set up event listeners
  setupEventListeners();
  
  // Load journal entries
  await loadJournalEntries();
  
  // Extract categories and tags
  extractCategoriesAndTags();
  
  // Populate filter dropdowns
  populateFilters();
});

// Set up event listeners
function setupEventListeners() {
  // Back button
  backButton.addEventListener('click', () => {
    window.close();
  });
  
  // Search input
  searchInput.addEventListener('input', () => {
    filterEntries();
  });
  
  // Category filter
  categoryFilter.addEventListener('change', () => {
    filterEntries();
  });
  
  // Tag filter
  tagFilter.addEventListener('change', () => {
    filterEntries();
  });
  
  // Date filters
  startDateInput.addEventListener('change', () => {
    filterEntries();
  });
  
  endDateInput.addEventListener('change', () => {
    filterEntries();
  });
}

// Load journal entries
async function loadJournalEntries() {
  try {
    // Show loading state
    showLoadingState();
    
    // Get entries from storage first (for faster initial load)
    const { journalEntries } = await new Promise(resolve => {
      chrome.storage.local.get('journalEntries', resolve);
    });
    
    if (journalEntries && journalEntries.length > 0) {
      journalData = journalEntries;
      
      // Sort by visit time (newest first)
      journalData.sort((a, b) => new Date(b.visitTime) - new Date(a.visitTime));
      
      // Update UI
      filteredData = [...journalData];
      renderJournalEntries();
    }
    
    // Try to get entries from API
    try {
      const response = await ApiUtil.getJournal();
      
      if (response && response.entries && response.entries.length > 0) {
        journalData = response.entries;
        
        // Sort by visit time (newest first)
        journalData.sort((a, b) => new Date(b.visitTime) - new Date(a.visitTime));
        
        // Update UI
        filteredData = [...journalData];
        renderJournalEntries();
        
        // Extract categories and tags
        extractCategoriesAndTags();
        
        // Populate filter dropdowns
        populateFilters();
      }
    } catch (apiError) {
      console.error('Error fetching entries from API:', apiError);
      // Continue with local data if API fails
    }
  } catch (error) {
    console.error('Error loading journal entries:', error);
    showEmptyState();
  }
}

// Extract categories and tags from journal entries
function extractCategoriesAndTags() {
  // Extract categories
  categories = [...new Set(journalData.map(entry => entry.category).filter(Boolean))];
  
  // Extract tags
  const allTags = journalData.flatMap(entry => entry.tags || []);
  tags = [...new Set(allTags)];
}

// Populate filter dropdowns
function populateFilters() {
  // Populate category filter
  categoryFilter.innerHTML = '<option value="">All Categories</option>';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
  
  // Populate tag filter
  tagFilter.innerHTML = '<option value="">All Tags</option>';
  tags.forEach(tag => {
    const option = document.createElement('option');
    option.value = tag;
    option.textContent = tag;
    tagFilter.appendChild(option);
  });
}

// Filter entries based on search and filters
function filterEntries() {
  const searchQuery = searchInput.value.toLowerCase();
  const categoryValue = categoryFilter.value;
  const tagValue = tagFilter.value;
  const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
  const endDate = endDateInput.value ? new Date(endDateInput.value) : null;
  
  // If end date is provided, set it to the end of the day
  if (endDate) {
    endDate.setHours(23, 59, 59, 999);
  }
  
  // Filter entries
  filteredData = journalData.filter(entry => {
    // Search query filter
    if (searchQuery) {
      const matchesTitle = entry.title.toLowerCase().includes(searchQuery);
      const matchesContent = entry.content.text && entry.content.text.toLowerCase().includes(searchQuery);
      const matchesSummary = entry.content.summary && entry.content.summary.toLowerCase().includes(searchQuery);
      const matchesTags = entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(searchQuery));
      
      if (!(matchesTitle || matchesContent || matchesSummary || matchesTags)) {
        return false;
      }
    }
    
    // Category filter
    if (categoryValue && entry.category !== categoryValue) {
      return false;
    }
    
    // Tag filter
    if (tagValue && (!entry.tags || !entry.tags.includes(tagValue))) {
      return false;
    }
    
    // Date range filter
    if (startDate || endDate) {
      const entryDate = new Date(entry.visitTime);
      
      if (startDate && entryDate < startDate) {
        return false;
      }
      
      if (endDate && entryDate > endDate) {
        return false;
      }
    }
    
    return true;
  });
  
  // Reset to first page
  currentPage = 1;
  
  // Render filtered entries
  renderJournalEntries();
}

// Render journal entries
function renderJournalEntries() {
  // Hide loading state
  hideLoadingState();
  
  // Check if there are entries to display
  if (filteredData.length === 0) {
    showEmptyState();
    return;
  }
  
  // Hide empty state
  hideEmptyState();
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / config.entriesPerPage);
  const startIndex = (currentPage - 1) * config.entriesPerPage;
  const endIndex = Math.min(startIndex + config.entriesPerPage, filteredData.length);
  const currentEntries = filteredData.slice(startIndex, endIndex);
  
  // Clear existing entries
  journalEntriesContainer.innerHTML = '';
  
  // Add entries
  currentEntries.forEach(entry => {
    const entryElement = createJournalEntryElement(entry);
    journalEntriesContainer.appendChild(entryElement);
  });
  
  // Render pagination
  renderPagination(totalPages);
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
  const tagsHtml = entry.tags && entry.tags.length > 0
    ? entry.tags.map(tag => `<div class="tag">${tag}</div>`).join('')
    : '';
  
  // Create highlights HTML
  const highlightsHtml = entry.highlights && entry.highlights.length > 0
    ? entry.highlights.map(highlight => `
      <div class="highlight">
        <div class="highlight-text">"${highlight.text}"</div>
        ${highlight.note ? `<div class="highlight-note">${highlight.note}</div>` : ''}
      </div>
    `).join('')
    : '';
  
  // Create screenshot HTML
  const screenshotHtml = entry.screenshot
    ? `
      <div class="entry-screenshot">
        <a href="${entry.screenshot}" target="_blank">
          <img src="${entry.screenshot}" alt="Screenshot" class="screenshot-img">
        </a>
      </div>
    `
    : '';
  
  // Set HTML
  entryElement.innerHTML = `
    <div class="entry-header">
      <img class="favicon" src="${entry.favicon || 'icons/icon16.png'}" alt="">
      <div class="entry-title">
        <a href="${entry.url}" target="_blank">${entry.title}</a>
      </div>
      <div class="entry-time">${formattedDate}</div>
    </div>
    <div class="entry-content">
      <div class="entry-text">
        <div class="entry-summary">${truncatedSummary}</div>
        ${tagsHtml ? `<div class="entry-tags">${tagsHtml}</div>` : ''}
        ${highlightsHtml}
      </div>
      ${screenshotHtml}
    </div>
    <div class="entry-actions">
      <div class="entry-action" data-action="view" data-url="${entry.url}">View Page</div>
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

// Render pagination
function renderPagination(totalPages) {
  // Clear existing pagination
  paginationContainer.innerHTML = '';
  
  // Don't show pagination if there's only one page
  if (totalPages <= 1) {
    return;
  }
  
  // Previous button
  const prevButton = document.createElement('button');
  prevButton.className = 'pagination-button';
  prevButton.textContent = 'Previous';
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderJournalEntries();
    }
  });
  paginationContainer.appendChild(prevButton);
  
  // Page buttons
  const maxButtons = 5;
  const startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  const endPage = Math.min(totalPages, startPage + maxButtons - 1);
  
  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement('button');
    pageButton.className = `pagination-button ${i === currentPage ? 'active' : ''}`;
    pageButton.textContent = i;
    pageButton.addEventListener('click', () => {
      currentPage = i;
      renderJournalEntries();
    });
    paginationContainer.appendChild(pageButton);
  }
  
  // Next button
  const nextButton = document.createElement('button');
  nextButton.className = 'pagination-button';
  nextButton.textContent = 'Next';
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderJournalEntries();
    }
  });
  paginationContainer.appendChild(nextButton);
}

// Delete journal entry
async function deleteJournalEntry(url) {
  if (!confirm('Are you sure you want to delete this journal entry?')) {
    return;
  }
  
  try {
    // Delete from API
    try {
      await ApiUtil.delete(`journal/${encodeURIComponent(url)}`);
    } catch (apiError) {
      console.error('Error deleting entry from API:', apiError);
      // Continue with local deletion if API fails
    }
    
    // Delete from local storage
    chrome.storage.local.get('journalEntries', (data) => {
      if (data.journalEntries) {
        const updatedEntries = data.journalEntries.filter(entry => entry.url !== url);
        
        // Update storage
        chrome.storage.local.set({ journalEntries: updatedEntries }, () => {
          // Update local data
          journalData = journalData.filter(entry => entry.url !== url);
          filteredData = filteredData.filter(entry => entry.url !== url);
          
          // Re-render entries
          renderJournalEntries();
          
          // Extract categories and tags
          extractCategoriesAndTags();
          
          // Populate filter dropdowns
          populateFilters();
        });
      }
    });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    alert('Failed to delete journal entry. Please try again.');
  }
}

// Show loading state
function showLoadingState() {
  loadingState.style.display = 'block';
  emptyState.style.display = 'none';
}

// Hide loading state
function hideLoadingState() {
  loadingState.style.display = 'none';
}

// Show empty state
function showEmptyState() {
  emptyState.style.display = 'block';
}

// Hide empty state
function hideEmptyState() {
  emptyState.style.display = 'none';
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
