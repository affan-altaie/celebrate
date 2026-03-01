import React, { useState } from 'react';
import SideMenu from './SideMenu';
import { useTheme } from '../context/ThemeContext';
import logo2 from '../assets/logo2-cut.png';
import logo2Dark from '../assets/logo2-cut-darkmode.png';
import './AuthHeader.css';

const AuthHeader = () => {
  const { theme } = useTheme();
  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <header className="auth-header">
        <div className="auth-header-logo">
          <img src={theme === 'dark' ? logo2Dark : logo2} alt="Logo" />
        </div>
        <div className="auth-header-right">
          <button onClick={toggleMenu} className="menu-button">
            &#9776;
          </button>
        </div>
      </header>
      <SideMenu isOpen={isMenuOpen} onClose={closeMenu} />
    </>
  );
};

export default AuthHeader;