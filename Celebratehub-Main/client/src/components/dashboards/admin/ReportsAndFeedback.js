import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Admin.css';

const ReportsAndFeedback = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Toolbar State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedReport, setSelectedReport] = useState(null);

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

  // Derived Data
  const uniqueReasons = useMemo(() => {
    return [...new Set(reports.map(r => r.reason))];
  }, [reports]);

  const filteredReports = useMemo(() => {
    let result = reports.filter(report => {
      const matchesSearch = 
        (report.user?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.service?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      const matchesReason = reasonFilter === 'all' || report.reason === reasonFilter;
      
      return matchesSearch && matchesStatus && matchesReason;
    });

    result.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [reports, searchTerm, statusFilter, reasonFilter, sortOrder]);

  const truncateText = (text, maxLength = 80) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

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

      {/* Toolbar */}
      <div className="toolbar-container">
        <div className="toolbar-left">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder={t('searchPlaceholder')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="toolbar-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{t('allStatuses')}</option>
            <option value="pending">{t('pending')}</option>
            <option value="reviewed">{t('reviewed')}</option>
            <option value="resolved">{t('resolved')}</option>
          </select>

          <select 
            className="toolbar-select"
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
          >
            <option value="all">{t('allReasons')}</option>
            {uniqueReasons.map(reason => (
              <option key={reason} value={reason}>{t(reason)}</option>
            ))}
          </select>
        </div>

        <div className="toolbar-right">
          <span>{t('sortBy')}:</span>
          <select 
            className="toolbar-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">{t('newest')}</option>
            <option value="oldest">{t('oldest')}</option>
          </select>
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
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr key={report._id}>
                    <td>{report.user?.username || t('N/A')}<br/><small>({report.user?.email})</small></td>
                    <td>{report.service?.name || t('N/A')}</td>
                    <td>{t(report.reason)}</td>
                    <td>
                      {truncateText(report.description)}
                      {report.description.length > 80 && (
                        <button 
                          className="read-more-btn"
                          onClick={() => setSelectedReport(report)}
                        >
                          {t('readMore')}
                        </button>
                      )}
                    </td>
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
            <strong>{t('proTipLabel')}</strong> {t('proTipMessage')}
          </div>
        </aside>
      </div>
      
      {/* Read More Modal */}
      {selectedReport && (
        <div className="modal-overlay">
          <div className="modal-box details-modal-box">
            <h3>{t('reportDetails')}</h3>
            
            <div className="detail-row">
              <span className="detail-label">{t('usernameLabel')}</span>
              <div className="detail-value">{selectedReport.user?.username} ({selectedReport.user?.email})</div>
            </div>

            <div className="detail-row">
              <span className="detail-label">{t('serviceName')}</span>
              <div className="detail-value">{selectedReport.service?.name}</div>
            </div>

            <div className="detail-row">
              <span className="detail-label">{t('reasonForReport')}</span>
              <div className="detail-value">{t(selectedReport.reason)}</div>
            </div>

            <div className="detail-row">
              <span className="detail-label">{t('description')}</span>
              <div className="detail-value">{selectedReport.description}</div>
            </div>

            <div className="detail-row">
              <span className="detail-label">{t('dateOfPublish')}</span>
              <div className="detail-value">{new Date(selectedReport.createdAt).toLocaleString()}</div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn cancel"
                onClick={() => setSelectedReport(null)}
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsAndFeedback;
