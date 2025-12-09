import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, {user?.username}! (Provider)</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>
      <main className="dashboard-content">
        <div className="dashboard-card">
          <h3>Manage Your Services</h3>
          <p>View, edit, or delete your service listings</p>
          <button onClick={() => navigate('/manage-listings')} className="action-btn">Manage Services</button>
        </div>
        <div className="dashboard-card">
          <h3>Customer Reviews</h3>
          <p>View feedback from your clients</p>
          <button onClick={() => navigate('/customer-reviews')} className="action-btn">View Reviews</button>
        </div>
        <div className="dashboard-card">
          <h3>Edit Profile</h3>
          <p>Update your provider profile and contact info</p>
          <button onClick={() => navigate('/edit-provider-profile')} className="action-btn">Edit Profile</button>
        </div>
      </main>
    </div>
  );
};

export default ProviderDashboard;
