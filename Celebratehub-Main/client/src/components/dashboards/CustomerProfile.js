import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FaCreditCard } from 'react-icons/fa';
import './Dashboard.css';
import logo1 from '../../assets/logo1.png'; // Fallback image

const CustomerProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [cardData, setCardData] = useState({
    cardHolderName: '',
    cardNumber: '',
    expiryDate: ''
  });
  
  useEffect(() => {
    if (!user) {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        setUser(storedUser);
      }
    }
  }, [user]);

  useEffect(() => {
    const userId = user?.id || user?._id;
    if (userId) {
      axios.get(`/api/payments/balance/${userId}`)
        .then(res => {
          if (res.data.savedCard) {
            setCardData({
              cardHolderName: res.data.savedCard.cardHolderName || '',
              cardNumber: res.data.savedCard.cardNumber || '',
              expiryDate: res.data.savedCard.expiryDate || ''
            });
          }
        })
        .catch(err => console.error("Error fetching card details:", err));
    }
  }, [user]);

  const handleDeleteCard = async () => {
    if (!window.confirm(t("confirmDeleteCard") || "Are you sure you want to delete your saved card?")) {
      return;
    }
    const userId = user?.id || user?._id;
    try {
      const response = await axios.delete(`/api/payments/delete-card/${userId}`);
      if (response.data.success) {
        setMessage(t("cardDeleted") || "Card details deleted successfully.");
        setCardData({ cardHolderName: "", cardNumber: "", expiryDate: "" }); // Clear card data
        setError("");
      } else {
        setError(response.data.message || t("cardDeletionFailed") || "Failed to delete card details.");
      }
    } catch (err) {
      console.error(err);
      setError(t("genericError"));
    }
  };
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

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

  // Handle Phone Number Update
  const handlePhoneUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phoneNumber: newPhoneNumber })
      });

      const data = await response.json();

      if (response.ok) {
        const updatedUser = { ...user, phoneNumber: newPhoneNumber };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setMessage(t('phoneNumberUpdated'));
        setError('');
        setNewPhoneNumber('');
      } else {
        setError(data.message || t('phoneNumberUpdateFailed'));
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

  // Handle Card Update
  const handleCardUpdate = async (e) => {
    e.preventDefault();
    const userId = user?.id || user?._id;

    // Validate expiry date
    const [month, year] = cardData.expiryDate.split("/");
    const currentYear = new Date().getFullYear() % 100; // Get last two digits of year
    const currentMonth = new Date().getMonth() + 1; // Month is 0-indexed

    if (!month || !year || parseInt(month, 10) < 1 || parseInt(month, 10) > 12) {
      setError(t("invalidExpiryDate") || "Invalid expiry date format. Please use MM/YY.");
      return;
    }

    if (parseInt(year, 10) < currentYear || (parseInt(year, 10) === currentYear && parseInt(month, 10) < currentMonth)) {
      setError(t("expiredCardError") || "Card has expired. Please enter a valid expiry date.");
      return;
    }

    try {
      const response = await axios.put(`/api/payments/update-card/${userId}`, cardData);
      if (response.data.success) {
        setMessage(t("cardUpdated") || "Card details updated successfully");
        setError("");
        setIsEditingCard(false);
      } else {
        setError(response.data.message || t("cardUpdateFailed") || "Failed to update card details");
      }
    } catch (err) {
      console.error(err);
      setError(t("genericError"));
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

  const handleImageError = (e) => {
    e.target.src = logo1;
  };

  if (!user) {
    return <div>{t('loading')}</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/customer-dashboard')} className="action-btn" style={{ width: 'auto' }}>
            {t('backToDashboard')}
          </button>
          <h1>{t('editProfile')}</h1>
        </div>
      </header>

      <main className="dashboard-content">
        {message && <div className="success-message" style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}
        {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        <div className="dashboard-card" style={{ maxWidth: '600px', margin: '0 auto', marginBottom: '2rem' }}>
          <h3>{t('profileInformation')}</h3>
          
          <div style={{ marginBottom: '2rem' }}>
            <img 
              src={user.profilePicture ? user.profilePicture : logo1} 
              alt="Profile" 
              style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem' }}
              onError={handleImageError}
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
            <p><strong>{t('phoneLabel')}:</strong> {user.phoneNumber}</p>
            <p><strong>{t('roleLabel')}:</strong> {user.role}</p>
          </div>

          <hr />

          <h3>{t('editPhoneNumber')}</h3>
          <form onSubmit={handlePhoneUpdate} style={{ textAlign: 'left' }}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>{t('newPhoneNumberLabel')}</label>
              <input
                type="tel"
                value={newPhoneNumber}
                onChange={(e) => setNewPhoneNumber(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <button type="submit" className="action-btn">{t('updatePhoneNumber')}</button>
          </form>

          <hr />

          <h3><FaCreditCard /> {t('paymentInformation')}</h3>
          
          <div className="payment-section-container">
            {(cardData.cardNumber || cardData.cardHolderName) && (
              <div className="card-visualization" style={{ marginBottom: isEditingCard ? '2rem' : '1rem' }}>
                <div className="card-chip"></div>
                <div className="card-number">
                  {cardData.cardNumber ? cardData.cardNumber.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim() : '**** **** **** ****'}
                </div>
                <div className="card-info-row">
                  <div className="card-holder">
                    <div className="card-holder-label">{t('cardHolderName')}</div>
                    <div className="card-holder-name">{cardData.cardHolderName || 'Your Name'}</div>
                  </div>
                  <div className="card-expiry">
                    <div className="card-expiry-label">{t('expiryDate')}</div>
                    <div className="card-expiry-date">{cardData.expiryDate || 'MM/YY'}</div>
                  </div>
                </div>
              </div>
            )}

            {!isEditingCard ? (
              <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                <button 
                  onClick={() => setIsEditingCard(true)} 
                  className="action-btn" 
                  style={{ flex: 1, borderRadius: '10px' }}
                >
                  {cardData.cardNumber ? t('edit') : t('addNewCard')}
                </button>
                {cardData.cardNumber && (
                  <button 
                    onClick={handleDeleteCard} 
                    className="logout-btn" 
                    style={{ flex: 1, borderRadius: '10px' }}
                  >
                    {t('deleteCard') || "Delete Card"}
                  </button>
                )}
              </div>
            ) : (
              <form onSubmit={handleCardUpdate} style={{ textAlign: 'left' }}>
                <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-color)', opacity: 0.8 }}>
                    {t('cardHolderName')}
                  </label>
                  <input
                    type="text"
                    value={cardData.cardHolderName.toUpperCase()}
                    onChange={(e) => {
                        const formattedValue = e.target.value.replace(/[^a-zA-Z ]/g, "");
                        setCardData({...cardData, cardHolderName: formattedValue.toUpperCase()});
                    }}
                    placeholder="e.g. John Doe"
                    maxLength="20"
                    style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--background-color)', color: 'var(--text-color)', textTransform: 'uppercase' }}
                  />
                </div>
                <div className="form-row" style={{ marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-color)', opacity: 0.8 }}>
                      {t('cardNumber')}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="19" // 16 digits + 3 spaces
                      value={cardData.cardNumber
                        .replace(/\D/g, "")
                        .replace(/(\d{4})(?=\d)/g, "$1 ")
                        .trim()}
                      onChange={(e) => {
                        const formattedValue = e.target.value
                          .replace(/\D/g, "")
                          .substring(0, 16)
                          .replace(/(\d{4})(?=\d)/g, "$1 ");
                        setCardData({...cardData, cardNumber: formattedValue});
                      }}
                      placeholder="0000 0000 0000 0000"
                      style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--background-color)', color: 'var(--text-color)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-color)', opacity: 0.8 }}>
                      {t('expiryDate')}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9/]{4}"
                      maxLength="5"
                      value={cardData.expiryDate
                        .replace(/\D/g, "")
                        .replace(/(\d{2})(?=\d{2})/g, "$1/")
                        .substring(0, 5)}
                      onChange={(e) => {
                        const input = e.target.value.replace(/\D/g, "");
                        let formattedValue = input;
                        if (input.length > 2) {
                          formattedValue = input.substring(0, 2) + "/" + input.substring(2, 4);
                        }
                        setCardData({...cardData, expiryDate: formattedValue});
                      }}
                      placeholder="MM/YY"
                      style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--background-color)', color: 'var(--text-color)' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="action-btn" style={{ flex: 2, borderRadius: '10px', padding: '12px' }}>
                    {t('saveChanges')}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsEditingCard(false)} 
                    className="logout-btn" 
                    style={{ flex: 1, borderRadius: '10px', padding: '12px', background: '#ccc', color: '#333' }}
                  >
                    {t('cancel')}
                  </button>
                </div>
              </form>
            )}
          </div>

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

export default CustomerProfile;
