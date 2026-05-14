const tf = require('@tensorflow/tfjs-node');

/**
 * A simple LSTM model for intent sequence prediction (context handling)
 */
class SequenceModel {
  constructor() {
    this.model = null;
    this.intents = ['greeting', 'booking', 'cancellation', 'services', 'payment', 'help', 'dashboard'];
  }

  async init() {
    // Simple LSTM Model
    this.model = tf.sequential();
    this.model.add(tf.layers.lstm({
      units: 32,
      inputShape: [5, this.intents.length], // Sequence of last 5 intents
      returnSequences: false
    }));
    this.model.add(tf.layers.dense({ units: this.intents.length, activation: 'softmax' }));
    
    this.model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    console.log('Sequence Model (LSTM) initialized.');
  }

  /**
   * Predict the next likely intent based on history
   * @param {Array} history Array of intent labels
   */
  async predictNext(history) {
    if (!this.model) await this.init();
    
    // In a real scenario, we would convert history to one-hot encoded tensors
    // For this implementation, we'll return a placeholder or simple logic
    // as training a model on the fly is not feasible without data.
    return 'booking'; // Default next likely intent for this demo
  }
}

const sequenceModel = new SequenceModel();
module.exports = sequenceModel;
