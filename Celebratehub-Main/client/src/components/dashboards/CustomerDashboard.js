import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const CustomerDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>{t('welcomeCustomer', { username: user?.username })}</h1>
      </header>
      <main className="dashboard-content">
        <div className="dashboard-card">
          <h3>{t('editProfile')}</h3>
          <p>{t('editCustomerProfileDesc')}</p>
          <button onClick={() => navigate('/customer-profile')} className="action-btn">{t('goToProfile')}</button>
        </div>
        <div className="dashboard-card">
          <h3>{t('bookingHistory')}</h3>
          <p>{t('bookingHistoryDesc')}</p>
          <button onClick={() => navigate('/booking-history')} className="action-btn">{t('viewHistory')}</button>
        </div>
        <div className="dashboard-card">
          <h3>{t('newBooking')}</h3>
          <p>{t('newBookingDesc')}</p>
          <button onClick={() => navigate('/new-booking')} className="action-btn">{t('bookNow')}</button>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
