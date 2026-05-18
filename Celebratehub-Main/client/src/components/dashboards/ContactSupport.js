import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ContactSupport.css';

const ContactSupport = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/reports', {
        reason,
        description,
        type: 'support'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success(t('supportRequestSubmitted', 'Your support request has been submitted. We will get back to you shortly.'));
      navigate(user.role === 'provider' ? '/provider-dashboard' : '/customer-dashboard');
    } catch (error) {
      console.error('Error submitting support request:', error);
      toast.error(t('genericError'));
    } finally {
      setLoading(false);
    }
  };

  const getTierClass = (tier) => {
    switch (tier) {
      case 'Pro Plus': return 'tier-pro-plus';
      case 'Pro': return 'tier-pro';
      default: return 'tier-standard';
    }
  };

  return (
    <div className="contact-support-container">
      <div className="support-form-card">
        <h2>{t('contactSupport', 'Contact Support')}</h2>
        
        {user?.role === 'provider' && (
          <div className={`tier-badge ${getTierClass(user.subscriptionTier)}`}>
            {user.subscriptionTier === 'Pro Plus' ? t('premiumSupport', '24/7 Premium Support') : 
             user.subscriptionTier === 'Pro' ? t('prioritySupport', 'Priority Support') : 
             t('basicSupport', 'Basic Support')}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('reasonForContact', 'Reason for Contact')}</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} required>
              <option value="">{t('selectReason')}</option>
              <option value="account-issue">{t('accountIssue', 'Account Issue')}</option>
              <option value="payment-billing">{t('paymentBilling', 'Payment & Billing')}</option>
              <option value="technical-problem">{t('technicalProblem', 'Technical Problem')}</option>
              <option value="feature-request">{t('featureRequest', 'Feature Request')}</option>
              <option value="other">{t('other')}</option>
            </select>
          </div>
          <div className="form-group">
            <label>{t('detailedDescription')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('provideDetails')}
              required
            />
          </div>
          <div className="support-actions">
            <button type="button" onClick={() => navigate(-1)} className="cancel-btn" disabled={loading}>{t('cancel')}</button>
            <button type="submit" className="submit-support-btn" disabled={loading}>
              {loading ? t('loading') : t('submitRequest', 'Submit Request')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactSupport;
