const Service = require('../modals/Service');

/**
 * Check if a service has any future availability
 * @param {Object} availability 
 * @returns {boolean}
 */
const isServiceAvailable = (availability) => {
  if (!availability || Object.keys(availability).length === 0) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Object.keys(availability).some(dateStr => {
    const date = new Date(dateStr);
    return date >= today && availability[dateStr].length > 0;
  });
};

/**
 * Recommend services based on a category or query
 * @param {string} category 
 * @param {number} limit 
 * @returns {Promise<Array>} Recommended services
 */
const recommendServices = async (category, limit = 3) => {
  try {
    console.log(`Searching recommendations for category: ${category}`);
    
    // Build query: filter by category if provided, and ensure status is Active
    const query = { status: "Active" };
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }
    
    // Fetch potential recommendations (fetch more than limit to account for availability filtering)
    const potentialRecs = await Service.find(query)
    .sort({ rating: -1 })
    .limit(limit * 10);

    // Filter by availability in memory
    const recommendations = potentialRecs
      .filter(service => isServiceAvailable(service.availability))
      .slice(0, limit);

    console.log(`Found ${recommendations.length} available recommendations`);
    return recommendations;
  } catch (error) {
    console.error('Recommendation error:', error);
    return [];
  }
};

module.exports = { recommendServices };
