import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import logo2 from '../assets/logo2-cut.png';
import logo2Dark from '../assets/logo2-cut-darkmode.png';
import logo1 from '../assets/logo1.png'; // Fallback image
import SideMenu from './SideMenu';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleImageError = (e) => {
    e.target.src = logo1;
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin':
        return '/admin-dashboard';
      case 'provider':
        return '/provider-dashboard';
      default:
        return '/customer-dashboard';
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div>
          <Link to={getDashboardLink()}>
            <img src={theme === 'dark' ? logo2Dark : logo2} alt="Logo" className="navbar-logo" />
          </Link>
        </div>
        <div className="navbar-right">
          {user ? (
            <div className="navbar-user">
              {user.role !== 'admin' && (
                <>
                  <Link to={getDashboardLink()}>
                    <img
                      src={user.profilePicture ? user.profilePicture : logo1}
                      alt="Profile"
                      className="navbar-user-profile"
                      onError={handleImageError}
                    />
                  </Link>
                  <span className="navbar-user-name">{user.username}</span>
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" style={{ marginRight: '1rem' }}>{t('login')}</Link>
              <Link to="/register">{t('signUp')}</Link>
            </>
          )}
          <button onClick={toggleMenu} className="menu-button">
            &#9776;
          </button>
        </div>
      </nav>
      <SideMenu isOpen={isMenuOpen} onClose={closeMenu} />
    </>
  );
};

export default Navbar;