import axios from 'axios';

class MessageParser {
  constructor(actionProvider, state) {
    this.actionProvider = actionProvider;
    this.state = state;
  }

  parse(message) {
    if (!message || message.trim() === "") return;

    console.log('Chatbot input received:', message);

    // Try ML processing
    const chatHistory = this.state.messages
      ? this.state.messages.filter(m => m && m.message).map(m => m.message)
      : [];

    axios.post('/api/chatbot/process', {
      message: message,
      history: chatHistory
    }, { timeout: 10000 }) // 10s timeout
    .then(response => {
      try {
        console.log('ML Response received:', response.data);
        const { intent, confidence, nlu, recommendations } = response.data;

        // Priority 1: High Confidence Intent Match
        if (confidence && confidence > 0.6) {
          this.executeIntent(intent, message, recommendations);
          return;
        }

        // Priority 2: High Frustration detection (Sentiment Analysis)
        // We only trigger this if intent confidence is low
        if (nlu && nlu.label === 'NEGATIVE' && nlu.score > 0.9) { // Increased threshold slightly
          console.log('Action: Support (Sentiment)');
          this.actionProvider.handleSupport();
          return;
        }

        // Priority 3: Fallback to keyword matching
        console.log('Action: Fallback to Keywords');
        this.handleKeywords(message.toLowerCase());
      } catch (innerError) {
        console.error('Error in processing ML response:', innerError);
        this.handleKeywords(message.toLowerCase());
      }
    })
    .catch(error => {
      console.error('ML Processing failed or timed out:', error.message);
      this.handleKeywords(message.toLowerCase());
    });
  }

  executeIntent(intent, originalMessage, recommendations) {
    console.log(`Executing intent: ${intent}`);
    switch (intent) {
      case 'greeting':
        this.actionProvider.greet();
        break;
      case 'booking':
        this.actionProvider.handleBooking();
        break;
      case 'cancellation':
        this.actionProvider.handleCancellation();
        break;
      case 'services':
        this.actionProvider.handleServices(recommendations);
        break;
      case 'become_provider':
        this.actionProvider.handleBecomeProvider();
        break;
      case 'payment':
        this.actionProvider.handlePayment();
        break;
      case 'help':
        this.actionProvider.handleHelp();
        break;
      case 'dashboard':
        this.actionProvider.handleDashboardAndProfile();
        break;
      case 'complaint':
        this.actionProvider.handleSupport();
        break;
      case 'reviews':
        this.actionProvider.handleReviews();
        break;
      case 'social':
        this.actionProvider.handleSocialMedia();
        break;
      case 'password_reset':
        this.actionProvider.handleResetPassword();
        break;
      case 'login_help':
        this.actionProvider.handleLoginIssues();
        break;
      case 'birthday':
        this.actionProvider.handleBirthdayPackages();
        break;
      case 'approvals':
        this.actionProvider.handlePendingApproval();
        break;
      case 'service_query':
        this.actionProvider.handleServiceQuery(originalMessage.toLowerCase());
        break;
      case 'about_celebratehub':
        this.actionProvider.handleCelebrateHub();
        break;
      case 'mission_vision':
        this.actionProvider.handleMission();
        break;
      case 'location_info':
        this.actionProvider.handleLocationInfo();
        break;
      case 'benefits':
        this.actionProvider.handleBenefits();
        break;
      case 'history':
        this.actionProvider.handleHistory();
        break;
      case 'offerings':
        this.actionProvider.handleOfferings();
        break;
      default:
        this.handleKeywords(originalMessage.toLowerCase());
    }
  }

  handleKeywords(lowerCaseMessage) {
    console.log('Fallback: Keyword matching for:', lowerCaseMessage);
    // Support for both English and Arabic keywords
    if (lowerCaseMessage.includes("celebratehub") || lowerCaseMessage.includes("celebrate hub") || 
        lowerCaseMessage.includes("what is this") || lowerCaseMessage.includes("who are you") ||
        lowerCaseMessage.includes("ما هذا") || lowerCaseMessage.includes("من أنت")) {
      this.actionProvider.handleCelebrateHub();
    } else if (lowerCaseMessage.includes("hello") || lowerCaseMessage.includes("hi") || 
               lowerCaseMessage.includes("أهلا") || lowerCaseMessage.includes("مرحبا") || lowerCaseMessage.includes("سلام")) {
      this.actionProvider.greet();
    } else if (lowerCaseMessage.includes("book") || lowerCaseMessage.includes("booking") || lowerCaseMessage.includes("reserve") ||
               lowerCaseMessage.includes("حجز") || lowerCaseMessage.includes("أحجز")) {
      this.actionProvider.handleBooking();
    } else if (lowerCaseMessage.includes("service") || lowerCaseMessage.includes("خدمة") || lowerCaseMessage.includes("خدمات")) {
      this.actionProvider.handleServices();
    } else if (lowerCaseMessage.includes("cancel") || lowerCaseMessage.includes("إلغاء") || lowerCaseMessage.includes("الغاء")) {
      this.actionProvider.handleCancellation();
    } else if (lowerCaseMessage.includes("mission") || lowerCaseMessage.includes("vision") || lowerCaseMessage.includes("goal") ||
               lowerCaseMessage.includes("مهمة") || lowerCaseMessage.includes("رؤية") || lowerCaseMessage.includes("هدف")) {
      this.actionProvider.handleMission();
    } else if (lowerCaseMessage.includes("located") || lowerCaseMessage.includes("location") || lowerCaseMessage.includes("muscat") || 
               lowerCaseMessage.includes("oman") || lowerCaseMessage.includes("area") ||
               lowerCaseMessage.includes("موقع") || lowerCaseMessage.includes("مكان") || lowerCaseMessage.includes("مسقط") || lowerCaseMessage.includes("عمان")) {
      this.actionProvider.handleLocationInfo();
    } else if (lowerCaseMessage.includes("benefit") || lowerCaseMessage.includes("advantage") || lowerCaseMessage.includes("why use") ||
               lowerCaseMessage.includes("فائدة") || lowerCaseMessage.includes("مميزات") || lowerCaseMessage.includes("لماذا")) {
      this.actionProvider.handleBenefits();
    } else if (lowerCaseMessage.includes("story") || lowerCaseMessage.includes("founded") || lowerCaseMessage.includes("history") || 
               lowerCaseMessage.includes("since") || lowerCaseMessage.includes("قصة") || lowerCaseMessage.includes("تاريخ") || lowerCaseMessage.includes("تأسست")) {
      this.actionProvider.handleHistory();
    } else if (lowerCaseMessage.includes("offer") || lowerCaseMessage.includes("provide") || lowerCaseMessage.includes("features") ||
               lowerCaseMessage.includes("عرض") || lowerCaseMessage.includes("يوفر") || lowerCaseMessage.includes("ميزات")) {
      this.actionProvider.handleOfferings();
    } else if (lowerCaseMessage.includes("instagram") || lowerCaseMessage.includes("facebook") || lowerCaseMessage.includes("twitter") || 
               lowerCaseMessage.includes("social") || lowerCaseMessage.includes("تواصل") || lowerCaseMessage.includes("اجتماعي")) {
      this.actionProvider.handleSocialMedia();
    } else if (lowerCaseMessage.includes("pending") || lowerCaseMessage.includes("approval") || lowerCaseMessage.includes("قبول") || lowerCaseMessage.includes("موافقة")) {
      this.actionProvider.handlePendingApproval();
    } else if (lowerCaseMessage.includes("review") || lowerCaseMessage.includes("تقييم") || lowerCaseMessage.includes("رأي")) {
      this.actionProvider.handleReviews();
    } else if (lowerCaseMessage.includes("pay") || lowerCaseMessage.includes("payment") || lowerCaseMessage.includes("دفع") || lowerCaseMessage.includes("تسديد")) {
      this.actionProvider.handlePayment();
    } else if (lowerCaseMessage.includes("password") || lowerCaseMessage.includes("كلمة") || lowerCaseMessage.includes("سر")) {
      this.actionProvider.handleResetPassword();
    } else if (lowerCaseMessage.includes("birthday") || lowerCaseMessage.includes("ميلاد")) {
      this.actionProvider.handleBirthdayPackages();
    } else if (lowerCaseMessage.includes("filter") || lowerCaseMessage.includes("location") || lowerCaseMessage.includes("تصفية")) {
      this.actionProvider.handleFilterLocation();
    } else if (lowerCaseMessage.includes("login") || lowerCaseMessage.includes("دخول")) {
      this.actionProvider.handleLoginIssues();
    } else if (lowerCaseMessage.includes("after booking") || lowerCaseMessage.includes("بعد الحجز")) {
      this.actionProvider.handleAfterBooking();
    } else if (["catering", "photographer", "venue", "music", "entertainer", "decoration", "flowers", "dj", "band",
                "تموين", "مصور", "قاعة", "موسيقى", "ترفيه", "ديكور", "زهور"].some(term => lowerCaseMessage.includes(term))) {
      this.actionProvider.handleServiceQuery(lowerCaseMessage);
    } else if (lowerCaseMessage.includes("compare") || lowerCaseMessage.includes("مقارنة")) {
      this.actionProvider.handleCompareProviders();
    } else if (lowerCaseMessage.includes("problem") || lowerCaseMessage.includes("issue") || lowerCaseMessage.includes("مشكلة")) {
      this.actionProvider.handleProviderIssues();
    } else if (lowerCaseMessage.includes("more bookings") || lowerCaseMessage.includes("مزيد من الحجوزات")) {
      this.actionProvider.handleMoreBookings();
    } else if (lowerCaseMessage.includes("calendar") || lowerCaseMessage.includes("تقويم")) {
      this.actionProvider.handleCalendar();
    } else if (lowerCaseMessage.includes("mobile") || lowerCaseMessage.includes("app") || lowerCaseMessage.includes("تطبيق") || lowerCaseMessage.includes("جوال")) {
      this.actionProvider.handleMobileApp();
    } else if (lowerCaseMessage.includes("secure") || lowerCaseMessage.includes("data") || lowerCaseMessage.includes("أمان") || lowerCaseMessage.includes("بيانات")) {
      this.actionProvider.handleDataSecurity();
    } else if (lowerCaseMessage.includes("free") || lowerCaseMessage.includes("مجاني")) {
      this.actionProvider.handleFreeToUse();
    } else if (lowerCaseMessage.includes("support") || lowerCaseMessage.includes("contact") || lowerCaseMessage.includes("دعم") || lowerCaseMessage.includes("اتصال")) {
      this.actionProvider.handleSupport();
    } else if (lowerCaseMessage.includes("thank") || lowerCaseMessage.includes("شكرا") || lowerCaseMessage.includes("مشكور")) {
      this.actionProvider.handleThanks();
    } else if (lowerCaseMessage.includes("dashboard") || lowerCaseMessage.includes("profile") || lowerCaseMessage.includes("لوحة") || lowerCaseMessage.includes("ملف")) {
      this.actionProvider.handleDashboardAndProfile();
    } else if (lowerCaseMessage.includes("where") || lowerCaseMessage.includes("أين") || lowerCaseMessage.includes("وين")) {
      this.actionProvider.handleWhere();
    } else if (lowerCaseMessage.includes("help") || lowerCaseMessage.includes("مساعدة")) {
      this.actionProvider.handleHelp();
    } else {
      this.actionProvider.handleDefault();
    }
  }
}

export default MessageParser;
//affan obaid