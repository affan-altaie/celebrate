import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import './Dashboard.css';
import './dark-dropdown.css';
import logo1 from '../../assets/logo1.png'; // Fallback image
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const EditProviderProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [formData, setFormData] = useState({
    username: '',
    location: '',
    phoneNumber: ''
  });

  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordRequirementsVisible, setPasswordRequirementsVisible] = useState(false);
  const [passwordValidity, setPasswordValidity] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const locations = [
    "Muscat", "Seeb", "Bawshar", "Muttrah", "Al Amerat", "Qurayyat",
    "Sohar", "Shinas", "Liwa", "Saham", "Al Khaburah", "As Suwayq",
    "Rustaq", "Al Awabi", "Nakhal", "Wadi Al Maawil", "Barka", "Al Musannah",
    "Nizwa", "Bahla", "Manah", "Al Hamra", "Adam", "Izki", "Samail", "Bidbid",
    "Ibra", "Al Mudaybi", "Bidiyah", "Al Qabil", "Wadi Bani Khalid", "Dima Wa At Taiyyin",
    "Sur", "Al Kamil Wal Wafi", "Jalan Bani Bu Hassan", "Jalan Bani Bu Ali", "Masirah",
    "Ibri", "Yanqul", "Dhank",
    "Haima", "Duqm", "Mahout", "Al Jazir",
    "Salalah", "Taqah", "Mirbat", "Sadah", "Rakhyut", "Dhalkut", "Muqshin", "Shalim and the Hallaniyat Islands", "Thumrait",
    "Khasab", "Bukha", "Dibba Al-Baya", "Madha",
    "Al Buraimi", "Mahdah", "As Sunaynah"
  ];

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      setFormData({
        username: storedUser.username || '',
        location: storedUser.location || '',
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

  const handlePhoneChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = value.replace(/\D/g, '').slice(0, 8);
    setFormData(prevState => ({
      ...prevState,
      [name]: sanitizedValue
    }));
    const phoneRegex = /^[79][0-9]{7}$/;
    if (!phoneRegex.test(sanitizedValue)) {
      setPhoneNumberError(t("phoneInvalid") || "Phone number must be an 8-digit number starting with 7 or 9.");
    } else {
      setPhoneNumberError('');
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if(phoneNumberError){
      toast.error(phoneNumberError);
      return;
    }
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          location: formData.location,
          phoneNumber: formData.phoneNumber
        }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        toast.success(t('profileUpdated'));
      } else {
        toast.error(data.message || t('profileUpdateFailed'));
      }
    } catch (err) {
      console.error(err);
      toast.error(t('genericError'));
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
        toast.success(t('profilePictureUpdated'));
      } else {
        toast.error(data.message || t('imageUploadFailed'));
      }
    } catch (err) {
      console.error(err);
      toast.error(t('genericError'));
    }
  };

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

  // Handle Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
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
        toast.success(t('passwordUpdated'));
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
        toast.error(data.message || t('passwordUpdateFailed'));
      }
    } catch (err) {
      console.error(err);
      toast.error(t('genericError'));
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
        toast.error(data.message || t('accountDeletionFailed'));
      }
    } catch (err) {
      console.error(err);
      toast.error(t('genericError'));
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
            <p><strong>Business Name:</strong> {user.username}</p>
            <p><strong>{t('emailLabel')}:</strong> {user.email}</p>
            <p><strong>{t('location')}:</strong> {user.location}</p>
            <p><strong>{t('phoneNumber')}:</strong> {user.phoneNumber}</p>
          </div>

          <hr />

          <h3>{t('editInformation')}</h3>
          <form onSubmit={handleProfileUpdate} style={{ textAlign: 'left' }}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Business Name</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>{t('location')}</label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="themed-dropdown"
              >
                <option value="" disabled>{t('selectLocation')}</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>{t('phoneNumber')}</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handlePhoneChange}
                maxLength="8"
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
              {phoneNumberError && <div className="error-message">{phoneNumberError}</div>}
            </div>
            <button type="submit" className="action-btn" disabled={!!phoneNumberError}>{t('updateInformation')}</button>
          </form>

          <hr />

          <h3>{t('changePassword')}</h3>
          <form onSubmit={handlePasswordChange} style={{ textAlign: 'left' }}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>{t('currentPassword')}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {showCurrentPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>{t('newPassword')}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordDataChange}
                  onFocus={() => setPasswordRequirementsVisible(true)}
                  onBlur={() => setPasswordRequirementsVisible(false)}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {showNewPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
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
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordDataChange}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
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
