import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
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
      axios.get(`/api/bookings/user/${userId}`)
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

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm(t('confirmCancelBooking'))) {
      try {
        await axios.delete(`/api/bookings/${bookingId}`);
        toast.success(t('bookingCancelledSuccessfully'));
        setBookings(bookings.filter(booking => booking._id !== bookingId));
      } catch (error) {
        console.error("Error cancelling booking:", error);
        toast.error(t('failedToCancelBooking'));
      }
    }
  };

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
              <div className="booking-actions">
                {booking.status === 'confirmed' && (
                  <button onClick={() => navigate(`/leave-review/${booking.serviceId}`)} className="action-btn review-btn">
                    {t('leaveReview')}
                  </button>
                )}
                <button onClick={() => handleCancelBooking(booking._id)} className="action-btn cancel-btn">
                  {t('cancelBooking')}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-bookings">
            <p>{t('noBookingsFound') || 'No bookings found.'}</p>
            <button onClick={() => navigate('/services')} className="action-btn">{t('bookNow')}</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookingHistory;
