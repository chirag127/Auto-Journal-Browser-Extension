// Auto-Journal - Test Script
// Simple test script for the backend API

require('dotenv').config();
const axios = require('axios');

// Configuration
const config = {
  baseUrl: 'https://auto-journal-browser-extension.onrender.com/api',
  testUrl: 'https://example.com',
  testTitle: 'Example Domain',
  testText:
    'This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission. More information...',
};

// Test functions
const tests = {
  // Test logging a page visit
  testLogPageVisit: async () => {
    try {
      console.log('Testing log page visit...');

      const response = await axios.post(`${config.baseUrl}/log`, {
        url: config.testUrl,
        title: config.testTitle,
        text: config.testText,
      });

      console.log('Log page visit response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error testing log page visit:', error.response?.data || error.message);
      throw error;
    }
  },

  // Test summarizing content
  testSummarizeContent: async () => {
    try {
      console.log('Testing summarize content...');

      const response = await axios.post(`${config.baseUrl}/summarize`, {
        url: config.testUrl,
        title: config.testTitle,
        text: config.testText,
      });

      console.log('Summarize content response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error testing summarize content:', error.response?.data || error.message);
      throw error;
    }
  },

  // Test getting journal entries
  testGetJournalEntries: async () => {
    try {
      console.log('Testing get journal entries...');

      const response = await axios.get(`${config.baseUrl}/journal`);

      console.log('Get journal entries response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error testing get journal entries:', error.response?.data || error.message);
      throw error;
    }
  },

  // Test searching journal entries
  testSearchJournalEntries: async () => {
    try {
      console.log('Testing search journal entries...');

      const response = await axios.get(`${config.baseUrl}/journal/search?q=example`);

      console.log('Search journal entries response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error testing search journal entries:', error.response?.data || error.message);
      throw error;
    }
  },

  // Test adding a highlight
  testAddHighlight: async () => {
    try {
      console.log('Testing add highlight...');

      const response = await axios.post(`${config.baseUrl}/journal/highlight`, {
        url: config.testUrl,
        text: 'This domain is for use in illustrative examples in documents.',
        note: 'Example highlight note',
      });

      console.log('Add highlight response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error testing add highlight:', error.response?.data || error.message);
      throw error;
    }
  },

  // Test getting tags
  testGetTags: async () => {
    try {
      console.log('Testing get tags...');

      const response = await axios.get(`${config.baseUrl}/tags`);

      console.log('Get tags response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error testing get tags:', error.response?.data || error.message);
      throw error;
    }
  },
};

// Run all tests
async function runAllTests() {
  try {
    console.log('Running all tests...');

    // Log page visit
    await tests.testLogPageVisit();

    // Summarize content
    await tests.testSummarizeContent();

    // Get journal entries
    await tests.testGetJournalEntries();

    // Search journal entries
    await tests.testSearchJournalEntries();

    // Add highlight
    await tests.testAddHighlight();

    // Get tags
    await tests.testGetTags();

    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run a specific test
async function runTest(testName) {
  try {
    if (tests[testName]) {
      await tests[testName]();
      console.log(`Test ${testName} completed successfully!`);
    } else {
      console.error(`Test ${testName} not found.`);
    }
  } catch (error) {
    console.error(`Error running test ${testName}:`, error);
  }
}

// Check command line arguments
if (process.argv.length > 2) {
  const testName = process.argv[2];
  runTest(testName);
} else {
  runAllTests();
}
