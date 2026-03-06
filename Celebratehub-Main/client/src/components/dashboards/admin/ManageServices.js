import React from 'react';
import { useTranslation } from 'react-i18next';
import './Admin.css';

const ManageServices = () => {
  const { t } = useTranslation();
  const services = [
    { id: 1, name: 'Elite Photography Studios', provider: 'John Doe', status: 'Active' },
    { id: 2, name: 'Gourmet Catering Co.', provider: 'Jane Smith', status: 'Active' },
    { id: 3, name: 'Elegant Wedding Halls', provider: 'Bob Johnson', status: 'Inactive' },
    { id: 4, name: 'Joyful Birthday Parties', provider: 'Alice Williams', status: 'Active' }
  ];

  return (
    <div className="admin-container">
      <h1>{t('manageServices')}</h1>
      <p>{t('manageServicesDescription')}</p>
      
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('serviceIdLabel')}</th>
              <th>{t('serviceNameLabel')}</th>
              <th>{t('providerLabel')}</th>
              <th>{t('statusLabel')}</th>
              <th>{t('actionsLabel')}</th>
            </tr>
          </thead>
          <tbody>
            {services.map(service => (
              <tr key={service.id}>
                <td>{service.id}</td>
                <td>{service.name}</td>
                <td>{service.provider}</td>
                <td>
                  <span className={`status ${service.status.toLowerCase()}`}>
                    {t(service.status.toLowerCase())}
                  </span>
                </td>
                <td>
                  <button className="action-btn">{t('edit')}</button>
                  <button className="delete-btn">{t('delete')}</button>
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
