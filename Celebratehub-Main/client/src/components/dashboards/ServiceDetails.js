import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaStar, FaMapMarkerAlt, FaCalendarAlt, FaCamera } from 'react-icons/fa';
import axios from 'axios';
import './ServiceDetails.css';

const ServiceDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await axios.get(`/api/services/${id}`);
        setService(response.data);
        setSelectedImageIndex(response.data.mainImageIndex || 0);
      } catch (error) {
        console.error('Error fetching service:', error);
      }
    };

    fetchService();
  }, [id]);

  if (!service) {
    return <div className="loading">{t('loading')}</div>;
  }

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isProvider = user?.role === 'provider';
  const isAdmin = user?.role === 'admin';

  return (
    <div className="service-details-container">
      <div className="service-details-content">
        <button onClick={() => navigate(-1)} className="back-button">go back</button>
        
        <div className="service-header">
          <img src={service.images[selectedImageIndex]} alt={service.name} className="service-main-image" />
          <div className="service-header-info">
            <Link to={`/provider-profile/${service.providerId}`} className="provider-link">
              <h1>{service.name}</h1>
            </Link>
            <div className="service-meta">
              <span><FaStar /> {service.rating || 'N/A'} ({t('reviewsCount', { count: service.reviews || 0 })})</span>
              <span><FaMapMarkerAlt /> <strong>{t('locationLabel')}:</strong> {service.location}</span>
              <span><FaCalendarAlt /> <strong>{t('dateOfPublishLabel')}:</strong> {new Date(service.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="service-description">{service.description}</p>
            <div className="service-price-book">
              <div className="price-info">
                <span className="price-display">OMR {service.pricePerHour} / hour</span>
                {service.pricePerPerson && <span className="price-per-person">OMR {service.pricePerPerson} / {t('personLabel')}</span>}
              </div>
              {!isProvider && !isAdmin && (
                <button className="book-now-button" onClick={() => navigate(`/booking/${service._id}`)}>{t("bookNow")}</button>
              )}
            </div>
            {!isProvider && !isAdmin && (
              <button onClick={() => navigate(`/report-service/${service._id}`)} className="report-btn">{t("reportService")}</button>
            )}
          </div>
        </div>

        <div className="service-gallery">
          <h2><FaCamera /> {t('photoGallery')}</h2>
          <div className="photo-grid">
            {service.images.map((photo, index) => (
              <img 
                key={index} 
                src={photo} 
                alt={`${service.name} gallery ${index + 1}`} 
                className={`gallery-photo ${index === selectedImageIndex ? 'active' : ''}`}
                onClick={() => setSelectedImageIndex(index)}
                style={{ cursor: 'pointer', border: index === selectedImageIndex ? '2px solid #007bff' : 'none' }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
