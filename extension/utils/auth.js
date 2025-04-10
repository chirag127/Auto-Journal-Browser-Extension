// Auto-Journal - Authentication Utility
// Provides functions for user authentication

/**
 * Authentication utility
 */
const AuthUtil = {
  // API base URL
  apiBaseUrl: 'http://localhost:3000/api',
  
  /**
   * Register a new user
   * @param {string} userId - User ID
   * @param {string} password - Password
   * @returns {Promise<Object>} - Response with token and user data
   */
  register: async (userId, password) => {
    try {
      const response = await fetch(`${AuthUtil.apiBaseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, password })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }
      
      const data = await response.json();
      
      // Store token in local storage
      await AuthUtil.setToken(data.token);
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  /**
   * Login user
   * @param {string} userId - User ID
   * @param {string} password - Password
   * @returns {Promise<Object>} - Response with token and user data
   */
  login: async (userId, password) => {
    try {
      const response = await fetch(`${AuthUtil.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, password })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }
      
      const data = await response.json();
      
      // Store token in local storage
      await AuthUtil.setToken(data.token);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  /**
   * Get user data
   * @returns {Promise<Object>} - User data
   */
  getUser: async () => {
    try {
      const token = await AuthUtil.getToken();
      
      if (!token) {
        throw new Error('No token found');
      }
      
      const response = await fetch(`${AuthUtil.apiBaseUrl}/auth/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get user data');
      }
      
      return response.json();
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },
  
  /**
   * Update user settings
   * @param {Object} settings - User settings
   * @returns {Promise<Object>} - Updated user data
   */
  updateSettings: async (settings) => {
    try {
      const token = await AuthUtil.getToken();
      
      if (!token) {
        throw new Error('No token found');
      }
      
      const response = await fetch(`${AuthUtil.apiBaseUrl}/auth/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ settings })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update settings');
      }
      
      return response.json();
    } catch (error) {
      console.error('Update settings error:', error);
      throw error;
    }
  },
  
  /**
   * Logout user
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      // Remove token from local storage
      await AuthUtil.removeToken();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  /**
   * Check if user is authenticated
   * @returns {Promise<boolean>} - True if authenticated
   */
  isAuthenticated: async () => {
    try {
      const token = await AuthUtil.getToken();
      return !!token;
    } catch (error) {
      console.error('Authentication check error:', error);
      return false;
    }
  },
  
  /**
   * Get authentication token
   * @returns {Promise<string|null>} - Token or null
   */
  getToken: async () => {
    return new Promise((resolve) => {
      chrome.storage.local.get('authToken', (result) => {
        resolve(result.authToken || null);
      });
    });
  },
  
  /**
   * Set authentication token
   * @param {string} token - Token to store
   * @returns {Promise<void>}
   */
  setToken: async (token) => {
    return new Promise((resolve) => {
      chrome.storage.local.set({ authToken: token }, resolve);
    });
  },
  
  /**
   * Remove authentication token
   * @returns {Promise<void>}
   */
  removeToken: async () => {
    return new Promise((resolve) => {
      chrome.storage.local.remove('authToken', resolve);
    });
  },
  
  /**
   * Add authentication header to fetch options
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} - Updated fetch options
   */
  addAuthHeader: async (options = {}) => {
    const token = await AuthUtil.getToken();
    
    if (!token) {
      return options;
    }
    
    return {
      ...options,
      headers: {
        ...options.headers,
        'x-auth-token': token
      }
    };
  }
};

export default AuthUtil;
