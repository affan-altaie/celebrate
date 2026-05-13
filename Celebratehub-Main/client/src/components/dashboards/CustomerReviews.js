import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './Dashboard.css';
import './CustomerReviews.css';
import { FaStar } from 'react-icons/fa';

const CustomerReviews = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [servicesWithReviews, setServicesWithReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    } else {
      setLoading(false);
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchServicesAndReviews = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // First, fetch the provider's services
        const servicesResponse = await axios.get(`/api/services/provider/${user.id}`);
        const services = servicesResponse.data;

        // Then, for each service, fetch its reviews
        const servicesWithReviewsData = await Promise.all(services.map(async (service) => {
          const reviewsResponse = await axios.get(`/api/reviews/service/${service._id}`);
          const reviews = reviewsResponse.data;
          return { ...service, reviews };
        }));

        setServicesWithReviews(servicesWithReviewsData);
      } catch (error) {
        console.error('Failed to fetch services or reviews', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchServicesAndReviews();
    }
  }, [user]);

  const renderStars = (rating) => {
    return (
      <div className="star-rating">
        {[...Array(5)].map((_, index) => (
          <FaStar key={index} color={index < rating ? '#ffc107' : '#e4e5e9'} />
        ))}
      </div>
    );
  };

  if (loading) {
    return <div>{t('loading')}</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>{t('customerReviews')}</h1>
        <button onClick={() => navigate('/provider-dashboard')} className="action-btn">
          {t('backToDashboard')}
        </button>
      </header>
      <main className="dashboard-content" style={{ display: 'block' }}>
        {servicesWithReviews.length > 0 ? (
          servicesWithReviews.map((service) => (
            <div key={service._id} className="dashboard-card service-review-group" style={{ marginBottom: '2rem', textAlign: 'left' }}>
              <div className="service-review-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <img src={service.images[0]} alt={service.name} style={{ width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover' }} />
                <h2>{service.name}</h2>
              </div>
              <div className="reviews-list">
                {service.reviews.length > 0 ? (
                  service.reviews.map((review) => (
                    <div key={review._id} className="review-card">
                      <div className="review-header">
                        <img src={review.user?.profilePicture || '/default-avatar.png'} alt={review.user?.username} className="reviewer-avatar" />
                        <div className="review-info">
                          <strong>{review.user?.username || 'Anonymous'}</strong>
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                      {review.images && review.images.length > 0 && (
                        <div className="review-images">
                          {review.images.map((img, idx) => (
                            <img key={idx} src={img} alt="Review" className="review-image" />
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', opacity: 0.7 }}>{t('noReviewsYet')}</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>{t('noServicesWithReviews')}</p>
        )}
      </main>
    </div>
  );
};

export default CustomerReviews;
