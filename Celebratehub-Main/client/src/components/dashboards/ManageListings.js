import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const ManageListings = () => {
  const navigate = useNavigate();

  const services = [
    {
      id: 1,
      name: 'Elegant Wedding Halls',
      type: 'Wedding Halls',
      image: 'https://www.shangri-la.com/-/media/Shangri-La/muscat_barraljissahresort/settings/weddings-celebrations/SLMU_Events_Spaces_1920x940.jpg',
      status: 'Active',
      bookings: 12,
    },
    {
      id: 2,
      name: 'Joyful Birthday Parties',
      type: 'Birthdays',
      image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
      status: 'Active',
      bookings: 8,
    },
    {
      id: 3,
      name: 'Corporate Event Catering',
      type: 'Catering',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
      status: 'Inactive',
      bookings: 0,
    },
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Manage Your Services</h1>
        <button onClick={() => navigate('/provider-dashboard')} className="action-btn">Back to Dashboard</button>
      </header>
      <main className="dashboard-content">
        <div className="dashboard-card full-width">
          <div className="listing-header">
            <h3>Your Services</h3>
            <button onClick={() => navigate('/add-service')} className="action-btn">Add New Service</button>
          </div>
          <table className="listing-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Status</th>
                <th>Bookings</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map(service => (
                <tr key={service.id}>
                  <td>
                    <div className="service-info">
                      <img src={service.image} alt={service.name} className="service-thumbnail" />
                      <div>
                        <strong>{service.name}</strong>
                        <p>{service.type}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status ${service.status.toLowerCase()}`}>{service.status}</span>
                  </td>
                  <td>{service.bookings}</td>
                  <td>
                    <button onClick={() => navigate(`/edit-listing/${service._id}`)} className="action-btn">Edit</button>
                    <button className="delete-btn">Delete</button>
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
