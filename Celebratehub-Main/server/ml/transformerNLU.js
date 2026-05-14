const { pipeline } = require('@xenova/transformers');

let nluPipeline = null;

/**
 * Initialize the transformer pipeline
 */
const initNLU = async () => {
  if (!nluPipeline) {
    // Using a small, fast model for NLU/Sentiment/Classification
    // 'Xenova/distilbert-base-uncased-finetuned-sst-2-english' is good for sentiment/nuance
    nluPipeline = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
    console.log('Transformer NLU Pipeline initialized.');
  }
};

/**
 * Process message with Transformer model
 * @param {string} message 
 * @returns {Promise<Object>} NLU results
 */
const processMessage = async (message) => {
  await initNLU();
  const results = await nluPipeline(message);
  return results[0]; // Returns { label: 'POSITIVE'/'NEGATIVE', score: 0.99 }
};

module.exports = { initNLU, processMessage };
