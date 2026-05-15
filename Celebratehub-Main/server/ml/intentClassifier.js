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
  { text: 'what do you recommend', label: 'services' },
  { text: 'suggest some services', label: 'services' },
  { text: 'recommendations', label: 'services' },
  { text: 'give me ideas', label: 'services' },
  { text: 'what should i book', label: 'services' },
  { text: 'best services', label: 'services' },

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

  // --- Arabic Phrases ---
  // Greeting
  { text: 'أهلا', label: 'greeting' },
  { text: 'مرحبا', label: 'greeting' },
  { text: 'سلام', label: 'greeting' },
  { text: 'صباح الخير', label: 'greeting' },
  { text: 'مساء الخير', label: 'greeting' },
  { text: 'أهلا بك', label: 'greeting' },

  // Booking
  { text: 'كيف أحجز خدمة', label: 'booking' },
  { text: 'أريد القيام بحجز', label: 'booking' },
  { text: 'حجز قاعة', label: 'booking' },
  { text: 'أريد حجز مصور', label: 'booking' },
  { text: 'كيفية الحجز', label: 'booking' },
  { text: 'أحجز الآن', label: 'booking' },

  // Cancellation
  { text: 'كيف ألغي حجزي', label: 'cancellation' },
  { text: 'إلغاء الحجز', label: 'cancellation' },
  { text: 'أريد الغاء الطلب', label: 'cancellation' },
  { text: 'سياسة الإلغاء', label: 'cancellation' },
  { text: 'هل يمكنني الإلغاء', label: 'cancellation' },

  // Services
  { text: 'ما هي الخدمات التي تقدمونها', label: 'services' },
  { text: 'أرني الخدمات المتاحة', label: 'services' },
  { text: 'قائمة المطاعم', label: 'services' },
  { text: 'ابحث عن فرق موسيقية', label: 'services' },
  { text: 'وش الخدمات عندكم', label: 'services' },
  { text: 'عرض الكل', label: 'services' },
  { text: 'بماذا تنصح', label: 'services' },
  { text: 'اقتراحات', label: 'services' },
  { text: 'ماذا أحجز', label: 'services' },
  { text: 'أفضل الخدمات', label: 'services' },

  // Provider
  { text: 'كيف أصبح مزود خدمة', label: 'become_provider' },
  { text: 'التسجيل كمزود', label: 'become_provider' },
  { text: 'أريد بيع خدماتي', label: 'become_provider' },
  { text: 'تسجيل بائع', label: 'become_provider' },

  // Payment
  { text: 'كيف أدفع', label: 'payment' },
  { text: 'طرق الدفع', label: 'payment' },
  { text: 'هل تقبلون بطاقات الائتمان', label: 'payment' },
  { text: 'دفع أونلاين', label: 'payment' },
  { text: 'سعر الخدمة', label: 'payment' },
  { text: 'بكم الحجز', label: 'payment' },

  // Help
  { text: 'ساعدني', label: 'help' },
  { text: 'الدعم الفني', label: 'help' },
  { text: 'اتصل بنا', label: 'help' },
  { text: 'عندي مشكلة', label: 'help' },
  { text: 'أريد المساعدة', label: 'help' },

  // Dashboard
  { text: 'وين لوحة التحكم', label: 'dashboard' },
  { text: 'ملفي الشخصي', label: 'dashboard' },
  { text: 'حسابي', label: 'dashboard' },
  { text: 'تعديل البيانات', label: 'dashboard' },

  // Reviews
  { text: 'كيف أقيم الخدمة', label: 'reviews' },
  { text: 'أريد وضع تقييم', label: 'reviews' },
  { text: 'آراء العملاء', label: 'reviews' },
  { text: 'تقييم المزود', label: 'reviews' },

  // Password
  { text: 'نسيت كلمة السر', label: 'password_reset' },
  { text: 'تغيير كلمة المرور', label: 'password_reset' },
  { text: 'مشكلة في الدخول', label: 'login_help' },
  { text: 'ما أقدر أدخل حسابي', label: 'login_help' },

  // Birthday
  { text: 'حفلة عيد ميلاد', label: 'birthday' },
  { text: 'تجهيز حفلات', label: 'birthday' },
  { text: 'عيد ميلاد أطفال', label: 'birthday' },
  { text: 'باقة عيد ميلاد', label: 'birthday' },

  // Info
  { text: 'وش هو CelebrateHub', label: 'about_celebratehub' },
  { text: 'من أنتم', label: 'about_celebratehub' },
  { text: 'معلومات عن الموقع', label: 'about_celebratehub' },
  { text: 'وين موقعكم', label: 'location_info' },
  { text: 'هل أنتم في عمان', label: 'location_info' },
  { text: 'موقعكم في مسقط', label: 'location_info' },
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
