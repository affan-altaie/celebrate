import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import './ProviderProfile.css';
import logo1 from '../../assets/logo1.png'; // Fallback image

const ProviderProfile = () => {
  const { t } = useTranslation();
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const response = await fetch(`/api/providers/${providerId}`);
        if (!response.ok) {
          throw new Error('Provider not found');
        }
        const data = await response.json();
        setProvider(data);
      } catch (error) {
        console.error('Error fetching provider:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [providerId]);
  
  if (loading) {
    return <div>{t('loading')}</div>;
  }

  if (!provider) {
    return <div>{t('providerNotFound')}</div>;
  }

  const handleImageError = (e) => {
    e.target.src = logo1;
  };

  return (
    <div className="provider-profile-container">
      <button onClick={() => navigate(-1)} className="back-button">{t('back')}</button>
      
      <div className="provider-header">
        <img src={provider.profilePicture || logo1} alt={`${provider.username} logo`} className="provider-logo" onError={handleImageError} />
        <div className="provider-info">
          <h1>{provider.username}{t('profileSuffix')}</h1>
          <div className="provider-meta">
            <span><FaMapMarkerAlt /> {provider.location}</span>
            <span><FaPhone /> {provider.phoneNumber}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;