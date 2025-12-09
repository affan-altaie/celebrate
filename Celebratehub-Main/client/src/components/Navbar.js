import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo2 from '../assets/logo2-cut.png';
import logo1 from '../assets/logo1.png'; // Fallback image
import './Navbar.css';

const Navbar = () => {
  const [user, setUser] = useState(null);

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

  return (
    <nav className="navbar">
      <div>
        <Link to={getDashboardLink()}>
          <img src={logo2} alt="Logo" className="navbar-logo" />
        </Link>
      </div>
      <div>
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
            <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
            <Link to="/register">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
