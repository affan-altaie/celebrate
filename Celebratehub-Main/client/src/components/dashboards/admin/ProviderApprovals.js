import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import './Admin.css';

const ProviderApprovals = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [otherRejectionReason, setOtherRejectionReason] = useState('');

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const { data } = await axios.get('/api/providers/pending');
                setRequests(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching provider requests:', error);
                setLoading(false);
            }
        };

        fetchRequests();
    }, []);

    const handleApprove = async (id) => {
        try {
            await axios.put(`/api/providers/${id}/approve`);
            setRequests(requests.filter(req => req._id !== id));
        } catch (error) {
            console.error('Error approving provider:', error);
        }
    };

    const openRejectionModal = (id) => {
        setSelectedRequestId(id);
        setIsRejectionModalOpen(true);
    };

    const closeRejectionModal = () => {
        setSelectedRequestId(null);
        setIsRejectionModalOpen(false);
        setRejectionReason('');
        setOtherRejectionReason('');
    };

    const handleReject = async () => {
        let reason = rejectionReason;
        if (rejectionReason === 'other') {
            if (!otherRejectionReason) {
                alert('Please specify the reason for rejection.');
                return;
            }
            reason = otherRejectionReason;
        }

        if (!reason) {
            alert(t('selectRejectionReason'));
            return;
        }
        try {
            await axios.put(`/api/providers/${selectedRequestId}/reject`, { reason: reason });
            setRequests(requests.filter(req => req._id !== selectedRequestId));
            closeRejectionModal();
        } catch (error) {
            console.error('Error rejecting provider:', error);
        }
    };

    if (loading) {
        return <div>{t('loading')}</div>;
    }

    return (
        <div className="admin-container">
            <h2>{t('providerApprovals')}</h2>
            <p>{t('approveOrDisapprove')}</p>
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>{t('requestID')}</th>
                            <th>{t('username')}</th>
                            <th>{t('contactEmail')}</th>
                            <th>{t('document')}</th>
                            <th>{t('actions')}</th>
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

            {isRejectionModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3>{t('selectRejectionReason')}</h3>
                        <select
                            className="modal-select"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        >
                            <option value="">{t('selectReasonPrompt')}</option>
                            <option value="incompleteProfile">{t('incompleteProfile')}</option>
                            <option value="invalidDocument">{t('invalidDocument')}</option>
                            <option value="other">{t('other')}</option>
                        </select>
                        {rejectionReason === 'other' && (
                            <textarea
                                className="modal-textarea"
                                placeholder="Enter other reason"
                                value={otherRejectionReason}
                                onChange={(e) => setOtherRejectionReason(e.target.value)}
                            />
                        )}
                        <div className="modal-actions">
                            <button className="btn cancel" onClick={closeRejectionModal}>{t('cancel')}</button>
                            <button className="btn confirm" onClick={handleReject}>{t('confirm')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderApprovals;
