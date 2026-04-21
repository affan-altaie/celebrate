import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import axios from 'axios';
import './Dashboard.css';

const ManageListings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const userString = localStorage.getItem('user');
        if (!userString) return;
        const user = JSON.parse(userString);
        const providerId = user.id || user._id;
        const response = await axios.get(`/api/services/provider/${providerId}`);
        setServices(response.data);
      } catch (error) {
        console.error('Failed to fetch services', error);
      }
    };

    fetchServices();
  }, []);

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      await axios.put(`/api/services/${id}`, { status: newStatus });
      setServices(services.map(service => 
        service._id === id ? { ...service, status: newStatus } : service
      ));
      toast.success(t('statusUpdatedSuccess', { status: newStatus }));
    } catch (error) {
      console.error('Failed to update status', error);
      toast.error(t('statusUpdateError'));
    }
  };

  const handleDeleteService = async (id) => {
    if (window.confirm(t("confirmDeleteService"))) {
      try {
        await axios.delete(`/api/services/${id}`);
        setServices(services.filter(service => service._id !== id));
        toast.success(t("serviceDeletedSuccess"));
      } catch (error) {
        console.error("Failed to delete service", error);
        toast.error(t("serviceDeleteError"));
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
            <h3>{t("yourServices")}</h3>
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
                <tr key={service._id}>
                  <td>
                    <div 
                      className="service-info clickable" 
                      onClick={() => navigate(`/service/${service._id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img src={service.images[service.mainImageIndex || 0]} alt={service.name} className="service-thumbnail" />
                      <div>
                        <strong>{getServiceName(service.name)}</strong>
                        <p>{service.type}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span 
                      className={`status ${service.status?.toLowerCase() || 'active'}`}
                      onClick={(e) => { e.stopPropagation(); handleStatusToggle(service._id, service.status || 'Active'); }}
                      style={{ cursor: 'pointer' }}
                    >
                      {service.status || 'Active'}
                    </span>
                  </td>
                  <td>{service.bookings ? service.bookings.length : 0}</td>
                  <td>
                    <button onClick={() => navigate(`/edit-listing/${service._id}`)} className="action-btn">{t("edit")}</button>
                    <button onClick={() => handleDeleteService(service._id)} className="delete-btn">{t("delete")}</button>
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
