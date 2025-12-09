import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaPrint } from 'react-icons/fa';
import './BookingConfirmation.css';

const BookingConfirmation = () => {
  const location = useLocation();
  const { bookingDetails } = location.state || {};

  const handlePrint = () => {
    window.print();
  };

  if (!bookingDetails) {
    return (
      <div className="booking-confirmation-container">
        <div className="confirmation-card">
          <h2>No booking details found.</h2>
          <Link to="/" className="dashboard-link">Go to Homepage</Link>
        </div>
      </div>
    );
  }

  const { service, booking } = bookingDetails;

  return (
    <div className="booking-confirmation-container">
      <div className="confirmation-card" id="receipt">
        <FaCheckCircle className="success-icon" />
        <h1>Booking Confirmed!</h1>
        <p>Your booking for <strong>{service.name}</strong> has been successfully processed.</p>
        
        <div className="receipt-details">
          <h2>Receipt</h2>
          <div className="receipt-item"><span>Service:</span><span>{service.name}</span></div>
          <div className="receipt-item"><span>Price:</span><span>{service.price.replace('$', 'OMR')}</span></div>
          <div className="receipt-item"><span>Date:</span><span>{booking.date}</span></div>
          <div className="receipt-item"><span>Time:</span><span>{booking.time}</span></div>
          <div className="receipt-item"><span>Location:</span><span>{booking.location}</span></div>
          <div className="receipt-item"><span>Email:</span><span>{booking.email}</span></div>
          <div className="receipt-item"><span>Phone:</span><span>{booking.phone}</span></div>
        </div>

        <p className="print-note">You will receive a confirmation email shortly. Please keep this receipt for your records.</p>
        
        <div className="confirmation-actions">
          <Link to="/customer-dashboard" className="dashboard-link no-print">
            Go to Dashboard
          </Link>
          <button onClick={handlePrint} className="print-button no-print">
            <FaPrint /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
