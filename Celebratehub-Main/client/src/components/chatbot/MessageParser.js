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
    if (lowerCaseMessage.includes("celebratehub") || lowerCaseMessage.includes("celebrate hub") || lowerCaseMessage.includes("what is this") || lowerCaseMessage.includes("who are you")) {
      this.actionProvider.handleCelebrateHub();
    } else if (lowerCaseMessage.includes("hello") || lowerCaseMessage.includes("hi")) {
      this.actionProvider.greet();
    } else if (lowerCaseMessage.includes("book") || lowerCaseMessage.includes("booking") || lowerCaseMessage.includes("reserve")) {
      this.actionProvider.handleBooking();
    } else if (lowerCaseMessage.includes("service")) {
      this.actionProvider.handleServices();
    } else if (lowerCaseMessage.includes("cancel")) {
      this.actionProvider.handleCancellation();
    } else if (lowerCaseMessage.includes("mission") || lowerCaseMessage.includes("vision") || lowerCaseMessage.includes("goal")) {
      this.actionProvider.handleMission();
    } else if (lowerCaseMessage.includes("located") || lowerCaseMessage.includes("location") || lowerCaseMessage.includes("muscat") || lowerCaseMessage.includes("oman") || lowerCaseMessage.includes("area")) {
      this.actionProvider.handleLocationInfo();
    } else if (lowerCaseMessage.includes("benefit") || lowerCaseMessage.includes("advantage") || lowerCaseMessage.includes("why use")) {
      this.actionProvider.handleBenefits();
    } else if (lowerCaseMessage.includes("story") || lowerCaseMessage.includes("founded") || lowerCaseMessage.includes("history") || lowerCaseMessage.includes("since")) {
      this.actionProvider.handleHistory();
    } else if (lowerCaseMessage.includes("offer") || lowerCaseMessage.includes("provide") || lowerCaseMessage.includes("features")) {
      this.actionProvider.handleOfferings();
    } else if (lowerCaseMessage.includes("instagram") || lowerCaseMessage.includes("facebook") || lowerCaseMessage.includes("twitter") || lowerCaseMessage.includes("social")) {
      this.actionProvider.handleSocialMedia();
    } else if (lowerCaseMessage.includes("pending") || lowerCaseMessage.includes("approval")) {
      this.actionProvider.handlePendingApproval();
    } else if (lowerCaseMessage.includes("review")) {
      this.actionProvider.handleReviews();
    } else if (lowerCaseMessage.includes("pay") || lowerCaseMessage.includes("payment")) {
      this.actionProvider.handlePayment();
    } else if (lowerCaseMessage.includes("password")) {
      this.actionProvider.handleResetPassword();
    } else if (lowerCaseMessage.includes("birthday")) {
      this.actionProvider.handleBirthdayPackages();
    } else if (lowerCaseMessage.includes("filter") || lowerCaseMessage.includes("location")) {
      this.actionProvider.handleFilterLocation();
    } else if (lowerCaseMessage.includes("login")) {
      this.actionProvider.handleLoginIssues();
    } else if (lowerCaseMessage.includes("after booking")) {
      this.actionProvider.handleAfterBooking();
    } else if (["catering", "photographer", "venue", "music", "entertainer", "decoration", "flowers", "dj", "band"].some(term => lowerCaseMessage.includes(term))) {
      this.actionProvider.handleServiceQuery(lowerCaseMessage);
    } else if (lowerCaseMessage.includes("compare")) {
      this.actionProvider.handleCompareProviders();
    } else if (lowerCaseMessage.includes("problem") || lowerCaseMessage.includes("issue")) {
      this.actionProvider.handleProviderIssues();
    } else if (lowerCaseMessage.includes("more bookings")) {
      this.actionProvider.handleMoreBookings();
    } else if (lowerCaseMessage.includes("calendar")) {
      this.actionProvider.handleCalendar();
    } else if (lowerCaseMessage.includes("mobile") || lowerCaseMessage.includes("app")) {
      this.actionProvider.handleMobileApp();
    } else if (lowerCaseMessage.includes("secure") || lowerCaseMessage.includes("data")) {
      this.actionProvider.handleDataSecurity();
    } else if (lowerCaseMessage.includes("free")) {
      this.actionProvider.handleFreeToUse();
    } else if (lowerCaseMessage.includes("support") || lowerCaseMessage.includes("contact")) {
      this.actionProvider.handleSupport();
    } else if (lowerCaseMessage.includes("thank")) {
      this.actionProvider.handleThanks();
    } else if (lowerCaseMessage.includes("dashboard") || lowerCaseMessage.includes("profile")) {
      this.actionProvider.handleDashboardAndProfile();
    } else if (lowerCaseMessage.includes("where")) {
      this.actionProvider.handleWhere();
    } else if (lowerCaseMessage.includes("help")) {
      this.actionProvider.handleHelp();
    } else {
      this.actionProvider.handleDefault();
    }
  }
}

export default MessageParser;
//affan