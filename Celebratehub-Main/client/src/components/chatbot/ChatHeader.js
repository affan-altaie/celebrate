import React from 'react';
import { FaRobot, FaTimes } from 'react-icons/fa';
import './ChatHeader.css';

const ChatHeader = ({ toggleChatbot, t }) => {
  return (
    <div className="custom-chatbot-header">
      <div className="header-bot-info">
        <FaRobot className="bot-icon" />
        <div className="bot-details">
          <span className="bot-name">CelebrateBot</span>
          <span className="bot-status">{t('chatbotOnline')}</span>
        </div>
      </div>
      <button 
        className="header-close-btn" 
        onClick={toggleChatbot}
        aria-label="Close Chat"
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default ChatHeader;
