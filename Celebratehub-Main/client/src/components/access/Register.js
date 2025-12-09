import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Access.css';
import logo2 from '../../assets/logo2-cut.png';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    location: ''
  });
  const [error, setError] = useState('');
  const [passwordRequirements, setPasswordRequirements] = useState(false);


  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long.');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter.');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter.');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number.');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Password must contain at least one special character.');
    }
    return errors;
  };

  const validatePhoneNumber = (phoneNumber) => {
    const errors = [];
    if (!/^[79]/.test(phoneNumber)) {
      errors.push('Phone number must start with 7 or 9.');
    }
    if (phoneNumber.length !== 8) {
      errors.push('Phone number must be 8 digits long.');
    }
    return errors;
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join(' '));
      return;
    }

    const phoneNumberErrors = validatePhoneNumber(formData.phoneNumber);
    if (phoneNumberErrors.length > 0) {
      setError(phoneNumberErrors.join(' '));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          phoneNumber: `+968${formData.phoneNumber}`,
          password: formData.password,
          role: formData.role,
          location: formData.location
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Registration successful
        console.log('Registration successful');
        if (formData.role === 'provider') {
          alert('Registration successful! Your account is pending approval from the administrator.');
        }
        navigate('/login');
      } else {
        // Registration failed
        if (data.message === 'User already registered') {
          navigate('/login');
        } else {
          setError(data.message || 'Registration failed');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred during registration');
    }
  };

  return (
    <div className="access-container">
      <div className="access-card">
        <img src={logo2} alt="CelebrateHub Logo" className="access-logo" />
      
        <h3 className="access-subtitle">Create your account</h3>
        
        {error && <div className="error-message">{error}</div>}

        <form className="access-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">I want to register as a:</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="role-select"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                marginBottom: '1rem'
              }}
            >
              <option value="customer">Customer</option>
              <option value="provider">Service Provider</option>
            </select>
          </div>

          {formData.role === 'provider' && (
            <div className="form-group">
              <label htmlFor="location">Location of Business</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter your business location"
                required
              />
            </div>
          )}

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
            <label htmlFor="phoneNumber">Phone Number</label>
            <div className="phone-input-container">
              <span className="country-code">+968</span>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setPasswordRequirements(true)}
              onBlur={() => setPasswordRequirements(false)}
              placeholder="Create a password"
              required
            />
            {passwordRequirements && (
              <div className="password-requirements">
                <ul>
                  <li>At least 8 characters</li>
                  <li>At least one uppercase letter</li>
                  <li>At least one lowercase letter</li>
                  <li>At least one number</li>
                  <li>At least one special character</li>
                </ul>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            Create Account
          </button>
        </form>

        <div className="access-footer">
          Already have an account? 
          <Link to="/login" className="access-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
