import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';

const ManageServices = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const [selectedReason, setSelectedReason] = useState(''); // New state for dropdown reason
  const [serviceToDelete, setServiceToDelete] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('/api/services');
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchServices();
  }, []);

  const handleDelete = (serviceId) => {
    setServiceToDelete(serviceId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    let finalReason = selectedReason;
    if (selectedReason === 'Other') {
      if (!deletionReason) {
        alert('Please provide a reason for deletion.');
        return;
      }
      finalReason = deletionReason;
    } else if (!selectedReason) {
        alert('Please select a reason for deletion.');
        return;
    }
    try {
      await axios.delete(`/api/services/${serviceToDelete}`, { data: { reason: finalReason } });
      setServices(services.filter(service => service._id !== serviceToDelete));
      alert('Service deleted successfully');
      setShowDeleteModal(false);
      setServiceToDelete(null);
      setDeletionReason('');
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setServiceToDelete(null);
    setDeletionReason('');
    setSelectedReason(''); // Reset selected reason
  };

  return (
    <div className="admin-container">
      <h1>{t('manageServices')}</h1>
      <p>{t('manageServicesDescription')}</p>
      
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('imageLabel')}</th>
              <th>{t('serviceNameLabel')}</th>
              <th>{t('category')}</th>
              <th>{t('location')}</th>
              <th>{t('pricePerHour')}</th>
              <th>{t('providerNameLabel')}</th>
              <th>{t('actionsLabel')}</th>
            </tr>
          </thead>
          <tbody>
            {services.map(service => {
              const serviceName = service.name.split(': ')[1] || service.name;

              return (
                <tr key={service._id}>
                  <td>
                    {service.images && service.images.length > 0 && (
                      <img
                        src={service.images[0]}
                        alt={service.name}
                        className="service-image"
                        onClick={() => navigate(`/service/${service._id}`)}
                        style={{ cursor: 'pointer' }} // Add a pointer cursor to indicate clickability
                      />
                    )}
                  </td>
                  <td>{serviceName}</td>
                  <td>{service.category}</td>
                  <td>{service.location}</td>
                  <td>{service.pricePerHour}</td>
                  <td>{service.providerId ? service.providerId.username : 'N/A'}</td>
                  <td>
                    <button onClick={() => handleDelete(service._id)} className="delete-btn">{t('delete')}</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showDeleteModal && (
        <div className="delete-modal">
            <div className="delete-modal-content">
                <h2>{t('deleteService')}</h2>
                <p>{t('deleteServiceReasonPrompt')}</p>
                <select
                  value={selectedReason}
                  onChange={(e) => {
                    setSelectedReason(e.target.value);
                    if (e.target.value !== 'Other') {
                      setDeletionReason(''); // Clear custom reason if not 'Other'
                    }
                  }}
                  className="reason-dropdown"
                >
                  <option value="">{t('selectReason')}</option>
                  <option value="Service no longer offered">{t('reasonNoLongerOffered')}</option>
                  <option value="Policy violation">{t('reasonPolicyViolation')}</option>
                  <option value="Spam">{t('reasonSpam')}</option>
                  <option value="Other">{t('reasonOther')}</option>
                </select>
                {selectedReason === 'Other' && (
                  <textarea
                      value={deletionReason}
                      onChange={(e) => setDeletionReason(e.target.value)}
                      placeholder={t('deletionReasonPlaceholder')}
                      className="reason-textarea"
                  />
                )}
                <div className="delete-modal-actions">
                    <button onClick={confirmDelete} className="delete-btn">{t('delete')}</button>
                    <button onClick={cancelDelete} className="action-btn">{t('cancel')}</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ManageServices;
