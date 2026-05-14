import React, { useState, useEffect, useRef } from 'react';
import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import getConfig from './config';
import MessageParser from './MessageParser';
import ActionProvider from './ActionProvider';
import './FloatingChatbot.css';
import { FaCommentDots } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

const FloatingChatbot = () => {
  const [showChatbot, toggleChatbot] = useState(false);
  const chatbotRef = useRef(null);
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatbotRef.current && !chatbotRef.current.contains(event.target)) {
        toggleChatbot(false);
      }
    };

    if (showChatbot) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showChatbot]);

  return (
    <div ref={chatbotRef} className={`floating-chatbot-wrapper ${theme}`}>
      <div
        className="chatbot-container"
        style={{ display: showChatbot ? 'block' : 'none' }}
      >
        {showChatbot && (
          <Chatbot
            key={`${i18n.language}-${theme}`}
            config={getConfig(t, theme)}
            messageParser={MessageParser}
            actionProvider={ActionProvider}
          />
        )}
      </div>
      <button 
        className="chatbot-toggler" 
        onClick={() => toggleChatbot((prev) => !prev)}
        aria-label={t('chatbotToggle')}
      >
        <FaCommentDots size={24} />
      </button>
    </div>
  );
};

export default FloatingChatbot;
