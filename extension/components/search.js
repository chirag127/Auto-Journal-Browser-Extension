// Auto-Journal - Search Component
// Component for search functionality

/**
 * Create search bar element
 * @param {Function} onSearch - Search callback
 * @returns {HTMLElement} - Search bar element
 */
function createSearchBar(onSearch) {
  const searchBar = document.createElement('div');
  searchBar.className = 'search-bar';
  
  searchBar.innerHTML = `
    <input type="text" class="search-input" placeholder="Search journal...">
  `;
  
  const searchInput = searchBar.querySelector('.search-input');
  
  // Add event listener
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    if (onSearch) onSearch(query);
  });
  
  return searchBar;
}

/**
 * Create filter element
 * @param {Array<string>} categories - Available categories
 * @param {Array<string>} tags - Available tags
 * @param {Function} onFilter - Filter callback
 * @returns {HTMLElement} - Filter element
 */
function createFilterElement(categories, tags, onFilter) {
  const filterElement = document.createElement('div');
  filterElement.className = 'filter-element';
  
  // Create category options
  const categoryOptions = categories.map(category => 
    `<option value="${category}">${category}</option>`
  ).join('');
  
  // Create tag options (top 10)
  const tagOptions = tags.slice(0, 10).map(tag => 
    `<option value="${tag}">${tag}</option>`
  ).join('');
  
  filterElement.innerHTML = `
    <div class="filter-row">
      <div class="filter-group">
        <label for="category-filter">Category:</label>
        <select id="category-filter">
          <option value="">All Categories</option>
          ${categoryOptions}
        </select>
      </div>
      <div class="filter-group">
        <label for="tag-filter">Tag:</label>
        <select id="tag-filter">
          <option value="">All Tags</option>
          ${tagOptions}
        </select>
      </div>
    </div>
    <div class="filter-row">
      <div class="filter-group">
        <label for="start-date">From:</label>
        <input type="date" id="start-date">
      </div>
      <div class="filter-group">
        <label for="end-date">To:</label>
        <input type="date" id="end-date">
      </div>
    </div>
  `;
  
  // Add event listeners
  const categoryFilter = filterElement.querySelector('#category-filter');
  const tagFilter = filterElement.querySelector('#tag-filter');
  const startDate = filterElement.querySelector('#start-date');
  const endDate = filterElement.querySelector('#end-date');
  
  const filters = [categoryFilter, tagFilter, startDate, endDate];
  
  filters.forEach(filter => {
    filter.addEventListener('change', () => {
      if (onFilter) {
        onFilter({
          category: categoryFilter.value,
          tag: tagFilter.value,
          startDate: startDate.value,
          endDate: endDate.value
        });
      }
    });
  });
  
  return filterElement;
}

/**
 * Filter entries by search query
 * @param {Array<Object>} entries - Journal entries
 * @param {string} query - Search query
 * @returns {Array<Object>} - Filtered entries
 */
function filterEntriesByQuery(entries, query) {
  if (!query) return entries;
  
  const lowerQuery = query.toLowerCase();
  
  return entries.filter(entry => 
    entry.title.toLowerCase().includes(lowerQuery) || 
    (entry.content.text && entry.content.text.toLowerCase().includes(lowerQuery)) ||
    (entry.content.summary && entry.content.summary.toLowerCase().includes(lowerQuery)) ||
    entry.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    (entry.highlights && entry.highlights.some(highlight => 
      highlight.text.toLowerCase().includes(lowerQuery) ||
      (highlight.note && highlight.note.toLowerCase().includes(lowerQuery))
    ))
  );
}

/**
 * Filter entries by criteria
 * @param {Array<Object>} entries - Journal entries
 * @param {Object} filters - Filter criteria
 * @returns {Array<Object>} - Filtered entries
 */
function filterEntriesByCriteria(entries, filters) {
  return entries.filter(entry => {
    // Category filter
    if (filters.category && entry.category !== filters.category) {
      return false;
    }
    
    // Tag filter
    if (filters.tag && !entry.tags.includes(filters.tag)) {
      return false;
    }
    
    // Date range filter
    if (filters.startDate || filters.endDate) {
      const visitDate = new Date(entry.visitTime);
      
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        if (visitDate < startDate) {
          return false;
        }
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999); // End of day
        if (visitDate > endDate) {
          return false;
        }
      }
    }
    
    return true;
  });
}

// Export functions
export { 
  createSearchBar, 
  createFilterElement, 
  filterEntriesByQuery, 
  filterEntriesByCriteria 
};
