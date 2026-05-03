import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const CreateUser = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'provider',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post('/api/users/create', formData);
      setSuccess('User created successfully!');
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'provider',
      });
    } catch (err) {
      setError('Failed to create user. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="create-user-container">
      <h2>{t('createUser')}</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <form onSubmit={handleSubmit} className="create-user-form">
        <div className="form-group">
          <label htmlFor="username">{t('usernameLabel')}</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">{t('emailLabel')}</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">{t('passwordLabel')}</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">{t('roleLabel')}</label>
          <select id="role" name="role" value={formData.role} onChange={handleChange}>
            <option value="provider">{t('serviceProvider')}</option>
            <option value="admin">{t('admin')}</option>
          </select>
        </div>
        <button type="submit" className="create-user-btn">{t('createUser')}</button>
      </form>
    </div>
  );
};

export default CreateUser;
