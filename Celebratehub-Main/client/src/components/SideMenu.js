import React, { useEffect, useRef } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';
import './SideMenu.css';

const SideMenu = ({ isOpen, onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div ref={menuRef} className={`side-menu ${isOpen ? 'open' : ''}`}>
      <div className="side-menu-header">
        <h3>Settings</h3>
        <button onClick={onClose} className="close-button">&times;</button>
      </div>
      <div className="side-menu-content">
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>
    </div>
  );
};

export default SideMenu;