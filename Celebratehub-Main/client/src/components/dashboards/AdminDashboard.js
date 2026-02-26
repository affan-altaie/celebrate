import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>{t('adminDashboard')} - {user?.username}</h1>
        <button onClick={handleLogout} className="logout-btn">{t('logout')}</button>
      </header>
      <main className="dashboard-content">
        <div className="dashboard-card">
          <h3>{t('manageServices')}</h3>
          <p>{t('manageServicesDescription')}</p>
          <button onClick={() => navigate('/admin/manage-services')} className="action-btn">{t('manageServices')}</button>
        </div>
        <div className="dashboard-card">
          <h3>{t('userManagement')}</h3>
          <p>{t('userManagementDescription')}</p>
          <button onClick={() => navigate('/admin/user-management')} className="action-btn">{t('manageUsers')}</button>
        </div>
        <div className="dashboard-card">
          <h3>{t('providerApprovals')}</h3>
          <p>{t('providerApprovalsDescription')}</p>
          <button onClick={() => navigate('/admin/provider-approvals')} className="action-btn">{t('viewRequests')}</button>
        </div>
        <div className="dashboard-card">
          <h3>{t('reportsAndFeedback')}</h3>
          <p>{t('reportsAndFeedbackDescription')}</p>
          <button onClick={() => navigate('/admin/reports-and-feedback')} className="action-btn">{t('viewReports')}</button>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;