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

  return (
    <div className="booking-confirmation-container">
      <div className="confirmation-card" id="receipt">
        <FaCheckCircle className="success-icon" />
        <h1>{t('bookingConfirmed')}</h1>
        <p dangerouslySetInnerHTML={{ __html: t('bookingProcessedText', { name: service.name }) }} />
        
        <div className="receipt-details">
          <h2>{t('receipt')}</h2>
          <div className="receipt-item"><span>{t('serviceLabel')}:</span><span>{service.name}</span></div>
          <div className="receipt-item"><span>{t('priceLabel')}:</span><span>OMR {booking.price.toFixed(2)}</span></div>
          <div className="receipt-item"><span>{t('dateLabel')}:</span><span>{booking.date}</span></div>
          <div className="receipt-item"><span>{t('timeLabel')}:</span><span>{booking.time}</span></div>
          <div className="receipt-item"><span>{t('locationLabel')}:</span><span>{booking.location}</span></div>
          <div className="receipt-item"><span>{t('emailLabel')}:</span><span>{booking.email}</span></div>
          <div className="receipt-item"><span>{t('phoneLabel')}:</span><span>{booking.phone}</span></div>
        </div>

        <p className="print-note">{t('printNote')}</p>
        
        <div className="confirmation-actions">
          <Link to="/customer-dashboard" className="dashboard-link no-print">
            {t('goToDashboard')}
          </Link>
          <Link to="/booking-history" className="dashboard-link no-print" style={{ backgroundColor: '#28a745' }}>
            {t('viewHistory')}
          </Link>
          <button onClick={handlePrint} className="print-button no-print">
            <FaPrint /> {t('printReceipt')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
