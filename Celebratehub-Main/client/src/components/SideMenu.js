import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MdClose, MdSettings, MdLanguage, MdPalette, MdLogout, MdHistory, MdDashboard } from 'react-icons/md';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';
import './SideMenu.css';

const SideMenu = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [user, setUser] = useState(null);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    onClose();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin': return '/admin-dashboard';
      case 'provider': return '/provider-dashboard';
      default: return '/customer-dashboard';
    }
  };

  return (
    <>
      <div className={`side-menu-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div 
        ref={menuRef} 
        className={`side-menu ${isOpen ? 'open' : ''} ${isRTL ? 'rtl' : 'ltr'}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="side-menu-header">
          <div className="header-title">
            <MdSettings className="header-icon" />
            <h3>{t('settings')}</h3>
          </div>
          <button onClick={onClose} className="close-button" aria-label="Close menu">
            <MdClose />
          </button>
        </div>
        
        <div className="side-menu-content">
          <div className="menu-section">
            <div className="section-header">
              <MdPalette className="section-icon" />
              <h4>{t('theme')}</h4>
            </div>
            <div className="section-content">
              <ThemeSwitcher />
            </div>
          </div>

          <div className="menu-divider" />

          <div className="menu-section">
            <div className="section-header">
              <MdLanguage className="section-icon" />
              <h4>{t('language')}</h4>
            </div>
            <div className="section-content">
              <LanguageSwitcher />
            </div>
          </div>

          {user && (
            <>
              <div className="menu-divider" />
              <div className="menu-section">
                <div className="section-header">
                  <MdDashboard className="section-icon" />
                  <h4>{t('navigation') || 'Navigation'}</h4>
                </div>
                <div className="section-content">
                  <button onClick={() => { navigate(getDashboardLink()); onClose(); }} className="side-menu-nav-btn">
                    <MdDashboard className="logout-icon" />
                    <span>{t('dashboard') || 'Dashboard'}</span>
                  </button>
                  {user.role === 'customer' && (
                    <button onClick={() => { navigate('/booking-history'); onClose(); }} className="side-menu-nav-btn">
                      <MdHistory className="logout-icon" />
                      <span>{t('bookingHistory')}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="menu-divider" />
              
              <div className="menu-section">
                <button onClick={handleLogout} className="side-menu-logout-btn">
                  <MdLogout className="logout-icon" />
                  <span>{t('logout')}</span>
                </button>
              </div>
            </>
          )}
        </div>
        
        <div className="side-menu-footer">
          <p>© {new Date().getFullYear()} CelebrateHub</p>
        </div>
      </div>
    </>
  );
};

export default SideMenu;
