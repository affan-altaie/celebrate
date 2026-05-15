import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaCrown, FaStar, FaRocket } from 'react-icons/fa';
import './Dashboard.css';
import './Subscriptions.css';

const ProviderDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPerksModal, setShowPerksModal] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  const plans = {
    'Standard': {
      name: t('standard'),
      icon: <FaStar />,
      color: '#6c757d',
      features: [
        t('numAds', { count: 1 }),
        t('basicSupport', 'Basic Support'),
      ]
    },
    'Pro': {
      name: t('pro'),
      icon: <FaCrown />,
      color: '#007bff',
      features: [
        t('numAds', { count: 3 }),
        t('prioritySupport', 'Priority Support'),
        t('featuredListings', 'Featured Listings'),
      ]
    },
    'Pro Plus': {
      name: t('proPlus'),
      icon: <FaRocket />,
      color: '#28a745',
      features: [
        t('unlimitedAds'),
        t('premiumSupport', '24/7 Premium Support'),
        t('analyticsDashboard', 'Advanced Analytics'),
        t('customBadges', 'Verified Pro Badge'),
      ]
    }
  };

  const currentPlan = plans[user?.subscriptionTier || 'Standard'];

  const handleSubscriptionAction = () => {
    if (user?.subscriptionTier === 'Pro Plus') {
      setShowPerksModal(true);
    } else {
      navigate('/subscriptions');
    }
  };

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
          <h3>{t('bookingManagement')}</h3>
          <p>{t('bookingManagementDesc')}</p>
          <button onClick={() => navigate('/booking-management')} className="action-btn">{t('viewBookings')}</button>
        </div>
        <div className="dashboard-card">
          <h3>{t('editProfile')}</h3>
          <p>{t('editProviderProfileDesc')}</p>
          <button onClick={() => navigate('/edit-provider-profile')} className="action-btn">{t('editProfile')}</button>
        </div>
        <div className={`dashboard-card subscription-card ${user?.subscriptionTier?.toLowerCase().replace(/\s+/g, '-') || 'standard'}`}>
          <h3>{t('subscriptions')}</h3>
          <p>{t('currentPlan')}: <strong>{user?.subscriptionTier || t('standard')}</strong></p>
          {user?.subscriptionExpiry && (
            <p className="expiry-text">{t('subscriptionExpiry', { 
              date: new Date(user.subscriptionExpiry).toLocaleDateString(),
              interpolation: { escapeValue: false }
            })}</p>
          )}
          <button onClick={handleSubscriptionAction} className="action-btn">
            {user?.subscriptionTier === 'Pro Plus' ? t('viewPerks') : t('upgrade')}
          </button>
        </div>
      </main>

      {showPerksModal && (
        <div className="modal-overlay" onClick={() => setShowPerksModal(false)}>
          <div className="payment-modal perks-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: currentPlan.color }}>{currentPlan.icon}</span>
                {currentPlan.name} {t('features')}
              </h2>
              <button className="close-btn" onClick={() => setShowPerksModal(false)}>&times;</button>
            </div>
            <div className="plan-summary" style={{ borderLeft: `5px solid ${currentPlan.color}` }}>
              <p>{t('currentPlan')}: <strong>{currentPlan.name}</strong></p>
            </div>
            <ul className="plan-features" style={{ marginTop: '1.5rem' }}>
              {currentPlan.features.map((feature, index) => (
                <li key={index} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FaCheck style={{ color: '#48bb78' }} /> {feature}
                </li>
              ))}
            </ul>
            <button 
              className="pay-btn" 
              style={{ backgroundColor: currentPlan.color, marginTop: '1rem' }}
              onClick={() => setShowPerksModal(false)}
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDashboard;
