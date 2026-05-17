import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import './Admin.css';

const ManageServices = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [serviceToDelete, setServiceToDelete] = useState(null);
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [servicesPerPage] = useState(10);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services/all');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

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
      await api.delete(`/services/${serviceToDelete}`, { data: { reason: finalReason } });
      setServices(services.filter(service => service._id !== serviceToDelete));
      alert('Service deleted successfully');
      setShowDeleteModal(false);
      setServiceToDelete(null);
      setDeletionReason('');
      setSelectedReason('');
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setServiceToDelete(null);
    setDeletionReason('');
    setSelectedReason('');
  };

  // Filter Logic
  const filteredServices = services.filter(service => {
    const serviceName = service.name.toLowerCase();
    const providerName = service.providerId?.username?.toLowerCase() || '';
    const category = service.category.toLowerCase();
    
    const matchesSearch = serviceName.includes(searchTerm.toLowerCase()) || 
                          providerName.includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? category === filterCategory.toLowerCase() : true;
    
    return matchesSearch && matchesCategory;
  });

  // Pagination Logic
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);

  const categories = [...new Set(services.map(s => s.category))];

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>{t('manageServices')}</h1>
      </div>
      <p>{t('manageServicesDescription')}</p>

      {/* Toolbar for Search and Filter */}
      <div className="user-filters">
        <input
          type="text"
          placeholder={t('searchPlaceholder') || "Search services or providers..."}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="filter-input"
        />
        <select
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setCurrentPage(1);
          }}
          className="filter-select"
        >
          <option value="">{t('allCategories') || "All Categories"}</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      
      <div className="user-section-card">
        <h2>{t('services')} ({filteredServices.length})</h2>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('imageLabel')}</th>
                <th>{t('serviceNameLabel')}</th>
                <th>{t('category')}</th>
                <th>{t('location')}</th>
                <th>{t('price')}</th>
                <th>{t('providerNameLabel')}</th>
                <th>{t('actionsLabel')}</th>
              </tr>
            </thead>
            <tbody>
              {currentServices.map(service => {
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
                          style={{ cursor: 'pointer' }}
                        />
                      )}
                    </td>
                    <td style={{ fontWeight: '500' }}>{serviceName}</td>
                    <td><span className="badge badge-default">{service.category}</span></td>
                    <td>{service.location}</td>
                    <td>
                        {service.pricePerHour > 0 && <div>{service.pricePerHour} OMR/hr</div>}
                        {service.pricePerPerson > 0 && <div>{service.pricePerPerson} OMR/pax</div>}
                        {!service.pricePerHour && !service.pricePerPerson && "N/A"}
                    </td>
                    <td>
                      <span 
                        onClick={() => navigate(`/provider/${service.providerId._id}`)} 
                        style={{ cursor: 'pointer', color: 'var(--primary-color)', fontWeight: '600' }}
                      >
                        {service.providerId ? service.providerId.username : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleDelete(service._id)} className="delete-btn">{t('delete')}</button>
                    </td>
                  </tr>
                );
              })}
              {currentServices.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    {t('noServicesFound') || "No services found matching your criteria."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination-controls">
            <button 
              onClick={() => setCurrentPage(currentPage - 1)} 
              disabled={currentPage === 1}
            >
              {t('previous') || "Previous"}
            </button>
            <span>{t('page')} {currentPage} {t('of')} {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(currentPage + 1)} 
              disabled={currentPage === totalPages}
            >
              {t('next') || "Next"}
            </button>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
            <div className="modal-box">
                <h3>{t('deleteService')}</h3>
                <p>{t('deleteServiceReasonPrompt')}</p>
                <select
                  value={selectedReason}
                  onChange={(e) => {
                    setSelectedReason(e.target.value);
                    if (e.target.value !== 'Other') {
                      setDeletionReason('');
                    }
                  }}
                  className="modal-select"
                >
                  <option value="">{t('selectReason')}</option>
                  <option value="Service no longer offered">{t('reasonNoLongerOffered') || "Service no longer offered"}</option>
                  <option value="Policy violation">{t('reasonPolicyViolation') || "Policy violation"}</option>
                  <option value="Spam">{t('reasonSpam') || "Spam"}</option>
                  <option value="Other">{t('reasonOther') || "Other"}</option>
                </select>
                {selectedReason === 'Other' && (
                  <textarea
                      value={deletionReason}
                      onChange={(e) => setDeletionReason(e.target.value)}
                      placeholder={t('deletionReasonPlaceholder')}
                      className="modal-textarea"
                  />
                )}
                <div className="modal-actions">
                    <button onClick={confirmDelete} className="delete-btn" style={{ background: '#dc3545', color: 'white' }}>{t('delete')}</button>
                    <button onClick={cancelDelete} className="action-btn" style={{ background: '#6c757d', color: 'white', borderColor: '#6c757d' }}>{t('cancel')}</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ManageServices;
