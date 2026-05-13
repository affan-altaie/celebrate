import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Admin.css';

const ReportsAndFeedback = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/reports', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setReports(response.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(t('genericError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/reports/${reportId}/status`, { status: newStatus }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success(t('statusUpdatedSuccessfully'));
      fetchReports(); // Refresh the list
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error(t('failedToUpdateStatus'));
    }
  };

  if (loading) return <div className="admin-container"><p>{t('loading')}</p></div>;
  if (error) return <div className="admin-container"><p className="error-message">{error}</p></div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1>{t('reportsAndFeedback')}</h1>
          <p>{t('reportsAndFeedbackDescription')}</p>
        </div>
      </div>

      <div className="admin-content-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('usernameLabel')}</th>
                <th>{t('serviceName')}</th>
                <th>{t('reasonForReport')}</th>
                <th>{t('description')}</th>
                <th>{t('dateOfPublish')}</th>
                <th>{t('statusLabel')}</th>
                <th>{t('actionsLabel')}</th>
              </tr>
            </thead>
            <tbody>
              {reports.length > 0 ? (
                reports.map((report) => (
                  <tr key={report._id}>
                    <td>{report.user?.username || t('N/A')}<br/><small>({report.user?.email})</small></td>
                    <td>{report.service?.name || t('N/A')}</td>
                    <td>{t(report.reason)}</td>
                    <td>{report.description}</td>
                    <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-${report.status}`}>
                        {t(report.status)}
                      </span>
                    </td>
                    <td>
                      <div className="actions-container">
                        {report.status === 'pending' && (
                          <button 
                            onClick={() => handleStatusUpdate(report._id, 'reviewed')}
                            className="action-btn"
                            title={t('markAsReviewed')}
                          >
                            {t('reviewed')}
                          </button>
                        )}
                        {(report.status === 'pending' || report.status === 'reviewed') && (
                          <button 
                            onClick={() => handleStatusUpdate(report._id, 'resolved')}
                            className="reactivate-btn"
                            title={t('markAsResolved')}
                          >
                            {t('resolved')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">{t('noReportsFound')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <aside className="support-guidelines-card" style={{ 
          backgroundColor: 'var(--card-background)', 
          padding: '20px', 
          borderRadius: '10px', 
          border: '1px solid var(--border-color)',
          height: 'fit-content'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px' }}>{t('guidelineTitle')}</h3>
          <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '1.6' }}>
            <li>{t('guideline1')}</li>
            <li>{t('guideline2')}</li>
            <li>{t('guideline3')}</li>
            <li>{t('guideline4')}</li>
          </ul>
          <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'var(--secondary-color)', borderRadius: '5px', fontSize: '0.9rem' }}>
            <strong>Pro Tip:</strong> Always proofread before sending to maintain professional standards.
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ReportsAndFeedback;
