import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../../api';
import './Dashboard.css';
import './Subscriptions.css';

const ManageListings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const user = useMemo(() => JSON.parse(localStorage.getItem('user')), []);
  const [loading, setLoading] = useState(false);

  // Promotion Modal State
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [promotionPlan, setPromotionPlan] = useState('30days');
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

  useEffect(() => {
    const fetchServices = async () => {
      try {
        if (!user) return;
        const providerId = user.id || user._id;
        const response = await api.get(`/services/provider/${providerId}?all=true`);
        setServices(response.data);
      } catch (error) {
        console.error('Failed to fetch services', error);
      }
    };

    const fetchSavedCard = async () => {
      try {
        if (!user) return;
        const response = await api.get(`/payments/balance/${user.id || user._id}`);
        if (response.data.savedCard && response.data.savedCard.cardNumber) {
          setSavedCard(response.data.savedCard);
          setUseSavedCard(true);
          setPaymentData(prev => ({
            ...prev,
            cardHolderName: response.data.savedCard.cardHolderName,
            cardNumber: response.data.savedCard.cardNumber,
            expiryDate: response.data.savedCard.expiryDate,
          }));
        }
      } catch (error) {
        console.error("Error fetching saved card:", error);
      }
    };

    fetchServices();
    fetchSavedCard();
  }, [user]);

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      await api.put(`/services/${id}`, { status: newStatus });
      setServices(services.map(service => 
        (service._id === id || service.id === id) ? { ...service, status: newStatus } : service
      ));
      toast.success(t('statusUpdatedSuccessfully'));
    } catch (error) {
      console.error('Failed to update status', error);
      toast.error(t('failedToUpdateStatus'));
    }
  };

  const handleDeleteService = async (id) => {
    if (window.confirm(t("confirmDeleteService", "Are you sure you want to delete this service?"))) {
      try {
        await api.delete(`/services/${id}`);
        setServices(services.filter(service => (service._id !== id && service.id !== id)));
        toast.success(t("serviceDeletedSuccess", "Service deleted successfully."));
      } catch (error) {
        console.error("Failed to delete service", error);
        toast.error(t("serviceDeleteError", "Failed to delete service."));
      }
    }
  };

  const handlePromoteClick = (service) => {
    setSelectedService(service);
    setShowPromoteModal(true);
  };

  const handlePausePromotion = async (id) => {
    try {
      await api.put(`/services/${id}/pause-promotion`);
      setServices(services.map(s => 
        (s._id === id || s.id === id) ? { ...s, isPromotionPaused: true } : s
      ));
      toast.success(t('promotionPausedSuccess', 'Promotion paused successfully'));
    } catch (error) {
      console.error('Failed to pause promotion', error);
      toast.error(error.response?.data?.message || t('failedToPausePromotion', 'Failed to pause promotion'));
    }
  };

  const handleResumePromotion = async (id) => {
    try {
      const response = await api.put(`/services/${id}/resume-promotion`);
      setServices(services.map(s => 
        (s._id === id || s.id === id) ? { ...s, isPromotionPaused: false, featuredUntil: response.data.service.featuredUntil } : s
      ));
      toast.success(t('promotionResumedSuccess', 'Promotion resumed successfully'));
    } catch (error) {
      console.error('Failed to resume promotion', error);
      toast.error(error.response?.data?.message || t('failedToResumePromotion', 'Failed to resume promotion'));
    }
  };

  const handlePromotionSubmit = async (e) => {
    e.preventDefault();
    if (!agreedToTerms) {
      toast.error(t('agreeToTermsRequired'));
      return;
    }

    setLoading(true);
    try {
      let cardDetailsToSend = null;
      if (useSavedCard && savedCard) {
        cardDetailsToSend = {
          cardHolderName: savedCard.cardHolderName,
          cardNumber: savedCard.cardNumber,
          expiryDate: savedCard.expiryDate,
          cvv: paymentData.cvv,
        };
      } else {
        const cardNumberDigits = paymentData.cardNumber.replace(/\D/g, '');
        if (cardNumberDigits.length !== 16) {
          toast.error(t('invalidCardNumber'));
          setLoading(false);
          return;
        }
        cardDetailsToSend = { ...paymentData, cardNumber: cardNumberDigits };
      }

      const response = await api.post('/payments/promote-listing', {
        userId: user.id || user._id,
        serviceId: selectedService._id || selectedService.id,
        planId: promotionPlan,
        cardDetails: cardDetailsToSend,
        agreedToTerms,
        saveCard: !useSavedCard && saveCard
      });

      if (response.data.success) {
        toast.success(t('promotionSuccess'));
        setShowPromoteModal(false);
        // Update service in list
        setServices(services.map(s => 
          (s._id === selectedService._id || s.id === selectedService.id) 
            ? { ...s, isFeatured: true, featuredUntil: response.data.service.featuredUntil } 
            : s
        ));
      }
    } catch (error) {
      console.error('Promotion error:', error);
      toast.error(error.response?.data?.message || t('genericError'));
    } finally {
      setLoading(false);
    }
  };

  const getServiceName = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.split(': ');
    return parts.length > 1 ? parts.slice(1).join(': ') : fullName;
  };

  const adLimits = { 'Standard': 1, 'Pro': 3, 'Pro Plus': Infinity };
  const tier = user?.subscriptionTier || 'Standard';
  const limit = adLimits[tier];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>{t("manageServicesTitle")}</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="subscription-usage-pill">
            <span className="usage-label">{t('subscriptionUsage')}:</span>
            <span className="usage-count">
              {limit === Infinity 
                ? t('unlimited') 
                : t('slotsUsed', { count: services.length, total: limit })}
            </span>
          </div>
          <button onClick={() => navigate("/provider-dashboard")} className="action-btn">{t("backToDashboard")}</button>
        </div>
      </header>
      <main className="dashboard-content">
        <div className="dashboard-card full-width">
          <div className="listing-header">
            <h3>
              {t("yourServices")}
              {user?.subscriptionTier && (
                <span className={`tier-badge ${user.subscriptionTier.toLowerCase().replace(/\s+/g, '-')}`}>
                  {user.subscriptionTier}
                </span>
              )}
            </h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {services.length >= limit && limit !== Infinity && (
                <button onClick={() => navigate("/subscriptions")} className="action-btn upgrade-btn">
                  {t("upgradePlan")}
                </button>
              )}
              <button onClick={() => navigate("/add-service")} className="action-btn">{t("addNewServiceButton")}</button>
            </div>
          </div>
          <table className="listing-table">
            <thead>
              <tr>
                <th>{t("serviceName")}</th>
                <th>{t("statusLabel")}</th>
                <th>{t("bookings")}</th>
                <th>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {services.map(service => (
                <tr key={service._id || service.id}>
                  <td>
                    <div 
                      className="service-info clickable" 
                      onClick={() => navigate(`/service/${service._id || service.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img src={service.images && service.images.length > 0 ? service.images[service.mainImageIndex || 0] : ''} alt={service.name} className="service-thumbnail" />
                      <div>
                        <strong>{getServiceName(service.name)}</strong>
                        <p>{service.type || service.category}</p>
                        {service.isFeatured && service.featuredUntil && (
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.7rem', color: '#ffc107', fontWeight: 'bold' }}>
                              {t('featuredUntilLabel', { 
                                date: new Date(service.featuredUntil).toLocaleDateString(),
                                interpolation: { escapeValue: false }
                              })}
                            </span>
                            {service.isPromotionPaused && (
                              <span style={{ fontSize: '0.7rem', color: '#dc3545', fontWeight: 'bold' }}>
                                ({t('promotionPaused', 'Paused')})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span 
                      className={`status ${service.status?.toLowerCase() || 'active'}`}
                      onClick={(e) => { e.stopPropagation(); handleStatusToggle(service._id || service.id, service.status || 'Active'); }}
                      style={{ cursor: 'pointer' }}
                    >
                      {service.status || 'Active'}
                    </span>
                  </td>
                  <td>{service.bookings ? service.bookings.length : 0}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/edit-listing/${service._id || service.id}`); }} 
                        className="action-btn"
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        {t("edit")}
                      </button>
                      {!service.isFeatured ? (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handlePromoteClick(service); }} 
                          className="action-btn promote-btn"
                          style={{ padding: '0.5rem 1rem', backgroundColor: '#ffc107', color: '#000' }}
                        >
                          {t("promote")}
                        </button>
                      ) : (
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            service.isPromotionPaused ? handleResumePromotion(service._id || service.id) : handlePausePromotion(service._id || service.id); 
                          }} 
                          className="action-btn"
                          style={{ 
                            padding: '0.5rem 1rem', 
                            backgroundColor: service.isPromotionPaused ? '#28a745' : '#6c757d', 
                            color: '#fff' 
                          }}
                        >
                          {service.isPromotionPaused ? t("resumePromotion", "Resume") : t("pausePromotion", "Pause")}
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteService(service._id || service.id); }} 
                        className="delete-btn"
                        style={{ margin: 0, padding: '0.5rem 1rem' }}
                      >
                        {t("delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {showPromoteModal && (
          <div className="modal-overlay">
            <div className="payment-modal">
              <div className="modal-header">
                <h2>{t('promoteListing')}</h2>
                <button className="close-btn" onClick={() => setShowPromoteModal(false)}>&times;</button>
              </div>
              <div className="plan-summary">
                <p>{getServiceName(selectedService?.name)}</p>
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>{t('promotionPlan')}</label>
                  <select 
                    value={promotionPlan} 
                    onChange={(e) => setPromotionPlan(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  >
                    <option value="30days">{t('30Days20OMR')}</option>
                    <option value="90days">{t('90Days50OMR')}</option>
                  </select>
                </div>
                <p className="price" style={{ fontWeight: 'bold', color: '#007bff' }}>
                  {t('omr')} {promotionPlan === '30days' ? 20 : 50}
                </p>
              </div>
              <form onSubmit={handlePromotionSubmit}>
                {savedCard && (
                  <div className="payment-choice" style={{ marginBottom: '1rem' }}>
                    <div className="choice-option">
                      <input type="radio" id="useSavedCard" name="paymentMethod" checked={useSavedCard} onChange={() => setUseSavedCard(true)} />
                      <label htmlFor="useSavedCard" style={{ marginLeft: '0.5rem' }}>{t('useSavedCard')} (.... {savedCard.cardNumber.slice(-4)})</label>
                    </div>
                    <div className="choice-option">
                      <input type="radio" id="useNewCard" name="paymentMethod" checked={!useSavedCard} onChange={() => setUseSavedCard(false)} />
                      <label htmlFor="useNewCard" style={{ marginLeft: '0.5rem' }}>{t('useNewCard')}</label>
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
                        <input type="checkbox" id="saveCard" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} />
                        <label htmlFor="saveCard">{t('saveCardForFuture')}</label>
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
                  <input type="checkbox" id="terms" required checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
                  <label htmlFor="terms">
                    {t('iAgreeToThe')} <a href="/terms" target="_blank">{t('termsAndConditions')}</a>
                  </label>
                </div>
                <button type="submit" className="pay-btn" disabled={loading} style={{ backgroundColor: '#ffc107', color: '#000' }}>
                  {loading ? t('processing') : t('payAndPromote')}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageListings;
