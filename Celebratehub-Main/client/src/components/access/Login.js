import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Access.css';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    keepMeSignedIn: false
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful', data);
        // Store token or user info if needed
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect based on role
        switch(data.user.role) {
          case 'admin':
            navigate('/admin-dashboard', { state: { user: data.user } });
            break;
          case 'provider':
            navigate('/provider-dashboard', { state: { user: data.user } });
            break;
          case 'customer':
          default:
            navigate('/customer-dashboard', { state: { user: data.user } });
        }
      } else {
        if (data.message === "Your account is pending approval from the administrator.") {
          setError(t('loginPending'));
        } else if (data.message === "Your account has been rejected. Please register again.") {
          setError(t('accountRejected'));
        } else {
          setError(data.message || t('loginFailed'));
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(t('genericError'));
    }
  };

  return (
    <div className="access-container">
      <div className="access-card">
        <h3 className="access-subtitle">{t('signInToYourAccount')}</h3>

        {error && <div className="error-message">{error}</div>}
        
        <form className="access-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">{t('emailAddress')}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('enterYourEmail')}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('password')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('enterYourPassword')}
              required
            />
          </div>

          <div className="form-options">
            <Link to="/forgot-password" className="forgot-password-link">{t('forgotPassword')}</Link>
            <div className="form-check">
              <input
                type="checkbox"
                id="keepMeSignedIn"
                name="keepMeSignedIn"
                checked={formData.keepMeSignedIn}
                onChange={handleChange}
                className="form-check-input"
              />
              <label htmlFor="keepMeSignedIn" className="form-check-label">{t('keepMeSignedIn')}</label>
            </div>
          </div>

          <button type="submit" className="submit-btn">
            {t('signIn')}
          </button>
        </form>

        <div className="access-footer">
          {t('dontHaveAnAccount')}
          <Link to="/register" className="access-link">{t('signUp')}</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;