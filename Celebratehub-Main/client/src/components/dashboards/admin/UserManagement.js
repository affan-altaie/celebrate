import React from 'react';
import { useTranslation } from 'react-i18next';
import './Admin.css';

const UserManagement = () => {
  const { t } = useTranslation();
  const users = [
    { id: 1, username: 'johndoe', email: 'john.doe@example.com', role: 'Provider' },
    { id: 2, username: 'janesmith', email: 'jane.smith@example.com', role: 'Customer' },
    { id: 3, username: 'bob johnson', email: 'bob.johnson@example.com', role: 'Customer' },
    { id: 4, username: 'alicewilliams', email: 'alice.williams@example.com', role: 'Admin' }
  ];

  return (
    <div className="admin-container">
      <h1>{t('userManagement')}</h1>
      <p>{t('userManagementDescription')}</p>
      
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('userIdLabel')}</th>
              <th>{t('usernameLabel')}</th>
              <th>{t('emailLabel')}</th>
              <th>{t('roleLabel')}</th>
              <th>{t('actionsLabel')}</th>
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

export default UserManagement;
