// Auto-Journal - Highlight Component
// Component for handling highlights

/**
 * Create a highlight element
 * @param {Object} highlight - Highlight data with page info
 * @param {Function} onView - View callback
 * @returns {HTMLElement} - Highlight element
 */
function createHighlightElement(highlight, onView) {
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
      <div class="entry-action view-action">View Source</div>
    </div>
  `;
  
  // Add event listeners
  const viewAction = highlightElement.querySelector('.view-action');
  
  viewAction.addEventListener('click', () => {
    if (onView) onView(highlight);
  });
  
  return highlightElement;
}

/**
 * Create highlight button
 * @param {Selection} selection - Text selection
 * @param {Function} onSave - Save callback
 * @returns {HTMLElement} - Button element
 */
function createHighlightButton(selection, onSave) {
  // Create button element
  const button = document.createElement('div');
  button.id = 'auto-journal-highlight-button';
  button.textContent = '📝 Save';
  button.style.position = 'absolute';
  button.style.zIndex = '10000';
  button.style.background = '#4285f4';
  button.style.color = 'white';
  button.style.padding = '5px 10px';
  button.style.borderRadius = '3px';
  button.style.fontSize = '12px';
  button.style.cursor = 'pointer';
  button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  
  // Position the button near the selection
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  button.style.top = `${window.scrollY + rect.bottom + 5}px`;
  button.style.left = `${window.scrollX + rect.left}px`;
  
  // Add click event
  button.addEventListener('click', () => {
    if (onSave) onSave(selection.toString());
    button.remove();
  });
  
  return button;
}

/**
 * Format date
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date
 */
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

/**
 * Format time
 * @param {Date} date - Date to format
 * @returns {string} - Formatted time
 */
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Export functions
export { createHighlightElement, createHighlightButton, formatDate, formatTime };
