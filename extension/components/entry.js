// Auto-Journal - Entry Component
// Component for rendering journal entries

/**
 * Create a journal entry element
 * @param {Object} entry - Journal entry data
 * @param {Function} onView - View callback
 * @param {Function} onDelete - Delete callback
 * @returns {HTMLElement} - Entry element
 */
function createEntryElement(entry, onView, onDelete) {
  const entryElement = document.createElement('div');
  entryElement.className = 'journal-entry';
  
  // Format date
  const visitDate = new Date(entry.visitTime);
  const formattedDate = formatDate(visitDate);
  
  // Truncate summary
  const summary = entry.content.summary || 'No summary available';
  const truncatedSummary = summary.length > 150
    ? summary.substring(0, 150) + '...'
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
      <div class="entry-action view-action">View</div>
      <div class="entry-action delete-action">Delete</div>
    </div>
  `;
  
  // Add event listeners
  const viewAction = entryElement.querySelector('.view-action');
  const deleteAction = entryElement.querySelector('.delete-action');
  
  viewAction.addEventListener('click', () => {
    if (onView) onView(entry);
  });
  
  deleteAction.addEventListener('click', () => {
    if (onDelete) onDelete(entry);
  });
  
  return entryElement;
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
export { createEntryElement, formatDate, formatTime };
