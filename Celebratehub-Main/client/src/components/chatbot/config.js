import { createChatBotMessage } from 'react-chatbot-kit';
import SocialLinks from './SocialLinks'; // Import the new component

const config = {
  initialMessages: [createChatBotMessage(`Hi! How can I help you today?`)],
  botName: "CelebrateBot",
  customStyles: {
    botMessageBox: {
      backgroundColor: '#007bff',
    },
    chatButton: {
      backgroundColor: '#007bff',
    },
  },
  widgets: [
    {
      widgetName: 'socialLinks',
      widgetFunc: (props) => <SocialLinks {...props} />,
    },
  ],
};

export default config;
