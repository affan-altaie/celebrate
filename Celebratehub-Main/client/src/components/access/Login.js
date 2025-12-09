import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Access.css';
import logo2 from '../../assets/logo2-cut.png';

const Login = () => {
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
          setError("Your account is pending approval. You will receive an email once it has been reviewed.");
        } else if (data.message === "Your account has been rejected. Please register again.") {
          setError("Your account has been rejected. Please register again.");
        } else {
          setError(data.message || 'Login failed');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
    }
  };

  return (
    <div className="access-container">
      <div className="access-card">
        <img src={logo2} alt="CelebrateHub Logo" className="access-logo" />
        <h3 className="access-subtitle">Sign in to your account</h3>

        {error && <div className="error-message">{error}</div>}
        
        <form className="access-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-options">
            <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
            <div className="form-check">
              <input
                type="checkbox"
                id="keepMeSignedIn"
                name="keepMeSignedIn"
                checked={formData.keepMeSignedIn}
                onChange={handleChange}
                className="form-check-input"
              />
              <label htmlFor="keepMeSignedIn" className="form-check-label">Keep me signed in</label>
            </div>
          </div>

          <button type="submit" className="submit-btn">
            Sign In
          </button>
        </form>

        <div className="access-footer">
          Don't have an account? 
          <Link to="/register" className="access-link">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
