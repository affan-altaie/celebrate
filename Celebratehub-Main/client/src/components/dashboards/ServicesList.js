import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaCheckCircle, FaStar } from 'react-icons/fa';
import axios from 'axios';
import './ServicesList.css'; // Make sure to create this CSS file
import logo1 from '../../assets/logo1.png'; // Fallback image

const ServicesList = () => {
  const { t } = useTranslation();
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const url = providerId ? `/api/services/provider/${providerId}` : '/api/services';
        const response = await axios.get(url);
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [providerId]);

  const handleImageError = (e) => {
    e.target.src = logo1;
  };

  const isServiceAvailable = (availability) => {
    if (!availability || Object.keys(availability).length === 0) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Object.keys(availability).some(dateStr => {
      const date = new Date(dateStr);
      return date >= today && availability[dateStr].length > 0;
    });
  };

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const isCustomer = !user || user.role === "customer";

  if (loading) {
    return <div>{t('loading')}</div>;
  }

  return (
    <div className="services-list-container">
      <button onClick={() => navigate(-1)} className="back-button">{t('back')}</button>
      <h1>{providerId ? t('providerServices') : t('allServices')}</h1>
      <div className="services-grid">
        {services.map(service => {
          const available = isServiceAvailable(service.availability);
          const isVerifiedPro = service.providerId?.subscriptionTier === 'Pro Plus';
          return (
            <div key={service._id} className={`service-card ${!available ? 'unavailable' : ''} ${service.isFeatured && !service.isPromotionPaused ? 'featured-card' : ''}`} onClick={() => navigate(`/service/${service._id}`)}>
              <div className="image-container">
                <img src={service.images[0] || logo1} alt={service.name} className="service-image" onError={handleImageError} />
                {!available && isCustomer && <div className="unavailable-banner">{t('currentlyUnavailable')}</div>}
                {service.isFeatured && !service.isPromotionPaused && <div className="featured-badge"><FaStar /> {t('featured')}</div>}
              </div>
              <h3>
                {service.name.split(': ')[1] || service.name}
              </h3>
              <div className="provider-name-container">
                <span className="provider-name-mini">{service.name.split(': ')[0]}</span>
                {isVerifiedPro && <FaCheckCircle className="verified-badge" title={t('verifiedPro')} />}
              </div>
              <p>{service.location}</p>
              <p>{service.pricePerHour} OMR</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServicesList;
