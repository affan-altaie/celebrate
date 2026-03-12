import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Dashboard.css';
import logo1 from '../../assets/logo1.png'; // Fallback image

const EditProviderProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [formData, setFormData] = useState({
    location: '',
    contact: '',
    phoneNumber: ''
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      setFormData({
        location: storedUser.location || '',
        contact: storedUser.contact || '',
        phoneNumber: storedUser.phoneNumber || ''
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: formData.location,
          contact: formData.contact,
          phoneNumber: formData.phoneNumber
        }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setMessage(t('profileUpdated'));
        setError('');
      } else {
        setError(data.message || t('profileUpdateFailed'));
      }
    } catch (err) {
      console.error(err);
      setError(t('genericError'));
    }
  };

  // Handle Profile Picture Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await fetch(`/api/users/${user.id}/profile-picture`, {
        method: 'PUT',
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        const updatedUser = { ...user, profilePicture: data.profilePicture };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setMessage(t('profilePictureUpdated'));
        setError('');
      } else {
        setError(data.message || t('imageUploadFailed'));
      }
    } catch (err) {
      console.error(err);
      setError(t('genericError'));
    }
  };

  // Handle Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError(t('passwordsDoNotMatchError'));
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(t('passwordUpdated'));
        setError('');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(data.message || t('passwordUpdateFailed'));
      }
    } catch (err) {
      console.error(err);
      setError(t('genericError'));
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    if (!window.confirm(t('deleteAccountConfirm'))) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        const data = await response.json();
        setError(data.message || t('accountDeletionFailed'));
      }
    } catch (err) {
      console.error(err);
      setError(t('genericError'));
    }
  };
  
  if (!user) {
    return <div>{t('loading')}</div>
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/provider-dashboard')} className="action-btn" style={{ width: 'auto' }}>
            {t('backToDashboard')}
          </button>
          <h1>{t('editProfile')}</h1>
        </div>
      </header>

      <main className="dashboard-content" style={{ display: 'block' }}>
        {message && <div className="success-message" style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}
        {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        <div className="dashboard-card" style={{ maxWidth: '600px', margin: '0 auto', marginBottom: '2rem' }}>
          <h3>{t('profileInformation')}</h3>
          
          <div style={{ marginBottom: '2rem' }}>
            <img 
              src={user.profilePicture ? user.profilePicture : logo1} 
              alt="Profile" 
              style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem' }}
            />
            <div>
              <label htmlFor="profile-upload" className="action-btn" style={{ display: 'inline-block', width: 'auto', cursor: 'pointer' }}>
                {t('changeProfilePicture')}
              </label>
              <input 
                id="profile-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                style={{ display: 'none' }} 
              />
            </div>
          </div>

          <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
            <p><strong>{t('usernameLabel')}:</strong> {user.username}</p>
            <p><strong>{t('emailLabel')}:</strong> {user.email}</p>
            <p><strong>{t('roleLabel')}:</strong> {user.role}</p>
            <p><strong>{t('location')}:</strong> {user.location}</p>
            <p><strong>{t('contact')}:</strong> {user.contact}</p>
            <p><strong>{t('phoneNumber')}:</strong> {user.phoneNumber}</p>
          </div>

          <hr />

          <h3>{t('editInformation')}</h3>
          <form onSubmit={handleProfileUpdate} style={{ textAlign: 'left' }}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>{t('location')}</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>{t('contact')}</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>{t('phoneNumber')}</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <button type="submit" className="action-btn">{t('updateInformation')}</button>
          </form>

          <hr />

          <h3>{t('changePassword')}</h3>
          <form onSubmit={handlePasswordChange} style={{ textAlign: 'left' }}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>{t('currentPassword')}</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>{t('newPassword')}</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>{t('confirmNewPassword')}</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <button type="submit" className="action-btn">{t('updatePassword')}</button>
          </form>

          <hr style={{ margin: '2rem 0' }} />

          <h3>{t('deleteAccount')}</h3>
          <p style={{ color: 'red' }}>{t('deleteAccountWarning')}</p>
          <button onClick={handleDeleteAccount} className="logout-btn" style={{ width: '100%' }}>
            {t('deleteAccountBtn')}
          </button>
        </div>
      </main>
    </div>
  );
};

export default EditProviderProfile;
