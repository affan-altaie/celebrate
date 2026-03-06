import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const ProviderDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>{t('welcomeProvider', { username: user?.username })}</h1>
      </header>
      <main className="dashboard-content">
        <div className="dashboard-card">
          <h3>{t('manageYourServices')}</h3>
          <p>{t('manageServicesDashboardDesc')}</p>
          <button onClick={() => navigate('/manage-listings')} className="action-btn">{t('manageServices')}</button>
        </div>
        <div className="dashboard-card">
          <h3>{t('customerReviews')}</h3>
          <p>{t('customerReviewsDesc')}</p>
          <button onClick={() => navigate('/customer-reviews')} className="action-btn">{t('viewReviews')}</button>
        </div>
        <div className="dashboard-card">
          <h3>{t('editProfile')}</h3>
          <p>{t('editProviderProfileDesc')}</p>
          <button onClick={() => navigate('/edit-provider-profile')} className="action-btn">{t('editProfile')}</button>
        </div>
      </main>
    </div>
  );
};

export default ProviderDashboard;
