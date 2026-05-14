class ActionProvider {
  constructor(createChatBotMessage, setStateFunc, createClientMessage) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
    this.createClientMessage = createClientMessage;
  }

  greet() {
    const greetingMessage = this.createChatBotMessage("Hi, friend. How can I assist you today?");
    this.updateChatbotState(greetingMessage);
  }

  handleCelebrateHub() {
    const message = this.createChatBotMessage(
      "CelebrateHub is your premier destination for all event planning needs. We connect you with top-rated service providers to make your special occasions unforgettable. Whether it's a wedding, birthday, or corporate event, we've got you covered!"
    );
    this.updateChatbotState(message);
  }

  handleMission() {
    const message = this.createChatBotMessage(
      "Our mission is to simplify event planning by providing a centralized platform where clients can easily find, book, and manage reliable service providers. We aim to bring dream events to life with ease and excellence."
    );
    this.updateChatbotState(message);
  }

  handleLocationInfo() {
    const message = this.createChatBotMessage(
      "CelebrateHub is based in Muscat, Oman. We serve clients across various locations including Seeb, Salalah, Sohar, Nizwa, and many more. You can filter services by your specific area on our Services page."
    );
    this.updateChatbotState(message);
  }

  handleBenefits() {
    const message = this.createChatBotMessage(
      "Booking through CelebrateHub offers several benefits: access to a curated selection of top-rated providers, easy-to-use management tools, secure payment options, and 24/7 customer support to ensure your event goes smoothly."
    );
    this.updateChatbotState(message);
  }

  handleHistory() {
    const message = this.createChatBotMessage(
      "Founded in 2025 by a team of experienced event planners and tech enthusiasts, CelebrateHub was created to fill the need for a reliable and centralized event booking platform in the region."
    );
    this.updateChatbotState(message);
  }

  handleOfferings() {
    const message = this.createChatBotMessage(
      "We offer a wide range of categories including Wedding Halls, Catering, Photography, Music & Entertainment, Decoration, and special Birthday packages. Our platform provides tools for instant booking and direct communication with providers."
    );
    this.updateChatbotState(message);
  }

  handleServices(recommendations = []) {
    let messageText = "We offer a wide range of services for any event. You can browse all available services by navigating to the 'Services' page.";
    
    if (recommendations.length > 0) {
      messageText += "\n\nBased on your interest, here are some recommended services:";
      recommendations.forEach(service => {
        messageText += `\n- ${service.name} (${service.category})`;
      });
    }

    const message = this.createChatBotMessage(messageText);
    this.updateChatbotState(message);
  }

  handleBooking() {
    const message = this.createChatBotMessage(
      "To book a service, simply find the service you're interested in, select a date and time, and click 'Book Now'. You can view your booking history on your dashboard."
    );
    this.updateChatbotState(message);
  }

  handleBecomeProvider() {
    const message = this.createChatBotMessage(
      "To become a service provider, you need to register for a provider account. Once registered, you can create your profile, list your services, and start receiving bookings. Your account will be reviewed by our team before it becomes publicly visible."
    );
    this.updateChatbotState(message);
  }

  handlePendingApproval() {
    const message = this.createChatBotMessage(
      "After you register as a provider, our admin team reviews your profile to ensure it meets our quality standards. This process can take a few business days. You will be notified by email once your account is approved."
    );
    this.updateChatbotState(message);
  }

  handleReviews() {
    const message = this.createChatBotMessage(
      "After a booking is completed, customers can leave a review with a rating and comments. This helps other users make informed decisions and provides valuable feedback to our providers."
    );
    this.updateChatbotState(message);
  }

  handlePayment() {
    const message = this.createChatBotMessage(
      "Currently, CelebrateHub does not process payments online. All payments are handled directly between you and the service provider. We recommend discussing payment terms and methods with your chosen provider before finalizing your booking. We are working on integrating secure online payments in a future update!"
    );
    this.updateChatbotState(message);
  }

  handleResetPassword() {
    const message = this.createChatBotMessage(
      "You can reset your password by clicking the 'Forgot Password' link on the login page. You will receive an email with instructions on how to set a new password."
    );
    this.updateChatbotState(message);
  }

  handleBirthdayPackages() {
    const message = this.createChatBotMessage(
      "Yes, many of our providers offer customizable birthday packages. You can search for 'birthday' in the services list or contact providers directly to inquire about special packages."
    );
    this.updateChatbotState(message);
  }

  handleFilterLocation() {
    const message = this.createChatBotMessage(
      "On the 'Services' page, you can use the search bar to filter by location. Simply type in the name of the city or area you are interested in."
    );
    this.updateChatbotState(message);
  }

  handleLoginIssues() {
    const message = this.createChatBotMessage(
      "If you are having trouble logging in, please ensure you are using the correct email and password. If the issue persists, try resetting your password. For further assistance, please contact our support team."
    );
    this.updateChatbotState(message);
  }

  handleAfterBooking() {
    const message = this.createChatBotMessage(
      "After you book a service, the provider will be notified of your request. They will then confirm the booking, and you will receive a confirmation email with all the details."
    );
    this.updateChatbotState(message);
  }

  handleSocialMedia() {
    const message = this.createChatBotMessage(
      "Here are our social media profiles:",
      {
        widget: 'socialLinks',
      }
    );
    this.updateChatbotState(message);
  }

  handleServiceQuery(message) {
    const services = ["catering", "photographer", "venue", "music", "entertainer", "decoration", "flowers", "dj", "band"];
    const foundService = services.find(service => message.includes(service));
    const serviceToDisplay = foundService || "service";

    const response = this.createChatBotMessage(
      `To find a ${serviceToDisplay}, please navigate to the 'Services' page and use the search bar to look for '${serviceToDisplay}'. You can also browse through the categories to find what you are looking for.`
    );
    this.updateChatbotState(response);
  }

  handleCompareProviders() {
    const message = this.createChatBotMessage(
      "You can compare providers by looking at their profiles, reviews, and ratings. Each provider's profile includes a description of their services, photos, and pricing information. Customer reviews can also give you an idea of the quality of their work."
    );
    this.updateChatbotState(message);
  }

  handleCancellation() {
    const message = this.createChatBotMessage(
      "Cancellation policies are set by each individual provider. You can find the cancellation policy on the provider's profile page. If you need to cancel a booking, please contact the provider directly."
    );
    this.updateChatbotState(message);
  }

  handleProviderIssues() {
    const message = this.createChatBotMessage(
      "If you have an issue with a service provider, please try to resolve it with them directly first. If you are unable to reach a resolution, please contact our support team, and we will do our best to assist you."
    );
    this.updateChatbotState(message);
  }

  handleMoreBookings() {
    const message = this.createChatBotMessage(
      "To get more bookings, make sure your profile is complete and up-to-date. High-quality photos, detailed descriptions, and positive reviews can help you stand out. You can also promote your services on social media and other platforms."
    );
    this.updateChatbotState(message);
  }

  handleCalendar() {
    const message = this.createChatBotMessage(
      "You can manage your availability by updating the calendar on your provider dashboard. This will prevent you from being booked on days when you are not available."
    );
    this.updateChatbotState(message);
  }

  handleMobileApp() {
    const message = this.createChatBotMessage(
      "We do not have a mobile app at the moment, but our website is fully responsive and can be used on any device. We are working on developing a mobile app in the future."
    );
    this.updateChatbotState(message);
  }

  handleDataSecurity() {
    const message = this.createChatBotMessage(
      "We take data security very seriously. All personal information is encrypted and stored securely. We do not share your data with third parties without your consent. For more information, please see our Privacy Policy."
    );
    this.updateChatbotState(message);
  }

  handleFreeToUse() {
    const message = this.createChatBotMessage(
      "Yes, CelebrateHub is free to use for customers. Service providers pay a small commission on each booking."
    );
    this.updateChatbotState(message);
  }
  
  handleSupport() {
    const message = this.createChatBotMessage(
      "For any support inquiries, please visit our 'Contact Us' page for more information on how to get in touch with our team."
    );
    this.updateChatbotState(message);
  }
  
  handleThanks() {
    const message = this.createChatBotMessage("You're welcome! Is there anything else I can help you with?");
    this.updateChatbotState(message);
  }

  handleDashboardAndProfile() {
    const message = this.createChatBotMessage(
      "You can access your dashboard and profile by logging in. The login button is in the top-right corner of the page. Once logged in, you'll see a link to your dashboard."
    );
    this.updateChatbotState(message);
  }

  handleWhere() {
    const message = this.createChatBotMessage(
      "If you're looking for the login page, you can find the button in the top-right corner. If you're looking for something else, please tell me what you're looking for, e.g., 'where can I find photographers?'"
    );
    this.updateChatbotState(message);
  }

  handleHelp() {
    const message = this.createChatBotMessage(
      "You can ask me about CelebrateHub, our services, or how to book. If you need more specific assistance, please contact our support team through the 'Contact Us' page."
    );
    this.updateChatbotState(message);
  }

  handleDefault() {
    const message = this.createChatBotMessage(
      "I'm sorry, I don't understand. You can ask me about CelebrateHub, our services, or how to book. For other questions, please contact support."
    );
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
