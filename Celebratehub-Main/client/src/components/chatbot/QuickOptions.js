import React from 'react';
import './QuickOptions.css';

const QuickOptions = (props) => {
  const options = [
    { text: props.t('aboutUs'), handler: () => props.actionProvider.handleCelebrateHub(), id: 1 },
    { text: props.t('bookNow'), handler: () => props.actionProvider.handleBooking(), id: 2 },
    { text: props.t('allServices'), handler: () => props.actionProvider.handleServices(), id: 3 },
    { text: props.t('contactUs'), handler: () => props.actionProvider.handleSupport(), id: 4 },
    { text: props.t('chatbotSocial'), handler: () => props.actionProvider.handleSocialMedia(), id: 5 },
  ];

  const buttonsMarkup = options.map((option) => (
    <button key={option.id} onClick={option.handler} className="quick-option-button">
      {option.text}
    </button>
  ));

  return <div className="quick-options-container">{buttonsMarkup}</div>;
};

export default QuickOptions;
