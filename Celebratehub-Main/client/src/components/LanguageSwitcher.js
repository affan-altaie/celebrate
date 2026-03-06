import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher">
      <button 
        className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
        onClick={() => changeLanguage('en')} 
        disabled={i18n.language === 'en'}
      >
        <span className="lang-code">EN</span>
        <span className="lang-name">English</span>
      </button>
      <button 
        className={`lang-btn ${i18n.language === 'ar' ? 'active' : ''}`}
        onClick={() => changeLanguage('ar')} 
        disabled={i18n.language === 'ar'}
      >
        <span className="lang-code">AR</span>
        <span className="lang-name">العربية</span>
      </button>
    </div>
  );
};

export default LanguageSwitcher;
