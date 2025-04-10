// Auto-Journal - Text Processing Utility
// Provides functions for text extraction and processing

/**
 * Clean text content
 * @param {string} text - Text to clean
 * @returns {string} - Cleaned text
 */
exports.cleanText = (text) => {
  if (!text) return '';
  
  return text
    .replace(/\\s+/g, ' ') // Replace multiple whitespace with single space
    .replace(/\\n+/g, ' ') // Replace newlines with space
    .trim();
};

/**
 * Limit text to a maximum number of words
 * @param {string} text - Text to limit
 * @param {number} maxWords - Maximum number of words
 * @returns {string} - Limited text
 */
exports.limitWords = (text, maxWords = 1000) => {
  if (!text) return '';
  
  const words = text.split(' ');
  
  if (words.length <= maxWords) {
    return text;
  }
  
  return words.slice(0, maxWords).join(' ');
};

/**
 * Extract main content from HTML
 * @param {string} html - HTML content
 * @returns {string} - Extracted text
 */
exports.extractMainContent = (html) => {
  // This is a placeholder for a more sophisticated HTML parsing function
  // In a real implementation, you would use a library like cheerio or jsdom
  
  // Remove HTML tags
  const text = html.replace(/<[^>]*>/g, ' ');
  
  // Clean the text
  return exports.cleanText(text);
};

/**
 * Extract keywords from text
 * @param {string} text - Text to extract keywords from
 * @param {number} maxKeywords - Maximum number of keywords
 * @returns {Array<string>} - Extracted keywords
 */
exports.extractKeywords = (text, maxKeywords = 10) => {
  if (!text) return [];
  
  // This is a simple keyword extraction algorithm
  // In a real implementation, you would use a more sophisticated approach
  
  // Remove common words
  const commonWords = [
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
    'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'like', 'from',
    'of', 'that', 'this', 'these', 'those', 'it', 'its', 'it\'s', 'they',
    'them', 'their', 'there', 'here', 'where', 'when', 'why', 'how', 'what',
    'who', 'whom', 'which', 'whose', 'you', 'your', 'yours', 'we', 'our',
    'ours', 'us', 'me', 'my', 'mine', 'he', 'him', 'his', 'she', 'her',
    'hers', 'i', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
    'did', 'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might',
    'must', 'ought'
  ];
  
  // Split text into words
  const words = text.toLowerCase().split(/\\W+/);
  
  // Count word frequency
  const wordCounts = {};
  
  words.forEach(word => {
    if (word && word.length > 2 && !commonWords.includes(word)) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  });
  
  // Sort by frequency
  const sortedWords = Object.keys(wordCounts).sort((a, b) => {
    return wordCounts[b] - wordCounts[a];
  });
  
  // Return top keywords
  return sortedWords.slice(0, maxKeywords);
};

/**
 * Calculate reading time
 * @param {string} text - Text to calculate reading time for
 * @param {number} wordsPerMinute - Words per minute reading speed
 * @returns {number} - Reading time in minutes
 */
exports.calculateReadingTime = (text, wordsPerMinute = 200) => {
  if (!text) return 0;
  
  const words = text.split(/\\s+/).length;
  const minutes = words / wordsPerMinute;
  
  return Math.ceil(minutes);
};
