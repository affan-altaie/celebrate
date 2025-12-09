import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const sampleBookings = [
  { id: 1, service: 'Venue Rental', date: '2023-10-15', status: 'Completed' },
  { id: 2, service: 'Catering Service', date: '2023-11-20', status: 'Upcoming' },
  { id: 3, service: 'Photography', date: '2023-09-05', status: 'Completed' },
  { id: 4, service: 'DJ Service', date: '2023-12-01', status: 'Upcoming' },
  { id: 5, service: 'Florist', date: '2023-08-25', status: 'Completed' },
];

const BookingHistory = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Booking History</h1>
        <button onClick={() => navigate('/customer-dashboard')} className="action-btn">Back to Dashboard</button>
      </header>
      <main className="dashboard-content">
        {sampleBookings.map(booking => (
          <div key={booking.id} className="dashboard-card">
            <h3>{booking.service}</h3>
            <p>Date: {booking.date}</p>
            <p>Status: {booking.status}</p>
            {booking.status === 'Completed' && (
              <button onClick={() => navigate(`/leave-review/${booking.id}`)} className="action-btn review-btn">
                Leave a Review
              </button>
            )}
          </div>
        ))}
      </main>
    </div>
  );
};

export default BookingHistory;
