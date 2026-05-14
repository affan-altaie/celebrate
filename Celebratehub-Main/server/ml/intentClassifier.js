const natural = require('natural');
const classifier = new natural.LogisticRegressionClassifier();

// Training Data
const trainingData = [
  // Greeting
  { text: 'hello', label: 'greeting' },
  { text: 'hi', label: 'greeting' },
  { text: 'hey', label: 'greeting' },
  { text: 'good morning', label: 'greeting' },

  // Booking
  { text: 'how to book a service', label: 'booking' },
  { text: 'i want to make a booking', label: 'booking' },
  { text: 'reserve a venue', label: 'booking' },
  { text: 'book a photographer', label: 'booking' },
  { text: 'scheduling an event', label: 'booking' },
  { text: 'how do i book', label: 'booking' },

  // Cancellation
  { text: 'how to cancel my booking', label: 'cancellation' },
  { text: 'cancel reservation', label: 'cancellation' },
  { text: 'i need to cancel', label: 'cancellation' },
  { text: 'refund policy for cancellation', label: 'cancellation' },
  { text: 'can i cancel my event', label: 'cancellation' },

  // FAQ - Services
  { text: 'what services do you offer', label: 'services' },
  { text: 'show me available services', label: 'services' },
  { text: 'list of caterers', label: 'services' },
  { text: 'search for music bands', label: 'services' },
  { text: 'what kind of services do you have', label: 'services' },
  { text: 'list the services', label: 'services' },
  { text: 'can i see the services', label: 'services' },
  { text: 'available event categories', label: 'services' },

  // FAQ - Provider
  { text: 'how to become a provider', label: 'become_provider' },
  { text: 'register as a service provider', label: 'become_provider' },
  { text: 'sell my services', label: 'become_provider' },
  { text: 'provider registration', label: 'become_provider' },

  // FAQ - Payment
  { text: 'how to pay', label: 'payment' },
  { text: 'payment methods', label: 'payment' },
  { text: 'do you accept credit cards', label: 'payment' },
  { text: 'online payment', label: 'payment' },
  { text: 'i have a question regarding the payment', label: 'payment' },
  { text: 'payment inquiry', label: 'payment' },
  { text: 'how much does it cost', label: 'payment' },
  { text: 'pricing information', label: 'payment' },
  { text: 'refund policy', label: 'payment' },

  // Help/Support
  { text: 'help me', label: 'help' },
  { text: 'support', label: 'help' },
  { text: 'contact us', label: 'help' },
  { text: 'i have a problem', label: 'help' },
  { text: 'technical issue', label: 'help' },

  // Complaint/Frustration
  { text: 'i am unhappy', label: 'complaint' },
  { text: 'terrible service', label: 'complaint' },
  { text: 'not happy', label: 'complaint' },
  { text: 'very frustrated', label: 'complaint' },
  { text: 'awful', label: 'complaint' },

  // Dashboard/Profile
  { text: 'where is my dashboard', label: 'dashboard' },
  { text: 'my profile', label: 'dashboard' },
  { text: 'access my account', label: 'dashboard' },
  { text: 'view my settings', label: 'dashboard' },
  { text: 'user profile page', label: 'dashboard' },

  // Reviews
  { text: 'how to leave a review', label: 'reviews' },
  { text: 'can i rate a service', label: 'reviews' },
  { text: 'write a review for provider', label: 'reviews' },
  { text: 'see customer reviews', label: 'reviews' },
  { text: 'feedback on services', label: 'reviews' },

  // Social Media
  { text: 'what is your instagram', label: 'social' },
  { text: 'facebook page link', label: 'social' },
  { text: 'twitter profile', label: 'social' },
  { text: 'are you on social media', label: 'social' },
  { text: 'follow us online', label: 'social' },

  // Technical Support / Password
  { text: 'i forgot my password', label: 'password_reset' },
  { text: 'how to reset password', label: 'password_reset' },
  { text: 'login issues', label: 'login_help' },
  { text: 'cannot access my account', label: 'login_help' },
  { text: 'trouble logging in', label: 'login_help' },

  // Events / Birthday
  { text: 'planning a birthday party', label: 'birthday' },
  { text: 'birthday event packages', label: 'birthday' },
  { text: 'custom party planning', label: 'birthday' },
  { text: 'event for kids', label: 'birthday' },

  // Provider Approvals
  { text: 'my account is still pending', label: 'approvals' },
  { text: 'when will my profile be approved', label: 'approvals' },
  { text: 'admin review process', label: 'approvals' },
  { text: 'status of my registration', label: 'approvals' },

  // Service Specific Queries
  { text: 'i need a caterer', label: 'service_query' },
  { text: 'looking for a photographer', label: 'service_query' },
  { text: 'find me a venue', label: 'service_query' },
  { text: 'music and entertainment options', label: 'service_query' },
  { text: 'decoration and flowers', label: 'service_query' },
  { text: 'dj or band for party', label: 'service_query' },
  { text: 'wedding hall booking', label: 'service_query' },
  { text: 'need a photography service', label: 'service_query' },

  // About CelebrateHub (Generic)
  { text: 'what is celebratehub', label: 'about_celebratehub' },
  { text: 'celebratehub', label: 'about_celebratehub' },
  { text: 'celebrate hub', label: 'about_celebratehub' },
  { text: 'tell me about this website', label: 'about_celebratehub' },
  { text: 'who are you', label: 'about_celebratehub' },
  { text: 'what does celebratehub do', label: 'about_celebratehub' },
  { text: 'celebratehub info', label: 'about_celebratehub' },

  // Mission & Vision
  { text: 'what is your mission', label: 'mission_vision' },
  { text: 'company goals', label: 'mission_vision' },
  { text: 'what is your vision', label: 'mission_vision' },
  { text: 'why did you start celebratehub', label: 'mission_vision' },

  // Location Info
  { text: 'where are you located', label: 'location_info' },
  { text: 'are you in oman', label: 'location_info' },
  { text: 'cities covered', label: 'location_info' },
  { text: 'is celebratehub available in muscat', label: 'location_info' },
  { text: 'your office location', label: 'location_info' },

  // Benefits
  { text: 'why use celebratehub', label: 'benefits' },
  { text: 'advantages of celebratehub', label: 'benefits' },
  { text: 'what makes you special', label: 'benefits' },
  { text: 'why book here', label: 'benefits' },

  // History
  { text: 'when was celebratehub founded', label: 'history' },
  { text: 'company history', label: 'history' },
  { text: 'who founded celebratehub', label: 'history' },
];

// Add training data to classifier
trainingData.forEach(item => {
  classifier.addDocument(item.text, item.label);
});

// Train the classifier
classifier.train();

/**
 * Classify the user message
 * @param {string} message 
 * @returns {Object} { intent, confidence }
 */
const classifyIntent = (message) => {
  if (!message) return { intent: 'default', confidence: 0 };
  
  const classifications = classifier.getClassifications(message.toLowerCase());
  // Sort by value (confidence) descending
  classifications.sort((a, b) => b.value - a.value);
  
  const bestMatch = classifications[0];
  console.log(`Classified: "${message}" -> Intent: ${bestMatch.label} (Confidence: ${bestMatch.value})`);
  
  return {
    intent: bestMatch.label,
    confidence: bestMatch.value
  };
};

module.exports = { classifyIntent };
