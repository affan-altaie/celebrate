import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Dashboard.css';

const CustomerReviews = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user) {
      setReviews([
        { _id: 1, serviceId: { name: 'Elegant Wedding Halls', image: 'https://www.shangri-la.com/-/media/Shangri-La/muscat_barraljissahresort/settings/weddings-celebrations/SLMU_Events_Spaces_1920x940.jpg' }, customerId: { username: 'John Doe', profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80' }, rating: 5, comment: 'Beautiful venue and great service!' },
        { _id: 2, serviceId: { name: 'Elegant Wedding Halls', image: 'https://www.shangri-la.com/-/media/Shangri-La/muscat_barraljissahresort/settings/weddings-celebrations/SLMU_Events_Spaces_1920x940.jpg' }, customerId: { username: 'Jane Smith', profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80' }, rating: 4, comment: 'The staff was very helpful.' },
        { _id: 3, serviceId: { name: 'Joyful Birthday Parties', image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60' }, customerId: { username: 'Peter Pan', profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80' }, rating: 5, comment: 'My kids had a blast!' },
      ]);
    }
  }, [user]);

  if (!user) {
    return <div>{t('loading')}</div>;
  }

  const groupedReviews = reviews.reduce((acc, review) => {
    const serviceName = review.serviceId.name;
    if (!acc[serviceName]) {
      acc[serviceName] = {
        image: review.serviceId.image,
        reviews: [],
      };
    }
    acc[serviceName].reviews.push(review);
    return acc;
  }, {});

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>{t('customerReviewsTitle')}</h1>
        <button onClick={() => navigate(-1)} className="action-btn">{t('backToDashboard')}</button>
      </header>
      <main className="dashboard-content">
        {Object.keys(groupedReviews).length > 0 ? (
          Object.keys(groupedReviews).map(serviceName => (
            <div key={serviceName} className="dashboard-card full-width">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <img src={groupedReviews[serviceName].image} alt={serviceName} style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '8px' }} />
                <h3>{serviceName}</h3>
              </div>
              {groupedReviews[serviceName].reviews.map(review => (
                <div key={review._id} className="review-card" style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', display: 'flex', gap: '1rem' }}>
                  <img src={review.customerId.profilePicture} alt={review.customerId.username} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div className="review-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{review.customerId.username}</strong>
                      <div className="review-rating">
                        {[...Array(review.rating)].map((_, i) => <span key={i}>⭐</span>)}
                      </div>
                    </div>
                    <p>{review.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="dashboard-card full-width">
            <p>{t('noReviewsFound')}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerReviews;
