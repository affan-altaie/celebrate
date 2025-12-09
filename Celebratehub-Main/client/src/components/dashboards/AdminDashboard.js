import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Admin Dashboard - {user?.username}</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>
      <main className="dashboard-content">
        <div className="dashboard-card">
          <h3>Manage Services</h3>
          <p>Add, edit, or delete services</p>
          <button onClick={() => navigate('/admin/manage-services')} className="action-btn">Manage Services</button>
        </div>
        <div className="dashboard-card">
          <h3>User Management</h3>
          <p>Edit/Delete users, Reset passwords</p>
          <button onClick={() => navigate('/admin/user-management')} className="action-btn">Manage Users</button>
        </div>
        <div className="dashboard-card">
          <h3>Provider Approvals</h3>
          <p>Approve or disapprove provider registrations</p>
          <button onClick={() => navigate('/admin/provider-approvals')} className="action-btn">View Requests</button>
        </div>
        <div className="dashboard-card">
          <h3>Reports & Feedback</h3>
          <p>View system reports and user feedback</p>
          <button onClick={() => navigate('/admin/reports-and-feedback')} className="action-btn">View Reports</button>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
