import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, {user?.username}!</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>
      <main className="dashboard-content">
        <div className="dashboard-card">
          <h3>Edit Profile</h3>
          <p>Update your personal information and preferences</p>
          <button onClick={() => navigate('/customer-profile')} className="action-btn">Go to Profile</button>
        </div>
        <div className="dashboard-card">
          <h3>Booking History</h3>
          <p>View your past and upcoming event bookings</p>
          <button onClick={() => navigate('/booking-history')} className="action-btn">View History</button>
        </div>
        <div className="dashboard-card">
          <h3>New Booking</h3>
          <p>Plan a new event and find services</p>
          <button onClick={() => navigate('/new-booking')} className="action-btn">Book Now</button>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
