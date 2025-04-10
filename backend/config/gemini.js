// Auto-Journal - Gemini API Configuration
// Handles Gemini API setup and authentication

const axios = require('axios');

// Gemini API configuration
const geminiConfig = {
  apiKey: process.env.GEMINI_API_KEY,
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
  model: 'gemini-1.5-flash-latest', // Using the Flash Lite model
  maxRetries: 3,
  timeout: 30000 // 30 seconds
};

// Create Gemini API client
const geminiClient = {
  /**
   * Generate content using Gemini API
   * @param {string} prompt - Text prompt
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - API response
   */
  generateContent: async (prompt, options = {}) => {
    try {
      const url = `${geminiConfig.baseUrl}/${geminiConfig.model}:generateContent?key=${geminiConfig.apiKey}`;
      
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: options.temperature || 0.4,
          topK: options.topK || 32,
          topP: options.topP || 0.95,
          maxOutputTokens: options.maxOutputTokens || 1024,
          stopSequences: options.stopSequences || []
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };
      
      const response = await axios.post(url, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: geminiConfig.timeout
      });
      
      return response.data;
    } catch (error) {
      console.error('Gemini API error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  /**
   * Generate a summary of text content
   * @param {string} text - Text to summarize
   * @param {string} title - Title of the content
   * @param {string} url - URL of the content
   * @returns {Promise<string>} - Generated summary
   */
  generateSummary: async (text, title, url) => {
    try {
      const prompt = `
        Summarize the following webpage content in 3-4 concise sentences. Focus on the main points and key information.
        
        Title: ${title}
        URL: ${url}
        
        Content:
        ${text.substring(0, 10000)} // Limit to 10k chars to avoid token limits
      `;
      
      const response = await geminiClient.generateContent(prompt, {
        temperature: 0.2, // Lower temperature for more factual output
        maxOutputTokens: 256 // Limit summary length
      });
      
      // Extract the generated text
      const summary = response.candidates[0].content.parts[0].text.trim();
      
      return summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      return 'Summary generation failed. Please try again later.';
    }
  },
  
  /**
   * Generate tags for content
   * @param {string} text - Text to generate tags for
   * @param {string} title - Title of the content
   * @returns {Promise<Array<string>>} - Generated tags
   */
  generateTags: async (text, title) => {
    try {
      const prompt = `
        Generate 3-5 relevant tags for the following content. Return only the tags as a comma-separated list.
        
        Title: ${title}
        
        Content:
        ${text.substring(0, 5000)} // Limit to 5k chars
      `;
      
      const response = await geminiClient.generateContent(prompt, {
        temperature: 0.3,
        maxOutputTokens: 100
      });
      
      // Extract the generated text and split into tags
      const tagsText = response.candidates[0].content.parts[0].text.trim();
      const tags = tagsText.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      return tags;
    } catch (error) {
      console.error('Error generating tags:', error);
      return [];
    }
  },
  
  /**
   * Generate a note for a highlighted text
   * @param {string} text - Highlighted text
   * @param {string} pageTitle - Title of the page
   * @returns {Promise<string>} - Generated note
   */
  generateHighlightNote: async (text, pageTitle) => {
    try {
      const prompt = `
        Write a brief, insightful note about why this highlighted text might be important or what key insight it contains.
        Keep it under 100 characters if possible.
        
        Page Title: ${pageTitle}
        
        Highlighted Text:
        "${text}"
      `;
      
      const response = await geminiClient.generateContent(prompt, {
        temperature: 0.4,
        maxOutputTokens: 150
      });
      
      // Extract the generated text
      const note = response.candidates[0].content.parts[0].text.trim();
      
      return note;
    } catch (error) {
      console.error('Error generating highlight note:', error);
      return '';
    }
  },
  
  /**
   * Determine the category of content
   * @param {string} text - Text to categorize
   * @param {string} title - Title of the content
   * @returns {Promise<string>} - Category
   */
  determineCategory: async (text, title) => {
    try {
      const prompt = `
        Determine the most appropriate single category for this content from the following options:
        - Technology
        - Business
        - Health
        - Science
        - Education
        - Entertainment
        - Sports
        - Politics
        - Travel
        - Other
        
        Return only the category name, nothing else.
        
        Title: ${title}
        
        Content:
        ${text.substring(0, 3000)} // Limit to 3k chars
      `;
      
      const response = await geminiClient.generateContent(prompt, {
        temperature: 0.1, // Very low temperature for consistent categorization
        maxOutputTokens: 20
      });
      
      // Extract the generated category
      const category = response.candidates[0].content.parts[0].text.trim();
      
      return category;
    } catch (error) {
      console.error('Error determining category:', error);
      return 'Other';
    }
  }
};

module.exports = geminiClient;
