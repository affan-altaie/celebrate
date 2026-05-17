import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaCrown, FaStar, FaRocket, FaChartLine } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import './Dashboard.css';
import './Subscriptions.css';

const ProviderDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPerksModal, setShowPerksModal] = useState(false);
  const [stats, setStats] = useState({ totalBookings: 0, totalEarnings: 0 });
  const [chartData, setChartData] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user?.subscriptionTier === 'Pro Plus') {
      const fetchStats = async () => {
        try {
          const bookingsRes = await axios.get(`/api/bookings/provider/${user.id || user._id}`);
          const confirmedBookings = bookingsRes.data.filter(b => b.status === 'confirmed' || b.status === 'completed');
          
          // Fetch provider's own payments (expenses like promotions/subscriptions)
          const paymentsRes = await axios.get(`/api/payments/user/${user.id || user._id}`);
          const providerPayments = paymentsRes.data || [];

          // Process data for chart
          const earningsByDate = confirmedBookings.reduce((acc, curr) => {
            const date = new Date(curr.createdAt).toLocaleDateString();
            acc[date] = (acc[date] || 0) + (parseFloat(curr.totalPrice) || 0);
            return acc;
          }, {});

          const expensesByDate = providerPayments.reduce((acc, curr) => {
            const date = new Date(curr.createdAt).toLocaleDateString();
            acc[date] = (acc[date] || 0) + (parseFloat(curr.amount) || 0);
            return acc;
          }, {});

          const allDates = new Set([...Object.keys(earningsByDate), ...Object.keys(expensesByDate)]);
          const processedChartData = Array.from(allDates).map(date => ({
            date,
            earnings: (earningsByDate[date] || 0) - (expensesByDate[date] || 0)
          })).sort((a, b) => new Date(a.date) - new Date(b.date));

          const totalBookingRevenue = confirmedBookings.reduce((acc, curr) => acc + (parseFloat(curr.totalPrice) || 0), 0);
          const totalExpenses = providerPayments.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
          
          setStats({
            totalBookings: confirmedBookings.length,
            totalEarnings: totalBookingRevenue - totalExpenses
          });
          setChartData(processedChartData);
        } catch (error) {
          console.error("Error fetching analytics stats:", error);
        }
      };
      fetchStats();
    }
  }, [user]);

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

        {user?.subscriptionTier === 'Pro Plus' && (
          <div className="dashboard-card analytics-card full-width">
            <div className="card-header-with-icon">
              <h3>{t('advancedAnalytics')}</h3>
              <FaChartLine className="analytics-icon" />
            </div>
            <p>{t('performanceOverview')}</p>
            
            <div className="analytics-layout">
              <div className="stats-grid-mini">
                <div className="stat-item-mini">
                  <span className="stat-label-mini">{t('totalBookings')}</span>
                  <span className="stat-value-mini">{stats.totalBookings}</span>
                </div>
                <div className="stat-item-mini">
                  <span className="stat-label-mini">{t('totalEarnings')}</span>
                  <span className="stat-value-mini">{stats.totalEarnings.toFixed(2)} OMR</span>
                </div>
              </div>

              <div className="chart-container">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickMargin={10}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `${value} OMR`}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value.toFixed(2)} OMR`, t('totalEarnings')]}
                        contentStyle={{ 
                          borderRadius: '8px', 
                          border: 'none', 
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="earnings" 
                        stroke="#28a745" 
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#28a745' }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-data-message">
                    <p>{t('noBookingsFound')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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
