import React from 'react';
import './Admin.css';

const ManageServices = () => {
  const services = [
    { id: 1, name: 'Elite Photography Studios', provider: 'John Doe', status: 'Active' },
    { id: 2, name: 'Gourmet Catering Co.', provider: 'Jane Smith', status: 'Active' },
    { id: 3, name: 'Elegant Wedding Halls', provider: 'Bob Johnson', status: 'Inactive' },
    { id: 4, name: 'Joyful Birthday Parties', provider: 'Alice Williams', status: 'Active' }
  ];

  return (
    <div className="admin-container">
      <h1>Manage Services</h1>
      <p>This page allows administrators to view, edit, and delete services.</p>
      
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Service ID</th>
              <th>Service Name</th>
              <th>Provider</th>
              <th>Status</th>
              <th>Actions</th>
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
                    {service.status}
                  </span>
                </td>
                <td>
                  <button className="action-btn">Edit</button>
                  <button className="delete-btn">Delete</button>
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
