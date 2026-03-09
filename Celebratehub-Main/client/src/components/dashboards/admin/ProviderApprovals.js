import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './Admin.css';

const ProviderApprovals = () => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchPendingProviders = async () => {
      try {
        const response = await axios.get('/api/providers/pending');
        setRequests(response.data);
      } catch (error) {
        console.error('Error fetching pending providers:', error);
      }
    };

    fetchPendingProviders();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/providers/${id}/approve`);
      setRequests(requests.filter(request => request._id !== id));
      alert(t('providerApprovedAlert'));
    } catch (error) {
      console.error('Error approving provider:', error);
      alert(t('providerApprovalError'));
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`/api/providers/${id}/reject`);
      setRequests(requests.filter(request => request._id !== id));
      alert(t('providerRejectedAlert'));
    } catch (error) {
      console.error('Error rejecting provider:', error);
      alert(t('providerApprovalError'));
    }
  };

  return (
    <div className="admin-container">
      <h1>{t('providerApprovals')}</h1>
      <p>{t('providerApprovalsDescription')}</p>
      
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('requestIdLabel')}</th>
              <th>{t('usernameLabel')}</th>
              <th>{t('contactEmailLabel')}</th>
              <th>{t('documentLabel')}</th> {/* Added document label */}
              <th>{t('statusLabel')}</th>
              <th>{t('actionsLabel')}</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(request => (
              <tr key={request._id}>
                <td>{request._id}</td>
                <td>{request.username}</td>
                <td>{request.email}</td>
                <td>
                  {request.document ? (
                    <a
                      href={`http://localhost:5000/uploads/${request.document}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t('viewDocument')}
                    </a>
                  ) : (
                    t('noDocument')
                  )}
                </td>
                <td>
                  <span className={`status ${request.status.toLowerCase()}`}>
                    {t(request.status.toLowerCase())}
                  </span>
                </td>
                <td>
                  {request.status === 'pending' && (
                    <>
                      <button className="action-btn" onClick={() => handleApprove(request._id)}>{t('approve')}</button>
                      <button className="delete-btn" onClick={() => handleReject(request._id)}>{t('reject')}</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProviderApprovals;