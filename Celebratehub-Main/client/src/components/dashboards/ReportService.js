import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './ReportService.css';

const ReportService = () => {
  const { t } = useTranslation();
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically submit the report to your backend
    console.log('Report submitted:', { serviceId, reason, description });
    alert(t('reportSubmitted'));
    navigate(`/service/${serviceId}`);
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
            <button type="button" onClick={() => navigate(-1)} className="cancel-btn">{t('cancel')}</button>
            <button type="submit" className="submit-report-btn">{t('submitReport')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportService;
