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
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviderAndServices = async () => {
      try {
        // Fetch provider data
        const providerResponse = await fetch(`/api/providers/${providerId}`);
        if (!providerResponse.ok) {
          throw new Error('Provider not found');
        }
        const providerData = await providerResponse.json();
        setProvider(providerData);

        // Fetch services by the provider
        const servicesResponse = await fetch(`/api/services/provider/${providerId}`);
        if (!servicesResponse.ok) {
          throw new Error('Services not found');
        }
        const servicesData = await servicesResponse.json();
        setServices(servicesData);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviderAndServices();
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

  const latestServices = services.slice(0, 3);

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

      <div className="services-section">
        <h2>{t('latestServices')}</h2>
        <div className="services-grid">
          {latestServices.map(service => (
            <div key={service._id} className="service-card" onClick={() => navigate(`/service/${service._id}`)}>
              <img src={service.images[0] || logo1} alt={service.name} className="service-image" onError={handleImageError} />
              <h3>{service.name.split(': ')[1] || service.name}</h3>
              <p>{service.location}</p>
              <p>{service.pricePerHour} OMR</p>
            </div>
          ))}
        </div>
        {services.length > 3 && (
          <button onClick={() => navigate(`/services/provider/${providerId}`)} className="view-all-btn">{t('viewAllServices')}</button>
        )}
      </div>
    </div>
  );
};

export default ProviderProfile;