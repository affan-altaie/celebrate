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
  const [paymentError, setPaymentError] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [originalCardData, setOriginalCardData] = useState(null);
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
        setCardData({ cardHolderName: "", cardNumber: "", expiryDate: "" });
        setError("");
        setPaymentError('');
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
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordRequirementsVisible, setPasswordRequirementsVisible] = useState(false);
  const [passwordValidity, setPasswordValidity] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });

  const validatePassword = (password) => {
    const newValidity = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*]/.test(password),
    };
    setPasswordValidity(newValidity);
    return Object.values(newValidity).every((v) => v);
  };

  const handlePasswordDataChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    setMessage(''); // Clear general messages on input change
    setError('');   // Clear general errors on input change

    if (name === "newPassword") {
      const isValid = validatePassword(value);
      setPasswordErrors(prev => ({ ...prev, newPassword: isValid ? '' : t("passwordRequirementsError") }));
      
      if (passwordData.confirmPassword && value !== passwordData.confirmPassword) {
        setPasswordErrors(prev => ({ ...prev, confirmPassword: t("passwordsDoNotMatchError") }));
      } else if (passwordData.confirmPassword && value === passwordData.confirmPassword) {
        setPasswordErrors(prev => { const { confirmPassword, ...rest } = prev; return rest; });
      }
    } else if (name === "confirmPassword") {
      if (passwordData.newPassword && value !== passwordData.newPassword) {
        setPasswordErrors(prev => ({ ...prev, confirmPassword: t("passwordsDoNotMatchError") }));
      } else {
        setPasswordErrors(prev => { const { confirmPassword, ...rest } = prev; return rest; });
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);
    
    setMessage('');
    setError('');
    setPaymentError('');

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
      } else {
        setError(data.message || t('imageUploadFailed'));
      }
    } catch (err) {
      console.error(err);
      setError(t('genericError'));
    }
  };

  const handlePhoneUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setPaymentError('');
    setPhoneNumberError(''); // Clear previous phone number errors

    const phoneRegex = /^[79][0-9]{7}$/;
    if (!phoneRegex.test(newPhoneNumber)) {
      setPhoneNumberError(t("phoneInvalid") || "Phone number must be an 8-digit number starting with 7 or 9.");
      return;
    }

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
        setNewPhoneNumber('');
        setPhoneNumberError(''); // Ensure error is cleared on successful API update
      } else {
        setError(data.message || t('phoneNumberUpdateFailed'));
      }
    } catch (err) {
      console.error(err);
      setError(t('genericError'));
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setPaymentError('');
    setPasswordErrors({}); // Clear all password errors at the start of submission

    const newErrors = {};
    const isNewPasswordValid = validatePassword(passwordData.newPassword);

    if (!isNewPasswordValid) {
      newErrors.newPassword = t("passwordRequirementsError");
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = t("passwordsDoNotMatchError");
    }

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
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
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordValidity({
          length: false,
          lowercase: false,
          uppercase: false,
          number: false,
          specialChar: false,
        });
        setPasswordRequirementsVisible(false);
        setPasswordErrors({}); // Ensure errors are cleared on successful API update
      } else {
        setError(data.message || t('passwordUpdateFailed'));
      }
    } catch (err) {
      console.error(err);
      setError(t('genericError'));
    }
  };

  const handleCardUpdate = async (e) => {
    e.preventDefault();
    const userId = user?.id || user?._id;
  
    setMessage('');
    setError('');
    setPaymentError('');
  
    const cardNumberDigits = cardData.cardNumber.replace(/\D/g, '');
    if (cardNumberDigits.length !== 16) {
      setPaymentError(t('invalidCardNumber') || 'Card number must be 16 digits.');
      return;
    }
  
    const [month, year] = cardData.expiryDate.split('/');
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
  
    if (!month || !year || parseInt(month, 10) < 1 || parseInt(month, 10) > 12) {
      setPaymentError(t("invalidExpiryDate") || "Invalid expiry date format. Please use MM/YY.");
      return;
    }
  
    if (parseInt(year, 10) < currentYear || (parseInt(year, 10) === currentYear && parseInt(month, 10) < currentMonth)) {
      setPaymentError(t("expiredCardError") || "Card has expired. Please enter a valid expiry date.");
      return;
    }
  
    try {
      const response = await axios.put(`/api/payments/update-card/${userId}`, {
        ...cardData,
        cardNumber: cardNumberDigits
      });
  
      if (response.data.success) {
        setMessage(t("cardUpdated") || "Card details updated successfully");
        setIsEditingCard(false);
        setCardData(prev => ({ ...prev, cardNumber: cardData.cardNumber }));
      } else {
        setPaymentError(response.data.message || t("cardUpdateFailed") || "Failed to update card details");
      }
    } catch (err) {
      console.error("Card update failed:", err.response?.data?.message || err.message || err);
      setPaymentError(err.response?.data?.message || t("genericError") || "An error occurred");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(t('deleteAccountConfirm'))) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.removeItem('user');
        navigate('/login');
      } else {
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

      <main className="dashboard-content" style={{ display: 'block' }}>
        <div className="message-placeholder">
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="dashboard-card" style={{ maxWidth: '600px', margin: '0 auto', marginBottom: '2rem' }}>
          <h3>{t('profileInformation')}</h3>
          
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
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
          </div>

          <hr />

          <h3 style={{ textAlign: 'center' }}>{t('editPhoneNumber')}</h3>
          <form onSubmit={handlePhoneUpdate} style={{ textAlign: 'left' }}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>{t('newPhoneNumberLabel')}</label>
              <input
                type="tel"
                value={newPhoneNumber}
                onChange={(e) => {
                  const sanitizedValue = e.target.value.replace(/\D/g, '').slice(0, 8); // Remove non-digits and limit to 8
                  setNewPhoneNumber(sanitizedValue);
                  const phoneRegex = /^[79][0-9]{7}$/;
                  if (!phoneRegex.test(sanitizedValue)) {
                    setPhoneNumberError(t("phoneInvalid") || "Phone number must be an 8-digit number starting with 7 or 9.");
                  } else {
                    setPhoneNumberError('');
                  }
                  setMessage(''); // Clear general messages on input change
                  setError('');   // Clear general errors on input change
                }}
                onBlur={(e) => {
                  const sanitizedValue = e.target.value.replace(/\D/g, '').slice(0, 8); // Remove non-digits and limit to 8
                  const phoneRegex = /^[79][0-9]{7}$/;
                  if (!phoneRegex.test(sanitizedValue)) {
                    setPhoneNumberError(t("phoneInvalid") || "Phone number must be an 8-digit number starting with 7 or 9.");
                  } else {
                    setPhoneNumberError('');
                  }
                }}
                maxLength="8"
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
              {phoneNumberError && <div className="error-message">{phoneNumberError}</div>}
            </div>
            <button type="submit" className="action-btn" disabled={!!phoneNumberError || !newPhoneNumber}>{t('updatePhoneNumber')}</button>
          </form>

          <hr />

          <h3 style={{ textAlign: 'center' }}><FaCreditCard /> {t('paymentInformation')}</h3>
          
          <div className="payment-section-container">
            {(cardData.cardNumber || cardData.cardHolderName) && !isEditingCard && (
              <div className="card-visualization" style={{ marginBottom: '1rem' }}>
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
                  onClick={() => {
                    setOriginalCardData(cardData);
                    setIsEditingCard(true);
                  }} 
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
                <div className="card-visualization" style={{ marginBottom: '2rem' }}>
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
                <div className="form-row" style={{ marginBottom: '1.5rem', alignItems: 'flex-end' }}>
                  <div className="form-group" style={{ flex: 2 }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-color)', opacity: 0.8 }}>
                      {t('cardNumber')}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="19"
                      value={cardData.cardNumber.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim()}
                      onChange={(e) => {
                        const formattedValue = e.target.value.replace(/\D/g, '');
                        setCardData({...cardData, cardNumber: formattedValue});
                      }}
                      placeholder="0000 0000 0000 0000"
                      style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--background-color)', color: 'var(--text-color)' }}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-color)', opacity: 0.8 }}>
                      {t('expiryDate')}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="5"
                      value={cardData.expiryDate}
                      onChange={(e) => {
                        const input = e.target.value.replace(/\D/g, '');
                        let formattedValue = input;
                        if (input.length > 2) {
                          formattedValue = input.substring(0, 2) + '/' + input.substring(2, 4);
                        }
                        setCardData({...cardData, expiryDate: formattedValue});
                      }}
                      placeholder="MM/YY"
                      style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--background-color)', color: 'var(--text-color)' }}
                    />
                  </div>
                </div>

                {paymentError && <div className="error-message" style={{ textAlign: 'center', marginBottom: '1rem' }}>{paymentError}</div>}
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="action-btn" style={{ flex: 2, borderRadius: '10px', padding: '12px' }}>
                    {t('saveChanges')}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      if (originalCardData) {
                        setCardData(originalCardData);
                      }
                      setIsEditingCard(false); 
                      setPaymentError(''); 
                    }} 
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

          <h3 style={{ textAlign: 'center' }}>{t('changePassword')}</h3>
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
                onChange={handlePasswordDataChange}
                onFocus={() => setPasswordRequirementsVisible(true)}
                onBlur={() => setPasswordRequirementsVisible(false)}
                name="newPassword"
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
              {passwordRequirementsVisible && (
                <div className="password-requirements">
                  <ul>
                    <li className={passwordValidity.length ? "valid" : "invalid"}>
                      {t("atLeast8Characters")}
                    </li>
                    <li className={passwordValidity.uppercase ? "valid" : "invalid"}>
                      {t("atLeastOneUppercaseLetter")}
                    </li>
                    <li className={passwordValidity.lowercase ? "valid" : "invalid"}>
                      {t("atLeastOneLowercaseLetter")}
                    </li>
                    <li className={passwordValidity.number ? "valid" : "invalid"}>
                      {t("atLeastOneNumber")}
                    </li>
                    <li className={passwordValidity.specialChar ? "valid" : "invalid"}>
                      {t("atLeastOneSpecialCharacter")}
                    </li>
                  </ul>
                </div>
              )}
              {passwordErrors.newPassword && <div className="error-message">{passwordErrors.newPassword}</div>}
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>{t('confirmNewPassword')}</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordDataChange}
                name="confirmPassword"
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
              {passwordErrors.confirmPassword && <div className="error-message">{passwordErrors.confirmPassword}</div>}
            </div>
            <button 
              type="submit" 
              className="action-btn" 
              disabled={ 
                !passwordData.currentPassword || 
                !passwordData.newPassword || 
                !passwordData.confirmPassword || 
                !Object.values(passwordValidity).every(v => v) || 
                passwordData.newPassword !== passwordData.confirmPassword
              }
            >
              {t("updatePassword")}
            </button>
          </form>

          <hr style={{ margin: '2rem 0' }} />

          <h3 style={{ textAlign: 'center' }}>{t('deleteAccount')}</h3>
          <p style={{ color: 'red', textAlign: 'center' }}>{t('deleteAccountWarning')}</p>
          <button onClick={handleDeleteAccount} className="logout-btn" style={{ width: '100%' }}>
            {t('deleteAccountBtn')}
          </button>
        </div>
      </main>
    </div>
  );
};

export default CustomerProfile;
