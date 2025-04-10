// Auto-Journal - Image Upload Utility
// Handles uploading images to freeimage.host

const axios = require('axios');
const FormData = require('form-data');

/**
 * Uploads an image to freeimage.host
 * @param {string} imageBase64 - Base64 encoded image data (without the data:image/png;base64, prefix)
 * @returns {Promise<string>} - URL of the uploaded image
 */
const uploadToFreeImageHost = async imageBase64 => {
  if (!imageBase64 || imageBase64.length < 100) {
    console.error('Invalid image data provided');
    throw new Error('Invalid image data');
  }

  const api_key = '6d207e02198a847aa98d0a2a901485a5';
  const api_url = 'https://freeimage.host/api/1/upload';
  const formData = new FormData();

  try {
    // Add data to form
    formData.append('key', api_key);
    formData.append('source', imageBase64);
    formData.append('action', 'upload');
    formData.append('format', 'json');

    console.log('Sending image upload request to freeimage.host');

    const response = await axios.post(api_url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 second timeout
    });

    if (
      response.status === 200 &&
      response.data &&
      response.data.image &&
      response.data.image.url
    ) {
      console.log('Image uploaded successfully to:', response.data.image.url);
      return response.data.image.url;
    } else {
      console.error('Unexpected response from image host:', response.data);
      throw new Error('Failed to upload image: Unexpected response');
    }
  } catch (error) {
    console.error('Error uploading image:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
};

module.exports = { uploadToFreeImageHost };
