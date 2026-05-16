import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCheck, FaCrown, FaStar, FaRocket } from 'react-icons/fa';
import './Dashboard.css';
import './Subscriptions.css';

const Subscriptions = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(false);
  
  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [saveCard, setSaveCard] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardHolderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const [savedCard, setSavedCard] = useState(null);
  const [useSavedCard, setUseSavedCard] = useState(false);

  // Plan hierarchy
  const planRank = { 'Standard': 0, 'Pro': 1, 'Pro Plus': 2 };

  useEffect(() => {
    if (!user || user.role !== 'provider') {
      navigate('/login');
      return;
    }
    // Fetch saved card details when component mounts
    const fetchSavedCard = async () => {
      try {
        const response = await axios.get(`/api/payments/balance/${user.id || user._id}`);
        if (response.data.savedCard && response.data.savedCard.cardNumber) {
          setSavedCard(response.data.savedCard);
          setUseSavedCard(true);
          // Pre-fill paymentData with saved card details for display if not editing
          setPaymentData({
            cardHolderName: response.data.savedCard.cardHolderName,
            cardNumber: response.data.savedCard.cardNumber,
            expiryDate: response.data.savedCard.expiryDate,
            cvv: "" // CVV is never stored, so it's always empty
          });
        } else {
          setSavedCard(null);
          setUseSavedCard(false);
        }
      } catch (error) {
        console.error("Error fetching saved card:", error);
        setSavedCard(null);
      }
    };

    fetchSavedCard();

  }, [user, navigate]);

  const plans = [
    {
      id: 'Standard',
      name: t('standard'),
      icon: <FaStar />,
      priceMonthly: 0,
      priceAnnually: 0,
      features: [
        t('numAds', { count: 1 }),
        t('basicSupport', 'Basic Support'),
      ],
      color: '#6c757d'
    },
    {
      id: 'Pro',
      name: t('pro'),
      icon: <FaCrown />,
      priceMonthly: 10,
      priceAnnually: 100,
      features: [
        t('numAds', { count: 3 }),
        t('prioritySupport', 'Priority Support'),
        t('featuredListings', 'Featured Listings'),
      ],
      color: '#007bff'
    },
    {
      id: 'Pro Plus',
      name: t('proPlus'),
      icon: <FaRocket />,
      priceMonthly: 15,
      priceAnnually: 125,
      features: [
        t('unlimitedAds'),
        t('premiumSupport', '24/7 Premium Support'),
        t('analyticsDashboard', 'Advanced Analytics'),
        t('customBadges', 'Verified Pro Badge'),
      ],
      color: '#28a745'
    }
  ];

  const handleSubscribeClick = (plan) => {
    if (plan.id === user.subscriptionTier) {
      toast.info(t('alreadyOnPlan', 'You are already on this plan.'));
      return;
    }

    if (planRank[plan.id] < planRank[user.subscriptionTier || 'Standard']) {
      toast.error(t('downgradeNotPermitted', 'Downgrading is not permitted.'));
      return;
    }

    if (plan.id === 'Standard') {
      processSubscription(plan.id);
    } else {
      setSelectedPlan(plan);
      setShowPaymentModal(true);
    }
  };

  const processSubscription = async (planId, cardDetails = null, saveCardFlag = false) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/payments/subscribe', {
        userId: user.id || user._id,
        tier: planId,
        billingCycle: planId === 'Standard' ? null : billingCycle,
        cardDetails: cardDetails,
        agreedToTerms: agreedToTerms,
        saveCard: saveCardFlag,
      });

      if (response.data.success) {
        toast.success(response.data.message);
        const updatedUser = { ...user, ...response.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setShowPaymentModal(false);
        navigate('/provider-dashboard');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error(error.response?.data?.message || t('subscriptionFailed', 'Failed to update subscription.'));
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      toast.error(t('agreeToTermsRequired', 'You must agree to the terms and conditions'));
      return;
    }

    let cardDetailsToSend = null;
    let shouldSaveCard = false;

    if (useSavedCard && savedCard) {
      cardDetailsToSend = {
        cardHolderName: savedCard.cardHolderName,
        cardNumber: savedCard.cardNumber,
        expiryDate: savedCard.expiryDate,
        cvv: paymentData.cvv, // CVV always re-entered
      };
    } else {
      // Basic card validation for new card
      const cardNumberDigits = paymentData.cardNumber.replace(/\D/g, '');
      if (cardNumberDigits.length !== 16) {
        toast.error(t('invalidCardNumber'));
        return;
      }

      const [month, year] = paymentData.expiryDate.split('/');
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
    
      if (!month || !year || parseInt(month, 10) < 1 || parseInt(month, 10) > 12) {
        toast.error(t('invalidExpiryDate') || "Invalid expiry date format. Please use MM/YY.");
        return;
      }
    
      if (parseInt(year, 10) < currentYear || (parseInt(year, 10) === currentYear && parseInt(month, 10) < currentMonth)) {
        toast.error(t('expiredCardError') || "Card has expired. Please enter a valid expiry date.");
        return;
      }

      if (paymentData.cvv.length < 3) {
        toast.error(t('invalidCvv'));
        return;
      }
      cardDetailsToSend = {
        ...paymentData,
        cardNumber: cardNumberDigits
      };
      shouldSaveCard = saveCard;
    }

    // Send subscription request with card details and saveCard flag
    processSubscription(selectedPlan.id, cardDetailsToSend, shouldSaveCard);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>{t('subscriptions')}</h1>
        <button onClick={() => navigate('/provider-dashboard')} className="action-btn">{t('backToDashboard')}</button>
      </header>

      <main className="subscriptions-content">
        <div className="billing-toggle">
          <span className={billingCycle === 'monthly' ? 'active' : ''}>{t('monthly')}</span>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={billingCycle === 'annually'} 
              onChange={() => setBillingCycle(billingCycle === 'monthly' ? 'annually' : 'monthly')}
            />
            <span className="slider round"></span>
          </label>
          <span className={billingCycle === 'annually' ? 'active' : ''}>{t('annually')}</span>
        </div>

        <div className="plans-grid">
          {plans.map((plan) => {
            const savings = (plan.priceMonthly * 12) - plan.priceAnnually;
            return (
              <div 
                key={plan.id} 
                className={`plan-card ${user.subscriptionTier === plan.id ? 'current' : ''}`}
                style={{ borderTop: `5px solid ${plan.color}` }}
              >
                {user.subscriptionTier === plan.id && (
                  <div className="current-badge">{t('currentPlan')}</div>
                )}
                <div className="plan-icon" style={{ color: plan.color }}>{plan.icon}</div>
                <h3>{plan.name}</h3>
                <div className="plan-price">
                  <span className="currency">{t('omr')}</span>
                  <span className="amount">
                    {billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnually}
                  </span>
                  <span className="period">
                    / {billingCycle === 'monthly' ? t('perMonth') : t('perYear')}
                  </span>
                </div>
                {billingCycle === 'annually' && savings > 0 && (
                  <div className="savings-tag">Save OMR {savings}</div>
                )}
                <ul className="plan-features">
                  {plan.features.map((feature, index) => (
                    <li key={index}><FaCheck /> {feature}</li>
                  ))}
                </ul>
                <button 
                  className={`subscribe-btn ${planRank[plan.id] < planRank[user.subscriptionTier || 'Standard'] ? 'disabled' : ''}`}
                  style={{ backgroundColor: plan.color }}
                  onClick={() => handleSubscribeClick(plan)}
                  disabled={loading || user.subscriptionTier === plan.id || planRank[plan.id] < planRank[user.subscriptionTier || 'Standard']}
                >
                  {user.subscriptionTier === plan.id ? t('currentPlan') : 
                   (planRank[plan.id] < planRank[user.subscriptionTier || 'Standard'] ? t('downgradeNotPermitted') : t('subscribe'))}
                </button>
              </div>
            )
          })}
        </div>

        {showPaymentModal && (
          <div className="modal-overlay">
            <div className="payment-modal">
              <div className="modal-header">
                <h2>{t('paymentModalTitle')}</h2>
                <button className="close-btn" onClick={() => setShowPaymentModal(false)}>&times;</button>
              </div>
              <div className="plan-summary">
                <p>{selectedPlan.name} - {billingCycle === 'monthly' ? t('monthly') : t('annually')}</p>
                <p className="price">{t('omr')} {billingCycle === 'monthly' ? selectedPlan.priceMonthly : selectedPlan.priceAnnually}</p>
              </div>
              <form onSubmit={handlePaymentSubmit}>
                {savedCard && (
                  <div className="payment-choice">
                    <div className="choice-option">
                      <input type="radio" id="useSavedCard" name="paymentMethod" checked={useSavedCard} onChange={() => setUseSavedCard(true)} />
                      <label htmlFor="useSavedCard">{t('useSavedCard')} (.... .... .... {savedCard.cardNumber.slice(-4)})</label>
                    </div>
                    <div className="choice-option">
                      <input type="radio" id="useNewCard" name="paymentMethod" checked={!useSavedCard} onChange={() => setUseSavedCard(false)} />
                      <label htmlFor="useNewCard">{t('useNewCard')}</label>
                    </div>
                  </div>
                )}

                {!useSavedCard ? (
                  <div id="new-card-form">
                    <div className="form-group">
                      <label>{t('cardHolderName')}</label>
                      <input 
                        type="text" 
                        required 
                        value={paymentData.cardHolderName}
                        onChange={(e) => setPaymentData({...paymentData, cardHolderName: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('cardNumber')}</label>
                      <input 
                        type="text" 
                        maxLength="19"
                        required 
                        value={paymentData.cardNumber.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim()}
                        onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value.replace(/\D/g, '')})}
                        placeholder="0000 0000 0000 0000"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>{t('expiryDate')}</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="MM/YY"
                          maxLength="5"
                          value={paymentData.expiryDate}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '');
                            if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2, 4);
                            setPaymentData({...paymentData, expiryDate: value});
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label>{t('cvc')}</label>
                        <input 
                          type="password" 
                          required 
                          maxLength="4"
                          value={paymentData.cvv}
                          onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value.replace(/\D/g, '')})}
                        />
                      </div>
                    </div>
                    <div className="terms-checkbox">
                        <input
                            type="checkbox"
                            id="saveCard"
                            checked={saveCard}
                            onChange={(e) => setSaveCard(e.target.checked)}
                        />
                        <label htmlFor="saveCard">{t('saveCardForFuture', 'Save card for future payments')}</label>
                    </div>
                  </div>
                ) : (
                  <div className="form-group">
                    <label>{t('cvc')}</label>
                    <input 
                      type="password" 
                      required 
                      maxLength="4"
                      value={paymentData.cvv}
                      onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value.replace(/\D/g, '')})}
                    />
                  </div>
                )}
                
                <div className="terms-checkbox">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    required
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                  />
                  <label htmlFor="terms">
                    {t('iAgreeToThe')} <a href="/terms" target="_blank">{t('termsAndConditions')}</a>
                  </label>
                </div>
                <button type="submit" className="pay-btn" disabled={loading}>
                  {loading ? t('processing') : t('payAndSubscribe')}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Subscriptions;
