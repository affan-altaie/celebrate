import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

  if (loading) {
    return <div>{t('loading')}</div>;
  }

  return (
    <div className="services-list-container">
      <button onClick={() => navigate(-1)} className="back-button">{t('back')}</button>
      <h1>{providerId ? t('providerServices') : t('allServices')}</h1>
      <div className="services-grid">
        {services.map(service => (
          <div key={service._id} className="service-card" onClick={() => navigate(`/service/${service._id}`)}>
            <img src={service.images[0] || logo1} alt={service.name} className="service-image" onError={handleImageError} />
            <h3>{service.name.split(': ')[1] || service.name}</h3>
            <p>{service.location}</p>
            <p>{service.pricePerHour} OMR</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesList;
