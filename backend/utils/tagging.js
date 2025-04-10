// Auto-Journal - Tagging Utility
// Provides functions for tag management

const Tag = require('../models/tag');

/**
 * Update tag count
 * @param {string} tagName - Tag name
 * @param {string} category - Category
 * @param {number} increment - Amount to increment (default: 1)
 * @returns {Promise<Object>} - Updated tag
 */
exports.updateTagCount = async (tagName, category = '', increment = 1) => {
  try {
    // Normalize tag name
    const normalizedTag = tagName.trim().toLowerCase();
    
    // Find or create tag
    let tag = await Tag.findOne({ name: normalizedTag });
    
    if (tag) {
      // Update existing tag
      tag.count += increment;
      
      // Ensure count is not negative
      if (tag.count < 0) {
        tag.count = 0;
      }
      
      // Update category if provided and tag doesn't have one
      if (category && !tag.category) {
        tag.category = category;
      }
      
      await tag.save();
    } else if (increment > 0) {
      // Only create new tag if increment is positive
      tag = new Tag({
        name: normalizedTag,
        category,
        count: increment
      });
      
      await tag.save();
    }
    
    return tag;
  } catch (error) {
    console.error('Error updating tag count:', error);
    throw error;
  }
};

/**
 * Get popular tags
 * @param {number} limit - Maximum number of tags to return
 * @returns {Promise<Array>} - Popular tags
 */
exports.getPopularTags = async (limit = 20) => {
  try {
    const tags = await Tag.find()
      .sort({ count: -1 })
      .limit(limit);
    
    return tags;
  } catch (error) {
    console.error('Error getting popular tags:', error);
    throw error;
  }
};

/**
 * Get tags by category
 * @param {string} category - Category
 * @returns {Promise<Array>} - Tags in category
 */
exports.getTagsByCategory = async (category) => {
  try {
    const tags = await Tag.find({ category })
      .sort({ count: -1 });
    
    return tags;
  } catch (error) {
    console.error('Error getting tags by category:', error);
    throw error;
  }
};

/**
 * Search tags
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Matching tags
 */
exports.searchTags = async (query) => {
  try {
    const tags = await Tag.find({
      name: { $regex: query, $options: 'i' }
    }).sort({ count: -1 });
    
    return tags;
  } catch (error) {
    console.error('Error searching tags:', error);
    throw error;
  }
};
