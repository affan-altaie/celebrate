const express = require('express');
const router = express.Router();
const { classifyIntent } = require('../ml/intentClassifier');
const { processMessage } = require('../ml/transformerNLU');
const { recommendServices } = require('../ml/recommender');
const sequenceModel = require('../ml/sequenceModel');

// POST /api/chatbot/process
router.post('/process', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 1. Intent Classification (Logistic Regression)
    const { intent, confidence } = classifyIntent(message);

    // 2. Transformer-based NLU (DistilBERT)
    const nluResults = await processMessage(message);

    // 3. Context Handling (LSTM Prediction)
    const nextLikelyIntent = await sequenceModel.predictNext(history || []);

    // 4. Recommendations & Entity Extraction
    let recommendations = [];
    const isRecommendationRequest = intent === 'services' || 
                                    intent === 'service_query' || 
                                    message.toLowerCase().includes('recommend') || 
                                    message.toLowerCase().includes('suggest') || 
                                    message.includes('خدمة') || 
                                    message.includes('ابحث') ||
                                    message.includes('ترشيح');

    if (isRecommendationRequest) {
      // Expanded categories and keywords
      const categories = {
        'catering': ['catering', 'food', 'restaurant', 'caterer', 'chef', 'menu', 'تموين', 'طعام', 'أكل', 'مطعم', 'بوفيه'],
        'photography': ['photography', 'photographer', 'photo', 'camera', 'video', 'shoot', 'تصوير', 'مصور', 'صورة', 'فيديو', 'كاميرا'],
        'wedding-halls': ['hall', 'venue', 'wedding', 'ballroom', 'hotel', 'resort', 'event space', 'قاعة', 'عرس', 'زفاف', 'فندق', 'مكان', 'مناسبة'],
        'birthdays': ['birthday', 'party', 'kids', 'event', 'celebration', 'ميلاد', 'حفلة', 'أطفال', 'فعالية', 'احتفال']
      };

      const lowerMessage = message.toLowerCase();
      let detectedCategories = [];
      
      for (const [cat, keywords] of Object.entries(categories)) {
        if (keywords.some(kw => lowerMessage.includes(kw))) {
          detectedCategories.push(cat);
        }
      }

      if (detectedCategories.length > 0) {
        // Fetch recommendations for each detected category
        for (const cat of detectedCategories) {
          const catRecs = await recommendServices(cat, 2);
          recommendations.push(...catRecs);
        }
      } else if (intent === 'services' || lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
        // If it's a generic recommendation request, provide a diverse mix
        const allCats = Object.keys(categories);
        for (const cat of allCats) {
          const catRecs = await recommendServices(cat, 1);
          recommendations.push(...catRecs);
        }
      }
      
      // Remove duplicates just in case
      recommendations = Array.from(new Map(recommendations.map(item => [item._id.toString(), item])).values());
      // Sort by rating and limit total
      recommendations.sort((a, b) => b.rating - a.rating);
      recommendations = recommendations.slice(0, 5);
    }

    res.json({
      intent,
      confidence,
      nlu: nluResults,
      nextLikelyIntent,
      recommendations,
      message: `Processed intent: ${intent} with confidence ${confidence.toFixed(2)}`
    });
  } catch (error) {
    console.error('Chatbot process error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
