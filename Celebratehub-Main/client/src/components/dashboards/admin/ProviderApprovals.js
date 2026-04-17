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

  const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [customRejectionReason, setCustomRejectionReason] = useState('');
  const [selectedProviderId, setSelectedProviderId] = useState(null);

  const openRejectionModal = (id) => {
    setSelectedProviderId(id);
    setRejectionModalVisible(true);
  };

  const closeRejectionModal = () => {
    setSelectedProviderId(null);
    setRejectionModalVisible(false);
    setRejectionReason('');
    setCustomRejectionReason('');
  };

  const handleReject = async () => {
    const reason = rejectionReason === 'other' ? customRejectionReason : rejectionReason;

    if (!reason) {
      alert(t('selectRejectionReason'));
      return;
    }

    try {
      await axios.put(`/api/providers/${selectedProviderId}/reject`, { reason });
      setRequests(requests.filter(request => request._id !== selectedProviderId));
      alert(t('providerRejectedAlert'));
      closeRejectionModal();
    } catch (error) {
      console.error('Error rejecting provider:', error);
      alert(t('providerApprovalError'));
    }
  };

  return (
    <div className="admin-container">
      {rejectionModalVisible && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{t('selectRejectionReason')}</h2>
            <select onChange={(e) => setRejectionReason(e.target.value)} value={rejectionReason}>
              <option value="">{t('selectReason')}</option>
              <option value="incomplete_documents">{t('incompleteDocuments')}</option>
              <option value="invalid_information">{t('invalidInformation')}</option>
              <option value="other">{t('other')}</option>
            </select>
            {rejectionReason === 'other' && (
              <textarea
                value={customRejectionReason}
                onChange={(e) => setCustomRejectionReason(e.target.value)}
                placeholder={t('rejectionReasonPlaceholder')}
              ></textarea>
            )}
            <div className="modal-buttons">
              <button className="reject-btn" onClick={handleReject}>{t('reject')}</button>
              <button onClick={closeRejectionModal}>{t('cancel')}</button>
            </div>
          </div>
        </div>
      )}
      <h1>{t('providerApprovals')}</h1>
      <p>{t('providerApprovalsDescription')}</p>
      
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('requestIdLabel')}</th>
              <th>{t('usernameLabel')}</th>
              <th>{t('contactEmailLabel')}</th>
              <th>{t('documentLabel')}</th>
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
                      href={request.document}
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
                  {request.status === 'pending' && (
                    <>
                      <button className="action-btn" onClick={() => handleApprove(request._id)}>{t('approve')}</button>
                      <button className="delete-btn" onClick={() => openRejectionModal(request._id)}>{t('reject')}</button>
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
