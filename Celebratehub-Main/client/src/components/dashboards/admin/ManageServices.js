import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';

const ManageServices = () => {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const navigate = useNavigate();

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

  const handleEdit = (serviceId) => {
    navigate(`/admin/edit-service/${serviceId}`);
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await axios.delete(`/api/services/${serviceId}`);
        setServices(services.filter(service => service._id !== serviceId));
        alert('Service deleted successfully');
      } catch (error) {
        console.error('Error deleting service:', error);
        alert('Failed to delete service');
      }
    }
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
              <th>{t('providerId')}</th>
              <th>{t('actionsLabel')}</th>
            </tr>
          </thead>
          <tbody>
            {services.map(service => (
              <tr key={service._id}>
                <td>
                  {service.images && service.images.length > 0 && (
                    <img src={service.images[0]} alt={service.name} className="service-image" />
                  )}
                </td>
                <td>{service.name}</td>
                <td>{service.category}</td>
                <td>{service.location}</td>
                <td>{service.pricePerHour}</td>
                <td>{service.providerId}</td>
                <td>
                  <button onClick={() => handleEdit(service._id)} className="action-btn">{t('edit')}</button>
                  <button onClick={() => handleDelete(service._id)} className="delete-btn">{t('delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageServices;
