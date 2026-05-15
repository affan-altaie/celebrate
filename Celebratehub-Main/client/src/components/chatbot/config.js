import { createChatBotMessage } from 'react-chatbot-kit';
import SocialLinks from './SocialLinks';
import QuickOptions from './QuickOptions';
import ChatHeader from './ChatHeader';
import ServiceRecommendations from './ServiceRecommendations';

const getConfig = (t, theme, toggleChatbot) => ({
  initialMessages: [
    createChatBotMessage(t('chatbotInitialGreeting'), {
      widget: 'quickOptions',
    }),
  ],
  botName: "CelebrateBot",
  customStyles: {
    botMessageBox: {
      backgroundColor: theme === 'dark' ? '#bb86fc' : '#6a5af9',
    },
    chatButton: {
      backgroundColor: theme === 'dark' ? '#bb86fc' : '#6a5af9',
    },
  },
  customComponents: {
    header: (props) => <ChatHeader {...props} toggleChatbot={toggleChatbot} t={t} />,
  },
  widgets: [
    {
      widgetName: 'socialLinks',
      widgetFunc: (props) => <SocialLinks {...props} t={t} />,
    },
    {
      widgetName: 'quickOptions',
      widgetFunc: (props) => <QuickOptions {...props} t={t} />,
    },
    {
      widgetName: 'serviceRecommendations',
      widgetFunc: (props) => <ServiceRecommendations {...props} />,
    },
  ],
});

export default getConfig;
