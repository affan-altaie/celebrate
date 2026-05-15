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
   * @param {Array} history Array of message strings
   */
  async predictNext(history) {
    if (!this.model) await this.init();
    
    if (!history || history.length === 0) return 'greeting';

    const lastMessage = history[history.length - 1].toLowerCase();

    // Simple contextual logic to simulate sequence prediction
    if (lastMessage.includes('service') || lastMessage.includes('خدمة')) {
      return 'booking';
    }
    if (lastMessage.includes('book') || lastMessage.includes('حجز')) {
      return 'payment';
    }
    if (lastMessage.includes('price') || lastMessage.includes('سعر') || lastMessage.includes('بكم')) {
      return 'booking';
    }
    if (lastMessage.includes('problem') || lastMessage.includes('مشكلة')) {
      return 'help';
    }

    return 'services'; 
  }
}

const sequenceModel = new SequenceModel();
module.exports = sequenceModel;
