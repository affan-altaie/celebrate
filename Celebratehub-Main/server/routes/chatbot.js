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

    // 4. Recommendations
    let recommendations = [];
    if (intent === 'services' || message.includes('recommend')) {
      recommendations = await recommendServices('catering'); // Example: default to catering or extract from message
    }

    res.json({
      intent,
      confidence,
      nlu: nluResults,
      nextLikelyIntent,
      recommendations,
      message: `Processed intent: ${intent} with confidence ${confidence}`
    });
  } catch (error) {
    console.error('Chatbot process error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
