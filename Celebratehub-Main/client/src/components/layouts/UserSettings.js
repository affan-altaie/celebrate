import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import './UserSettings.css';
import { FaMoon, FaSun, FaCog, FaSignOutAlt, FaHistory, FaTachometerAlt } from 'react-icons/fa';

const UserSettings = ({ isOpen, onClose }) => {
  const { theme, toggleTheme, language, setLanguage, logout } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('settings-open');
    } else {
      document.body.classList.remove('settings-open');
    }
    return () => {
      document.body.classList.remove('settings-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  }

  return (
    <>
      <div className="settings-overlay" onClick={onClose}></div>
      <div className={`settings-panel ${isOpen ? 'open' : ''}`}>
        <div className="settings-header">
          <h2><FaCog /> Settings</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <div className="settings-section">
          <h3>Theme</h3>
          <div className="theme-options">
            <button onClick={toggleTheme} className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}>
              {theme === 'dark' ? <FaSun /> : <FaMoon />} {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h3>Language</h3>
          <div className="language-options">
            <button onClick={() => setLanguage('en')} className={`lang-btn ${language === 'en' ? 'active' : ''}`}>
              EN English
            </button>
            <button onClick={() => setLanguage('ar')} className={`lang-btn ${language === 'ar' ? 'active' : ''}`}>
              AR العربية
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h3>Navigation</h3>
          <div className="navigation-links">
            <button onClick={() => handleNavigation('/dashboard')} className="nav-link-btn">
              <FaTachometerAlt /> Dashboard
            </button>
            <button onClick={() => handleNavigation('/booking-history')} className="nav-link-btn">
              <FaHistory /> Booking History
            </button>
          </div>
        </div>
        
        <button onClick={handleLogout} className="logout-btn">
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </>
  );
};

export default UserSettings;
