class MessageParser {
  constructor(actionProvider, state) {
    this.actionProvider = actionProvider;
    this.state = state;
  }

  parse(message) {
    const lowerCaseMessage = message.toLowerCase();

    if (lowerCaseMessage.includes("hello") || lowerCaseMessage.includes("hi")) {
      this.actionProvider.greet();
    } else if (lowerCaseMessage.includes("celebratehub")) {
      this.actionProvider.handleCelebrateHub();
    } else if (lowerCaseMessage.includes("services")) {
      this.actionProvider.handleServices();
    } else if (lowerCaseMessage.includes("instagram") || lowerCaseMessage.includes("facebook") || lowerCaseMessage.includes("twitter") || lowerCaseMessage.includes("social")) {
      this.actionProvider.handleSocialMedia();
    } else if (lowerCaseMessage.includes("book") || lowerCaseMessage.includes("booking")) {
      this.actionProvider.handleBooking();
    } else if (lowerCaseMessage.includes("provider")) {
      this.actionProvider.handleBecomeProvider();
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
    } else if (lowerCaseMessage.includes("cancel")) {
      this.actionProvider.handleCancellation();
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
