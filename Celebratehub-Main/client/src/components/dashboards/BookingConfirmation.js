import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaCheckCircle, FaPrint } from 'react-icons/fa';
import './BookingConfirmation.css';

const BookingConfirmation = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { bookingDetails } = location.state || {};

  const handlePrint = () => {
    window.print();
  };

  if (!bookingDetails) {
    return (
      <div className="booking-confirmation-container">
        <div className="confirmation-card">
          <h2>{t('noBookingDetails')}</h2>
          <Link to="/" className="dashboard-link">{t('goToHomepage')}</Link>
        </div>
      </div>
    );
  }

  const { service, booking } = bookingDetails;

  return ();
};

export default BookingConfirmation;
