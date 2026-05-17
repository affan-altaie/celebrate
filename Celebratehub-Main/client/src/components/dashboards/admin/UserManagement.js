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
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [userToSuspend, setUserToSuspend] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users.');
      console.error(err);
    }
  };

  const handleImageError = (e) => {
    if (e.target.src !== logo1) {
      e.target.onerror = null;
      e.target.src = logo1;
    }
  };

  const truncateId = (id) => {
    return `${id.substring(0, 7)}...${id.substring(id.length - 5)}`;
  };

  const openSuspendModal = (userId) => {
    setUserToSuspend(userId);
    setShowSuspendModal(true);
  };

  const confirmSuspend = async () => {
    let finalReason = selectedReason;
    if (selectedReason === 'Other') {
      if (!suspensionReason) {
        alert('Please provide a reason for suspension.');
        return;
      }
      finalReason = suspensionReason;
    } else if (!selectedReason) {
        alert('Please select a reason for suspension.');
        return;
    }
    try {
      await axios.put(`/api/users/${userToSuspend}/suspend`, { reason: finalReason });
      fetchUsers(); // Refresh the user list
      alert('User suspended successfully');
      setShowSuspendModal(false);
      setUserToSuspend(null);
      setSuspensionReason('');
      setSelectedReason('');
    } catch (err) {
      setError('Failed to suspend user.');
      console.error(err);
      alert('Failed to suspend user');
    }
  };

  const reactivateUser = async (userId) => {
    try {
      await axios.put(`/api/users/${userId}/unsuspend`);
      fetchUsers();
      alert('User reactivated successfully');
    } catch (err) {
      setError('Failed to reactivate user.');
      console.error(err);
      alert('Failed to reactivate user');
    }
  };

  const approveProvider = async (userId) => {
    try {
      await axios.put(`/api/providers/${userId}/approve`);
      fetchUsers();
      alert('Provider approved successfully');
    } catch (err) {
      setError('Failed to approve provider.');
      console.error(err);
      alert('Failed to approve provider');
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/users/${userId}`);
        fetchUsers();
        alert('User deleted successfully');
      } catch (err) {
        setError('Failed to delete user.');
        console.error(err);
        alert('Failed to delete user');
      }
    }
  };

  const cancelSuspend = () => {
    setShowSuspendModal(false);
    setUserToSuspend(null);
    setSuspensionReason('');
    setSelectedReason('');
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

  const getStatusBadge = (user) => {
    if (!user) return 'N/A';
    const { status, role } = user;
    let badgeClass = '';
    let statusText = status;

    if (role === 'customer' && status === 'approved') {
      statusText = 'active';
    }

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
      case 'suspended':
        badgeClass = 'badge-suspended';
        break;
      default:
        return status || 'N/A';
    }
    return <span className={`badge ${badgeClass}`}>{t(statusText) || statusText}</span>;
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
                <th>{t('userID')}</th>
                <th>{t('usernameLabel')}</th>
                <th>{t('emailLabel')}</th>
                <th>{t('roleLabel')}</th>
                <th>{t('statusLabel')}</th>
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
                  <td>{truncateId(user._id)}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>{getStatusBadge(user)}</td>
                  <td>
                    <div className="actions-container">
                      {user.status === 'suspended' ? (
                        <button className="reactivate-btn" onClick={() => reactivateUser(user._id)}>{t('reactivate')}</button>
                      ) : (user.status === 'rejected' || user.status === 'pending') ? (
                        <button className="reactivate-btn" onClick={() => reactivateUser(user._id)}>{t('approve')}</button>
                      ) : (
                        <button className="suspend-btn" onClick={() => openSuspendModal(user._id)}>{t('suspend')}</button>
                      )}
                      <button className="delete-btn" onClick={() => deleteUser(user._id)}>{t('delete')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination-controls">
          <button onClick={() => setCustomerCurrentPage(customerCurrentPage - 1)} disabled={customerCurrentPage === 1}>{t('previous')}</button>
          <span>{t('page')} {customerCurrentPage} {t('of')} {totalCustomerPages || 1}</span>
          <button onClick={() => setCustomerCurrentPage(customerCurrentPage + 1)} disabled={customerCurrentPage === totalCustomerPages || totalCustomerPages === 0}>{t('next')}</button>
        </div>
      </div>

      <div className="user-section-card">
        <h2>{t('providers')} ({providers.length})</h2>
        <div className="admin-table-container">
        <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>{t('userID')}</th>
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
                    <Link to={`/provider/${user._id}`}>
                      <img 
                        src={user.profilePicture || logo1} 
                        alt={user.username} 
                        style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
                        onError={handleImageError}
                      />
                    </Link>
                  </td>
                  <td>{truncateId(user._id)}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>{user.rating ? `${Number(user.rating).toFixed(1)} ⭐` : 'N/A'}</td>
                  <td>{getStatusBadge(user)}</td>
                  <td>
                    <div className="actions-container">
                      {user.status !== 'rejected' && user.status !== 'pending' && (
                        <Link to={`/admin/edit-user/${user._id}`} className="action-btn">{t('edit')}</Link>
                      )}
                      {user.status === 'suspended' ? (
                        <button className="reactivate-btn" onClick={() => reactivateUser(user._id)}>{t('reactivate')}</button>
                      ) : (user.status === 'rejected' || user.status === 'pending') ? (
                        <button className="reactivate-btn" onClick={() => approveProvider(user._id)}>{t('approve')}</button>
                      ) : (
                        <button className="suspend-btn" onClick={() => openSuspendModal(user._id)}>{t('suspend')}</button>
                      )}
                      <button className="delete-btn" onClick={() => deleteUser(user._id)}>{t('delete')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination-controls">
          <button onClick={() => setProviderCurrentPage(providerCurrentPage - 1)} disabled={providerCurrentPage === 1}>{t('previous')}</button>
          <span>{t('page')} {providerCurrentPage} {t('of')} {totalProviderPages || 1}</span>
          <button onClick={() => setProviderCurrentPage(providerCurrentPage + 1)} disabled={providerCurrentPage === totalProviderPages || totalProviderPages === 0}>{t('next')}</button>
        </div>
      </div>

      {showSuspendModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>{t('suspendUser')}</h3>
            <p>{t('suspendUserReasonPrompt')}</p>
            <select
              value={selectedReason}
              onChange={(e) => {
                setSelectedReason(e.target.value);
                if (e.target.value !== 'Other') {
                  setSuspensionReason('');
                }
              }}
              className="modal-select"
            >
              <option value="">{t('selectReason')}</option>
              <option value="Policy violation">{t('reasonPolicyViolation')}</option>
              <option value="Spam">{t('reasonSpam')}</option>
              <option value="Other">{t('reasonOther')}</option>
            </select>
            {selectedReason === 'Other' && (
              <textarea
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder={t('suspensionReasonPlaceholder')}
                className="modal-textarea"
              />
            )}
            <div className="modal-actions">
              <button onClick={confirmSuspend} className="btn confirm">{t('suspend')}</button>
              <button onClick={cancelSuspend} className="btn cancel">{t('cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
