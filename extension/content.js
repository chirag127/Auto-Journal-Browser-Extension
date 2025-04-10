// Auto-Journal - Content Script
// Extracts page content and handles highlighting

// Configuration
const config = {
  maxContentLength: 1000, // Maximum number of words to capture
  highlightClass: 'auto-journal-highlight',
  captureScreenshot: true // Whether to capture screenshots
};

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getPageContent') {
    // Extract page content
    const content = extractPageContent();

    // Send content back to background script
    chrome.runtime.sendMessage({
      action: 'pageContent',
      data: content
    });

    sendResponse({ status: 'content extracted' });
  }

  // Return true to indicate async response
  return true;
});

// Extract page content
function extractPageContent() {
  try {
    // Get the main content of the page
    const mainContent = getMainContent();

    // Extract text content
    const textContent = mainContent.textContent || '';

    // Limit to max content length (words)
    const words = textContent.split(/\\s+/);
    const limitedText = words.slice(0, config.maxContentLength).join(' ').trim();

    // Capture screenshot if enabled
    let screenshot = null;
    if (config.captureScreenshot) {
      screenshot = captureVisibleScreenshot();
    }

    return {
      text: limitedText,
      title: document.title,
      url: window.location.href,
      screenshot: screenshot
    };
  } catch (error) {
    console.error('Error extracting page content:', error);
    return {
      text: '',
      title: document.title,
      url: window.location.href
    };
  }
}

// Capture visible screenshot
async function captureVisibleScreenshot() {
  try {
    // Send a message to the background script to capture the screenshot
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'captureScreenshot' }, (response) => {
        if (response && response.screenshot) {
          resolve(response.screenshot);
        } else {
          resolve(null);
        }
      });

      // Set a timeout in case the background script doesn't respond
      setTimeout(() => {
        resolve(null);
      }, 5000);
    });
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    return null;
  }
}

// Get the main content of the page
function getMainContent() {
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
}

// Set up highlight functionality
document.addEventListener('mouseup', function(event) {
  const selection = window.getSelection();

  if (selection.toString().length > 0) {
    // Show highlight button
    showHighlightButton(selection, event);
  } else {
    // Hide highlight button if visible
    const button = document.getElementById('auto-journal-highlight-button');
    if (button) {
      button.remove();
    }
  }
});

// Show highlight button
function showHighlightButton(selection, event) {
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

  // Add click event
  button.addEventListener('click', function() {
    saveHighlight(selection.toString());
    button.remove();
  });

  // Add to document
  document.body.appendChild(button);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (document.body.contains(button)) {
      button.remove();
    }
  }, 3000);
}

// Save highlight
function saveHighlight(text) {
  if (!text) return;

  // Send highlight to background script
  chrome.runtime.sendMessage({
    action: 'saveHighlight',
    text: text
  });

  // Show confirmation toast
  showToast('Highlight saved to Auto-Journal');
}

// Show toast notification
function showToast(message) {
  const toast = document.createElement('div');
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

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
}
