// Auto-Journal - API Utility
// Provides functions for interacting with the backend API

import AuthUtil from './auth.js';

const ApiUtil = {
  // Base URL for API requests
  baseUrl: 'https://auto-journal-browser-extension.onrender.com/api',

  /**
   * Make a GET request to the API
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - API response
   */
  get: async (endpoint, params = {}) => {
    try {
      // Build query string
      const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');

      const url = `${ApiUtil.baseUrl}/${endpoint}${queryString ? `?${queryString}` : ''}`;

      // Get auth token
      const token = await AuthUtil.getToken();

      // Set up headers
      const headers = {
        'Content-Type': 'application/json'
      };

      // Add auth token if available
      if (token) {
        headers['x-auth-token'] = token;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API GET error:', error);
      throw error;
    }
  },

  /**
   * Make a POST request to the API
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise<Object>} - API response
   */
  post: async (endpoint, data = {}) => {
    try {
      const url = `${ApiUtil.baseUrl}/${endpoint}`;

      // Get auth token
      const token = await AuthUtil.getToken();

      // Set up headers
      const headers = {
        'Content-Type': 'application/json'
      };

      // Add auth token if available
      if (token) {
        headers['x-auth-token'] = token;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API POST error:', error);
      throw error;
    }
  },

  /**
   * Make a PATCH request to the API
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise<Object>} - API response
   */
  patch: async (endpoint, data = {}) => {
    try {
      const url = `${ApiUtil.baseUrl}/${endpoint}`;

      // Get auth token
      const token = await AuthUtil.getToken();

      // Set up headers
      const headers = {
        'Content-Type': 'application/json'
      };

      // Add auth token if available
      if (token) {
        headers['x-auth-token'] = token;
      }

      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API PATCH error:', error);
      throw error;
    }
  },

  /**
   * Make a DELETE request to the API
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Object>} - API response
   */
  delete: async (endpoint) => {
    try {
      const url = `${ApiUtil.baseUrl}/${endpoint}`;

      // Get auth token
      const token = await AuthUtil.getToken();

      // Set up headers
      const headers = {
        'Content-Type': 'application/json'
      };

      // Add auth token if available
      if (token) {
        headers['x-auth-token'] = token;
      }

      const response = await fetch(url, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API DELETE error:', error);
      throw error;
    }
  },

  /**
   * Log a page visit
   * @param {Object} data - Page data
   * @returns {Promise<Object>} - API response
   */
  logPageVisit: (data) => {
    return ApiUtil.post('log', data);
  },

  /**
   * Get a summary for page content
   * @param {Object} data - Page data
   * @returns {Promise<Object>} - API response with summary
   */
  getSummary: (data) => {
    return ApiUtil.post('summarize', data);
  },

  /**
   * Save a highlight
   * @param {Object} data - Highlight data
   * @returns {Promise<Object>} - API response
   */
  saveHighlight: (data) => {
    return ApiUtil.post('highlight', data);
  },

  /**
   * Get journal entries
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - API response with journal entries
   */
  getJournal: (params = {}) => {
    return ApiUtil.get('journal', params);
  },

  /**
   * Update tags for an entry
   * @param {string} url - URL of the entry
   * @param {Array<string>} tags - New tags
   * @returns {Promise<Object>} - API response
   */
  updateTags: (url, tags) => {
    return ApiUtil.patch(`tags/${encodeURIComponent(url)}`, { tags });
  }
};

export default ApiUtil;
