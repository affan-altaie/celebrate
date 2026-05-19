import i18n from '../../i18n';

class ActionProvider {
  constructor(createChatBotMessage, setStateFunc, createClientMessage) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.createClientMessage = createClientMessage;
  }

  greet() {
    const greetingMessage = this.createChatBotMessage(i18n.t('chatbotGreet'), {
      widget: 'quickOptions',
    });
    this.updateChatbotState(greetingMessage);
  }

  handleCelebrateHub() {
    const message = this.createChatBotMessage(i18n.t('chatbotCelebrateHub'));
    this.updateChatbotState(message);
  }

  handleMission() {
    const message = this.createChatBotMessage(i18n.t('chatbotMission'));
    this.updateChatbotState(message);
  }

  handleLocationInfo() {
    const message = this.createChatBotMessage(i18n.t('chatbotLocation'));
    this.updateChatbotState(message);
  }

  handleBenefits() {
    const message = this.createChatBotMessage(i18n.t('chatbotBenefits'));
    this.updateChatbotState(message);
  }

  handleHistory() {
    const message = this.createChatBotMessage(i18n.t('chatbotHistory'));
    this.updateChatbotState(message);
  }

  handleOfferings() {
    const message = this.createChatBotMessage(i18n.t('chatbotOfferings'));
    this.updateChatbotState(message);
  }

  handleServices(recommendations = []) {
    let messageText = i18n.t('chatbotServices');
    let options = {};
    
    if (recommendations.length > 0) {
      messageText += `\n\n${i18n.t('chatbotRecommendations')}`;
      options = {
        widget: 'serviceRecommendations',
        payload: recommendations,
      };
    }

    const message = this.createChatBotMessage(messageText, options);
    this.updateChatbotState(message);
  }

  handleBooking() {
    const message = this.createChatBotMessage(i18n.t('chatbotBooking'));
    this.updateChatbotState(message);
  }

  handleBecomeProvider() {
    const message = this.createChatBotMessage(i18n.t('chatbotBecomeProvider'));
    this.updateChatbotState(message);
  }

  handlePendingApproval() {
    const message = this.createChatBotMessage(i18n.t('chatbotPendingApproval'));
    this.updateChatbotState(message);
  }

  handleReviews() {
    const message = this.createChatBotMessage(i18n.t('chatbotReviews'));
    this.updateChatbotState(message);
  }

  handlePayment() {
    const message = this.createChatBotMessage(i18n.t('chatbotPayment'));
    this.updateChatbotState(message);
  }

  handleResetPassword() {
    const message = this.createChatBotMessage(i18n.t('chatbotResetPassword'));
    this.updateChatbotState(message);
  }

  handleBirthdayPackages(recommendations = []) {
    this.handleServiceQuery("birthday", recommendations);
  }

  handleFilterLocation() {
    const message = this.createChatBotMessage(i18n.t('chatbotFilterLocation'));
    this.updateChatbotState(message);
  }

  handleLoginIssues() {
    const message = this.createChatBotMessage(i18n.t('chatbotLoginIssues'));
    this.updateChatbotState(message);
  }

  handleAfterBooking() {
    const message = this.createChatBotMessage(i18n.t('chatbotAfterBooking'));
    this.updateChatbotState(message);
  }

  handleSocialMedia() {
    const message = this.createChatBotMessage(
      i18n.t('chatbotSocialMedia'),
      {
        widget: 'socialLinks',
      }
    );
    this.updateChatbotState(message);
  }

  handleServiceQuery(message, recommendations = []) {
    const services = ["catering", "photographer", "venue", "music", "entertainer", "decoration", "flowers", "dj", "band"];
    const foundService = services.find(service => message.includes(service));
    const serviceToDisplay = foundService || "service";

    let messageText = i18n.t('chatbotServiceQuery', { service: serviceToDisplay });
    let options = {};

    if (recommendations.length > 0) {
      messageText += `\n\n${i18n.t('chatbotRecommendations')}`;
      options = {
        widget: 'serviceRecommendations',
        payload: recommendations,
      };
    }

    const response = this.createChatBotMessage(messageText, options);
    this.updateChatbotState(response);
  }

  handleCompareProviders() {
    const message = this.createChatBotMessage(i18n.t('chatbotCompareProviders'));
    this.updateChatbotState(message);
  }

  handleCancellation() {
    const message = this.createChatBotMessage(i18n.t('chatbotCancellation'));
    this.updateChatbotState(message);
  }

  handleProviderIssues() {
    const message = this.createChatBotMessage(i18n.t('chatbotProviderIssues'));
    this.updateChatbotState(message);
  }

  handleMoreBookings() {
    const message = this.createChatBotMessage(i18n.t('chatbotMoreBookings'));
    this.updateChatbotState(message);
  }

  handleCalendar() {
    const message = this.createChatBotMessage(i18n.t('chatbotCalendar'));
    this.updateChatbotState(message);
  }

  handleMobileApp() {
    const message = this.createChatBotMessage(i18n.t('chatbotMobileApp'));
    this.updateChatbotState(message);
  }

  handleDataSecurity() {
    const message = this.createChatBotMessage(i18n.t('chatbotDataSecurity'));
    this.updateChatbotState(message);
  }

  handleFreeToUse() {
    const message = this.createChatBotMessage(i18n.t('chatbotFreeToUse'));
    this.updateChatbotState(message);
  }
  
  handleSupport() {
    const message = this.createChatBotMessage(i18n.t('chatbotSupport'));
    this.updateChatbotState(message);
  }
  
  handleThanks() {
    const message = this.createChatBotMessage(i18n.t('chatbotThanks'));
    this.updateChatbotState(message);
  }

  handleDashboardAndProfile() {
    const message = this.createChatBotMessage(i18n.t('chatbotDashboardAndProfile'));
    this.updateChatbotState(message);
  }

  handleWhere() {
    const message = this.createChatBotMessage(i18n.t('chatbotWhere'));
    this.updateChatbotState(message);
  }

  handleHelp() {
    const message = this.createChatBotMessage(i18n.t('chatbotHelp'), {
      widget: 'quickOptions',
    });
    this.updateChatbotState(message);
  }

  handleDefault() {
    const message = this.createChatBotMessage(i18n.t('chatbotDefault'), {
      widget: 'quickOptions',
    });
    this.updateChatbotState(message);
  }

  updateChatbotState(message) {
    console.log('Updating Chatbot State with message:', message);
    this.setState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, message],
    }));
  }
}

export default ActionProvider;
