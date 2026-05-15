import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './Dashboard.css';
import './CustomerReviews.css';
import { FaStar, FaSearch } from 'react-icons/fa';
import logo1 from '../../assets/logo1.png';

const CustomerReviews = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

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
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [reviewsRes, servicesRes] = await Promise.all([
          axios.get(`/api/reviews/provider/${user.id}`),
          axios.get(`/api/services/provider/${user.id}`)
        ]);
        setReviews(reviewsRes.data);
        setServices(servicesRes.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const stats = useMemo(() => {
    if (reviews.length === 0) return { average: 0, total: 0, breakdown: [0, 0, 0, 0, 0] };
    
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = (sum / total).toFixed(1);
    
    const breakdown = [0, 0, 0, 0, 0];
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        breakdown[5 - r.rating]++;
      }
    });
    
    return { average, total, breakdown };
  }, [reviews]);

  const filteredAndSortedReviews = useMemo(() => {
    let result = [...reviews];

    // Filter by search term
    if (searchTerm) {
      result = result.filter(r => 
        r.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.user?.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by service
    if (selectedService !== 'all') {
      result = result.filter(r => r.service?._id === selectedService);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      return 0;
    });

    return result;
  }, [reviews, searchTerm, selectedService, sortBy]);

  const renderStars = (rating) => {
    return (
      <div className="star-rating">
        {[...Array(5)].map((_, index) => (
          <FaStar key={index} color={index < rating ? '#ffc107' : '#e4e5e9'} />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>{t('customerReviews')}</h1>
        <button onClick={() => navigate('/provider-dashboard')} className="action-btn">
          {t('backToDashboard')}
        </button>
      </header>

      <main className="customer-reviews-container">
        {/* Overview Section */}
        <section className="reviews-overview">
          <div className="overall-rating">
            <span className="rating-score">{stats.average}</span>
            <div className="rating-stars">{renderStars(Math.round(stats.average))}</div>
            <span className="total-reviews-count">{stats.total} {t('totalReviews')}</span>
          </div>
          
          <div className="rating-breakdown">
            {stats.breakdown.map((count, index) => {
              const stars = 5 - index;
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={stars} className="breakdown-row">
                  <span className="star-label">{stars} {t('stars')}</span>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <span className="count-label">{count}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Controls Section */}
        <section className="reviews-controls">
          <div className="search-wrapper">
            <FaSearch className="search-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input 
              type="text" 
              className="search-input" 
              placeholder={t('searchReviews')} 
              style={{ paddingLeft: '35px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="filter-select" 
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
          >
            <option value="all">{t('allServices')}</option>
            {services.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
          
          <select 
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">{t('newest')}</option>
            <option value="oldest">{t('oldest')}</option>
            <option value="highest">{t('sortByRatingLabel')} ({t('ratingHighToLow')})</option>
            <option value="lowest">{t('sortByRatingLabel')} ({t('ratingLowToHigh')})</option>
          </select>
        </section>

        {/* Reviews List */}
        <div className="reviews-list">
          {filteredAndSortedReviews.length > 0 ? (
            filteredAndSortedReviews.map((review) => (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <img 
                      src={review.user?.profilePicture || logo1} 
                      alt={review.user?.username} 
                      className="reviewer-avatar" 
                      onError={(e) => { e.target.src = logo1; }}
                    />
                    <div className="reviewer-details">
                      <h4>{review.user?.username || 'Anonymous'}</h4>
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <div className="review-meta">
                    <span className="review-date">{formatDate(review.createdAt)}</span>
                    {review.service && (
                      <span className="service-badge">{review.service.name}</span>
                    )}
                  </div>
                </div>
                
                <div className="review-content">
                  <p className="review-comment">{review.comment}</p>
                </div>

                {review.images && review.images.length > 0 && (
                  <div className="review-images">
                    {review.images.map((img, idx) => (
                      <img key={idx} src={img} alt="Review" className="review-image" onClick={() => window.open(img, '_blank')} />
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-reviews" style={{ textAlign: 'center', padding: '3rem', opacity: 0.7 }}>
              <p>{t('noReviewsFound')}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CustomerReviews;
