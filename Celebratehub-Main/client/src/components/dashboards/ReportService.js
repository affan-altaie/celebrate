import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ReportService.css';

const ReportService = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically submit the report to your backend
    console.log('Report submitted:', { serviceId, reason, description });
    alert('Your report has been submitted. We will review it shortly.');
    navigate(`/service/${serviceId}`);
  };

  return (
    <div className="report-service-container">
      <div className="report-form-card">
        <h2>Report a Service</h2>
        <p>Service ID: {serviceId}</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Reason for Report</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} required>
              <option value="">Select a reason</option>
              <option value="inappropriate-content">Inappropriate Content</option>
              <option value="scam-or-fraud">Scam or Fraud</option>
              <option value="poor-service-quality">Poor Service Quality</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Detailed Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide as much detail as possible..."
              required
            />
          </div>
          <div className="report-actions">
            <button type="button" onClick={() => navigate(-1)} className="cancel-btn">Cancel</button>
            <button type="submit" className="submit-report-btn">Submit Report</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportService;
