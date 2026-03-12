import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './Dashboard.css';

const BookingHistory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id || user?._id;

  useEffect(() => {
    if (userId) {
      axios.get(`/api/payments/user-bookings/${userId}`)
        .then(res => {
          setBookings(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching bookings:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [userId]);

  if (loading) {
    return <div className="dashboard-container"><div className="loading">{t('loading')}</div></div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>{t('bookingHistory')}</h1>
        <button onClick={() => navigate('/customer-dashboard')} className="action-btn">{t('backToDashboard')}</button>
      </header>
      <main className="dashboard-content">
        {bookings.length > 0 ? (
          bookings.map(booking => (
            <div key={booking._id} className="dashboard-card">
              <h3>{booking.serviceName}</h3>
              <p>{t('dateLabel')}: {booking.date}</p>
              <p>{t('timeLabel')}: {booking.time}</p>
              <p>{t('priceLabel') || 'Price'}: OMR {booking.totalPrice.toFixed(2)}</p>
              <p>{t('statusLabel')}: <span className={`status ${booking.status}`}>{t(booking.status.toLowerCase())}</span></p>
              {booking.status === 'confirmed' && (
                <button onClick={() => navigate(`/leave-review/${booking.serviceId}`)} className="action-btn review-btn">
                  {t('leaveReview')}
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="no-bookings">
            <p>{t('noBookingsFound') || 'No bookings found.'}</p>
            <button onClick={() => navigate('/new-booking')} className="action-btn">{t('bookNow')}</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookingHistory;
