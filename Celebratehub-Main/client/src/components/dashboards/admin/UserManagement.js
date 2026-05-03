import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Admin.css';
import logo1 from '../../../assets/logo1.png';

const UserManagement = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [customerCurrentPage, setCustomerCurrentPage] = useState(1);
  const [providerCurrentPage, setProviderCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        setUsers(response.data);
      } catch (err) {
        setError('Failed to fetch users.');
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  const handleImageError = (e) => {
    e.target.src = logo1;
  };

  const getRoleBadge = (role) => {
    let badgeClass = '';
    let roleText = '';

    switch (role) {
      case 'customer':
        badgeClass = 'badge-customer';
        roleText = t('customer');
        break;
      case 'provider':
        badgeClass = 'badge-provider';
        roleText = t('serviceProvider');
        break;
      case 'admin':
        badgeClass = 'badge-admin';
        roleText = t('admin');
        break;
      default:
        badgeClass = 'badge-default';
        roleText = role;
    }

    return <span className={`badge ${badgeClass}`}>{roleText}</span>;
  };

  const getStatusBadge = (status) => {
    let badgeClass = '';
    switch (status) {
      case 'approved':
        badgeClass = 'badge-approved';
        break;
      case 'pending':
        badgeClass = 'badge-pending';
        break;
      case 'rejected':
        badgeClass = 'badge-rejected';
        break;
      default:
        return status || 'N/A';
    }
    return <span className={`badge ${badgeClass}`}>{t(status) || status}</span>;
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole ? user.role === filterRole : true;
    const matchesSearch = searchTerm
      ? user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesRole && matchesSearch;
  });

  const customers = filteredUsers.filter(user => user.role === 'customer');
  const providers = filteredUsers.filter(user => user.role === 'provider');

  // Customer Pagination
  const indexOfLastCustomer = customerCurrentPage * usersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - usersPerPage;
  const currentCustomers = customers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalCustomerPages = Math.ceil(customers.length / usersPerPage);

  // Provider Pagination
  const indexOfLastProvider = providerCurrentPage * usersPerPage;
  const indexOfFirstProvider = indexOfLastProvider - usersPerPage;
  const currentProviders = providers.slice(indexOfFirstProvider, indexOfLastProvider);
  const totalProviderPages = Math.ceil(providers.length / usersPerPage);

  const handleUsersPerPageChange = (e) => {
    setUsersPerPage(parseInt(e.target.value, 10));
    setCustomerCurrentPage(1);
    setProviderCurrentPage(1);
  };
  

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>{t('userManagement')}</h1>
        <Link to="/admin/create-user" className="create-user-btn">{t('createUser')}</Link>
      </div>
      <p>{t('userManagementDescription')}</p>

      {error && <p className="error-message">{error}</p>}

      <div className="user-filters">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCustomerCurrentPage(1);
            setProviderCurrentPage(1);
          }}
          className="filter-input"
        />
        <select
          value={filterRole}
          onChange={(e) => {
            setFilterRole(e.target.value);
            setCustomerCurrentPage(1);
            setProviderCurrentPage(1);
          }}
          className="filter-select"
        >
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="provider">Provider</option>
        </select>
        <select onChange={handleUsersPerPageChange} value={usersPerPage} className="filter-select">
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
        </select>
      </div>

      <div className="user-section-card">
        <h2>{t('customers')} ({customers.length})</h2>
        <div className="admin-table-container">
        <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>{t('userIdLabel')}</th>
                <th>{t('usernameLabel')}</th>
                <th>{t('emailLabel')}</th>
                <th>{t('roleLabel')}</th>
                <th>{t('actionsLabel')}</th>
              </tr>
            </thead>
            <tbody>
              {currentCustomers.map(user => (
                <tr key={user._id}>
                  <td>
                    <img 
                      src={user.profilePicture || logo1} 
                      alt={user.username} 
                      style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
                      onError={handleImageError}
                    />
                  </td>
                  <td>{user._id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>
                    <button className="action-btn">{t('edit')}</button>
                    <button className="delete-btn">{t('delete')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination-controls">
          <button onClick={() => setCustomerCurrentPage(customerCurrentPage - 1)} disabled={customerCurrentPage === 1}>Previous</button>
          <span>Page {customerCurrentPage} of {totalCustomerPages || 1}</span>
          <button onClick={() => setCustomerCurrentPage(customerCurrentPage + 1)} disabled={customerCurrentPage === totalCustomerPages || totalCustomerPages === 0}>Next</button>
        </div>
      </div>

      <div className="user-section-card">
        <h2>{t('providers')} ({providers.length})</h2>
        <div className="admin-table-container">
        <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>{t('userIdLabel')}</th>
                <th>{t('usernameLabel')}</th>
                <th>{t('emailLabel')}</th>
                <th>{t('roleLabel')}</th>
                <th>Rating</th>
                <th>{t('statusLabel')}</th>
                <th>{t('actionsLabel')}</th>
              </tr>
            </thead>
            <tbody>
              {currentProviders.map(user => (
                <tr key={user._id}>
                  <td>
                    <img 
                      src={user.profilePicture || logo1} 
                      alt={user.username} 
                      style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
                      onError={handleImageError}
                    />
                  </td>
                  <td>{user._id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>{user.rating ? `${Number(user.rating).toFixed(1)} ⭐` : 'N/A'}</td>
                  <td>{getStatusBadge(user.status)}</td>
                  <td>
                    <Link to={`/admin/provider-profile/${user._id}`} className="action-btn">{t('viewProfile')}</Link>
                    <button className="action-btn">{t('edit')}</button>
                    <button className="delete-btn">{t('delete')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination-controls">
          <button onClick={() => setProviderCurrentPage(providerCurrentPage - 1)} disabled={providerCurrentPage === 1}>Previous</button>
          <span>Page {providerCurrentPage} of {totalProviderPages || 1}</span>
          <button onClick={() => setProviderCurrentPage(providerCurrentPage + 1)} disabled={providerCurrentPage === totalProviderPages || totalProviderPages === 0}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
