import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './Admin.css';

const EditUser = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`/api/users/${id}`);
        setFormData({
          username: response.data.username,
          email: response.data.email,
          phoneNumber: response.data.phoneNumber || '',
        });
      } catch (err) {
        setError('Failed to fetch user data.');
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await axios.put(`/api/users/${id}`, formData);
      setSuccess('User updated successfully!');
      setTimeout(() => navigate('/admin/user-management'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user.');
    }
  };

  return (
    <div className="admin-container">
      <h1>{t('editUser')}</h1>
      <p>{t('editUserDescription')}</p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

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
          <label htmlFor="phoneNumber">{t('phoneNumberLabel')}</label>
          <input
            type="text"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn-submit">{t('updateUser')}</button>
      </form>
    </div>
  );
};

export default EditUser;
