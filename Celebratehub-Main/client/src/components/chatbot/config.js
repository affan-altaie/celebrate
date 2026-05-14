import { createChatBotMessage } from 'react-chatbot-kit';
import SocialLinks from './SocialLinks';

const getConfig = (t, theme) => ({
  initialMessages: [createChatBotMessage(t('chatbotInitialGreeting'))],
  botName: "CelebrateBot",
  customStyles: {
    botMessageBox: {
      backgroundColor: theme === 'dark' ? '#bb86fc' : '#6a5af9',
    },
    chatButton: {
      backgroundColor: theme === 'dark' ? '#bb86fc' : '#6a5af9',
    },
  },
  widgets: [
    {
      widgetName: 'socialLinks',
      widgetFunc: (props) => <SocialLinks {...props} />,
    },
  ],
});

export default getConfig;
