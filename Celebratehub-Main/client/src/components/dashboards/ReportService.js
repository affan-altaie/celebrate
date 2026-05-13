import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './ReportService.css';

const ReportService = () => {
  const { t } = useTranslation();
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/reports', {
        serviceId,
        reason,
        description
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert(t('reportSubmitted'));
      navigate(`/service/${serviceId}`);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert(t('genericError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-service-container">
      <div className="report-form-card">
        <h2>{t('reportServiceTitle')}</h2>
        <p>{t('serviceIdLabel')}: {serviceId}</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('reasonForReport')}</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} required>
              <option value="">{t('selectReason')}</option>
              <option value="inappropriate-content">{t('inappropriateContent')}</option>
              <option value="scam-or-fraud">{t('scamOrFraud')}</option>
              <option value="poor-service-quality">{t('poorServiceQuality')}</option>
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
          <div className="report-actions">
            <button type="button" onClick={() => navigate(-1)} className="cancel-btn" disabled={loading}>{t('cancel')}</button>
            <button type="submit" className="submit-report-btn" disabled={loading}>
              {loading ? t('loading') : t('submitReport')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportService;
