import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import axios from 'axios';
import './Dashboard.css';

const ManageListings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const user = useMemo(() => JSON.parse(localStorage.getItem('user')), []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        if (!user) return;
        const providerId = user.id || user._id;
        const response = await axios.get(`/api/services/provider/${providerId}?all=true`);
        setServices(response.data);
      } catch (error) {
        console.error('Failed to fetch services', error);
      }
    };

    fetchServices();
  }, [user]);

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      await axios.put(`/api/services/${id}`, { status: newStatus });
      setServices(services.map(service => 
        (service._id === id || service.id === id) ? { ...service, status: newStatus } : service
      ));
      toast.success(t('statusUpdatedSuccessfully'));
    } catch (error) {
      console.error('Failed to update status', error);
      toast.error(t('failedToUpdateStatus'));
    }
  };

  const handleDeleteService = async (id) => {
    if (window.confirm(t("confirmDeleteService", "Are you sure you want to delete this service?"))) {
      try {
        await axios.delete(`/api/services/${id}`);
        setServices(services.filter(service => (service._id !== id && service.id !== id)));
        toast.success(t("serviceDeletedSuccess", "Service deleted successfully."));
      } catch (error) {
        console.error("Failed to delete service", error);
        toast.error(t("serviceDeleteError", "Failed to delete service."));
      }
    }
  };

  const getServiceName = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.split(': ');
    return parts.length > 1 ? parts.slice(1).join(': ') : fullName;
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>{t("manageServicesTitle")}</h1>
        <button onClick={() => navigate("/provider-dashboard")} className="action-btn">{t("backToDashboard")}</button>
      </header>
      <main className="dashboard-content">
        <div className="dashboard-card full-width">
          <div className="listing-header">
            <h3>
              {t("yourServices")}
              {user?.subscriptionTier && (
                <span className={`tier-badge ${user.subscriptionTier.toLowerCase().replace(/\s+/g, '-')}`}>
                  {user.subscriptionTier}
                </span>
              )}
            </h3>
            <button onClick={() => navigate("/add-service")} className="action-btn">{t("addNewServiceButton")}</button>
          </div>
          <table className="listing-table">
            <thead>
              <tr>
                <th>{t("serviceName")}</th>
                <th>{t("statusLabel")}</th>
                <th>{t("bookings")}</th>
                <th>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {services.map(service => (
                <tr key={service._id || service.id}>
                  <td>
                    <div 
                      className="service-info clickable" 
                      onClick={() => navigate(`/service/${service._id || service.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img src={service.images && service.images.length > 0 ? service.images[service.mainImageIndex || 0] : ''} alt={service.name} className="service-thumbnail" />
                      <div>
                        <strong>{getServiceName(service.name)}</strong>
                        <p>{service.type || service.category}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span 
                      className={`status ${service.status?.toLowerCase() || 'active'}`}
                      onClick={(e) => { e.stopPropagation(); handleStatusToggle(service._id || service.id, service.status || 'Active'); }}
                      style={{ cursor: 'pointer' }}
                    >
                      {service.status || 'Active'}
                    </span>
                  </td>
                  <td>{service.bookings ? service.bookings.length : 0}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/edit-listing/${service._id || service.id}`); }} 
                        className="action-btn"
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        {t("edit")}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteService(service._id || service.id); }} 
                        className="delete-btn"
                        style={{ margin: 0, padding: '0.5rem 1rem' }}
                      >
                        {t("delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default ManageListings;
