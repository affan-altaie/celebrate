const Service = require('../modals/Service');

/**
 * Recommend services based on a category or query
 * @param {string} category 
 * @param {number} limit 
 * @returns {Promise<Array>} Recommended services
 */
const recommendServices = async (category, limit = 3) => {
  try {
    console.log(`Searching recommendations for category: ${category}`);
    // Simple Content-based filtering: Find top rated services in the same category
    const query = category ? { category: { $regex: category, $options: 'i' } } : {};
    
    const recommendations = await Service.find(query)
    .sort({ rating: -1 })
    .limit(limit);

    console.log(`Found ${recommendations.length} recommendations`);
    return recommendations;
  } catch (error) {
    console.error('Recommendation error:', error);
    return [];
  }
};

module.exports = { recommendServices };
