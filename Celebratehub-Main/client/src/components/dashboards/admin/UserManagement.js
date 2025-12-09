import React from 'react';
import './Admin.css';

const UserManagement = () => {
  const users = [
    { id: 1, username: 'johndoe', email: 'john.doe@example.com', role: 'Provider' },
    { id: 2, username: 'janesmith', email: 'jane.smith@example.com', role: 'Customer' },
    { id: 3, username: 'bob johnson', email: 'bob.johnson@example.com', role: 'Customer' },
    { id: 4, username: 'alicewilliams', email: 'alice.williams@example.com', role: 'Admin' }
  ];

  return (
    <div className="admin-container">
      <h1>User Management</h1>
      <p>This page allows administrators to view, edit, and delete users.</p>
      
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
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

export default UserManagement;
