// Auto-Journal - DOM Utility
// Provides functions for DOM manipulation and content extraction

const DomUtil = {
  /**
   * Extract the main content from a webpage
   * @returns {Element} - Main content element
   */
  getMainContent: () => {
    // Try to find the main content element
    // This is a simple heuristic and may need to be improved for different sites
    const contentSelectors = [
      'article',
      'main',
      '.content',
      '#content',
      '.article',
      '#article',
      '.post',
      '#post',
      '.main',
      'section'
    ];
    
    // Try each selector
    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.length > 200) {
        return element;
      }
    }
    
    // If no suitable element found, use the body
    return document.body;
  },
  
  /**
   * Extract text content from the page
   * @param {number} maxWords - Maximum number of words to extract
   * @returns {string} - Extracted text
   */
  extractTextContent: (maxWords = 1000) => {
    try {
      // Get the main content of the page
      const mainContent = DomUtil.getMainContent();
      
      // Extract text content
      const textContent = mainContent.textContent || '';
      
      // Clean up the text (remove extra whitespace)
      const cleanText = textContent
        .replace(/\\s+/g, ' ')
        .trim();
      
      // Limit to max words
      const words = cleanText.split(' ');
      const limitedText = words.slice(0, maxWords).join(' ');
      
      return limitedText;
    } catch (error) {
      console.error('Error extracting text content:', error);
      return '';
    }
  },
  
  /**
   * Create a highlight element
   * @param {Range} range - Selection range
   * @returns {Element} - Highlight element
   */
  createHighlightElement: (range) => {
    const span = document.createElement('span');
    span.className = 'auto-journal-highlight';
    
    try {
      range.surroundContents(span);
      return span;
    } catch (error) {
      console.error('Error creating highlight:', error);
      return null;
    }
  },
  
  /**
   * Show a highlight button near a selection
   * @param {Selection} selection - Text selection
   * @param {Event} event - Mouse event
   * @returns {Element} - Button element
   */
  showHighlightButton: (selection, event) => {
    // Remove existing button if any
    const existingButton = document.getElementById('auto-journal-highlight-button');
    if (existingButton) {
      existingButton.remove();
    }
    
    // Create highlight button
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
    
    // Add to document
    document.body.appendChild(button);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (document.body.contains(button)) {
        button.remove();
      }
    }, 3000);
    
    return button;
  },
  
  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {number} duration - Duration in milliseconds
   */
  showToast: (message, duration = 3000) => {
    const toast = document.createElement('div');
    toast.className = 'auto-journal-toast';
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = '#333';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '4px';
    toast.style.zIndex = '10000';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    
    document.body.appendChild(toast);
    
    // Fade in
    setTimeout(() => {
      toast.style.opacity = '1';
    }, 10);
    
    // Remove after duration
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, duration);
  }
};

export default DomUtil;
