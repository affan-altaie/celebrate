import React, { useState, useEffect, useRef } from 'react';
import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import config from './config';
import MessageParser from './MessageParser';
import ActionProvider from './ActionProvider';
import './FloatingChatbot.css';
import { FaCommentDots } from 'react-icons/fa';

const FloatingChatbot = () => {
  const [showChatbot, toggleChatbot] = useState(false);
  const chatbotRef = useRef(null);

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
    <div ref={chatbotRef}>
      <div
        className="chatbot-container"
        style={{ display: showChatbot ? 'block' : 'none' }}
      >
        <Chatbot
          config={config}
          messageParser={MessageParser}
          actionProvider={ActionProvider}
        />
      </div>
      <button className="chatbot-toggler" onClick={() => toggleChatbot((prev) => !prev)}>
        <FaCommentDots size={24} />
      </button>
    </div>
  );
};

export default FloatingChatbot;
