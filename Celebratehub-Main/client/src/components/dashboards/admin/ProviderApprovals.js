import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

const ProviderApprovals = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchPendingProviders = async () => {
      try {
        const response = await axios.get('/api/providers/pending');
        setRequests(response.data);
      } catch (error) {
        console.error('Error fetching pending providers:', error);
      }
    };

    fetchPendingProviders();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/providers/${id}/approve`);
      setRequests(requests.filter(request => request._id !== id));
      alert('Provider approved successfully!');
    } catch (error) {
      console.error('Error approving provider:', error);
      alert('Error approving provider. Please try again.');
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`/api/providers/${id}/reject`);
      setRequests(requests.filter(request => request._id !== id));
      alert('Provider rejected successfully!');
    } catch (error) {
      console.error('Error rejecting provider:', error);
      alert('Error rejecting provider. Please try again.');
    }
  };

  return (
    <div className="admin-container">
      <h1>Provider Approvals</h1>
      <p>This page allows administrators to approve or reject new service provider registrations.</p>
      
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Username</th>
              <th>Contact Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(request => (
              <tr key={request._id}>
                <td>{request._id}</td>
                <td>{request.username}</td>
                <td>{request.email}</td>
                <td>
                  <span className={`status ${request.status.toLowerCase()}`}>
                    {request.status}
                  </span>
                </td>
                <td>
                  {request.status === 'pending' && (
                    <>
                      <button className="action-btn" onClick={() => handleApprove(request._id)}>Approve</button>
                      <button className="delete-btn" onClick={() => handleReject(request._id)}>Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProviderApprovals;
