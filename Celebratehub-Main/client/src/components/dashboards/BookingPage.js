import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaCalendarAlt, FaStar, FaUserFriends, FaCheckCircle, FaClock, FaCreditCard } from 'react-icons/fa';
import './BookingPage.css';

const BookingPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [hours, setHours] = useState(1);
  const [numberOfPersons, setNumberOfPersons] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [formData, setFormData] = useState({
    location: '',
    phone: '',
    email: '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    cardHolderName: '',
    saveCard: false,
  });

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await axios.get(`/api/services/${id}`);
        setService(response.data);
        if (response.data.availability && Object.keys(response.data.availability).length > 0) {
          const firstAvailableDate = Object.keys(response.data.availability).sort()[0];
          setCurrentDate(new Date(firstAvailableDate));
        }
      } catch (error) {
        console.error('Error fetching service:', error);
      }
    };

    fetchService();
  }, [id]);

  useEffect(() => {
    if (service) {
      let total = 0;
      const numHours = parseInt(hours, 10);
      const numPersons = parseInt(numberOfPersons, 10);

      if (service.pricePerHour && !isNaN(numHours)) {
        total = parseFloat(service.pricePerHour) * numHours;
      } else if (service.pricePerPerson && !isNaN(numPersons)) {
        total = parseFloat(service.pricePerPerson) * numPersons;
      }
      setTotalPrice(total);
    }
  }, [service, hours, numberOfPersons]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Date and time validation
    if (!selectedDate || !selectedTime) {
      toast.error(t("selectDateTimeAlert"));
      return;
    }

    // Cardholder Name Validation
    if (!formData.cardHolderName.trim()) {
      toast.error(t('cardHolderNameRequired') || 'Card holder name is required.');
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(formData.cardHolderName)) {
      toast.error(t('cardHolderNameInvalid') || 'Card holder name can only contain letters and spaces.');
      return;
    }

    // Card Number Validation
    const cardNumberDigits = formData.cardNumber.replace(/\D/g, '');
    if (cardNumberDigits.length !== 16) {
      toast.error(t('invalidCardNumber') || 'Card number must be 16 digits.');
      return;
    }

    // Expiry Date Validation
    if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(formData.expiryDate)) {
      toast.error(t("invalidExpiryDate") || "Invalid expiry date format. Please use MM/YY.");
      return;
    }

    const [month, year] = formData.expiryDate.split('/');
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    const expiryMonth = parseInt(month, 10);
    const expiryYear = parseInt(year, 10);

    if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
      toast.error(t("expiredCardError") || "Card has expired. Please enter a valid expiry date.");
      return;
    }

    // CVC validation
    if (!/^\d{3,4}$/.test(formData.cvc)) {
        toast.error(t('invalidCvc') || 'CVC must be 3 or 4 digits.');
        return;
    }

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?._id;

    if (!storedUser || !userId) {
      toast.error(t("loginToBook"));
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post("/api/bookings", {
        userId: userId,
        serviceId: service._id,
        serviceName: service.name,
        date: selectedDate,
        time: selectedTime,
        hours: hours,
        totalPrice: totalPrice,
        location: formData.location,
        payment: {
          cardNumber: formData.cardNumber,
          expiryDate: formData.expiryDate,
          cvc: formData.cvc,
          cardHolderName: formData.cardHolderName,
        },
        saveCard: formData.saveCard,
      });

      if (response.status === 201) {
        const bookingDetails = {
          service,
          booking: {
            ...formData,
            date: selectedDate,
            time: selectedTime,
            price: totalPrice,
          },
        };
        toast.success(t("bookingSuccessful"))
        navigate("/booking-confirmation", { state: { bookingDetails } });
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(error.response?.data?.message || t("bookingFailed"));
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const dates = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      dates.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isAvailable = service.availability && service.availability[dateStr] && service.availability[dateStr].length > 0;
      const isSelected = selectedDate === dateStr;

      dates.push(
        <div
          key={day}
          className={`calendar-day ${isAvailable ? 'available' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => {
            if (isAvailable) {
              setSelectedDate(dateStr);
              setSelectedTime(null); // Reset time when date changes
            }
          }}
        >
          {day}
        </div>
      );
    }

    return (
      <div>
        <div className="calendar-navigation">
          <button type="button" onClick={handlePrevMonth}>&lt;</button>
          <h3>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
          <button type="button" onClick={handleNextMonth}>&gt;</button>
        </div>
        <div className="calendar-grid">
          <div className="calendar-header">{t('sun')}</div>
          <div className="calendar-header">{t('mon')}</div>
          <div className="calendar-header">{t('tue')}</div>
          <div className="calendar-header">{t('wed')}</div>
          <div className="calendar-header">{t('thu')}</div>
          <div className="calendar-header">{t('fri')}</div>
          <div className="calendar-header">{t('sat')}</div>
          {dates}
        </div>
      </div>
    );
  };

  if (!service) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="booking-page-container-wrapper">
      <button onClick={() => navigate(-1)} className="back-button">{t('backToServiceDetails')}</button>
      <div className="booking-page-container">
        <div className="booking-details-column">
          <img src={service.images[service.mainImageIndex]} alt={service.name} className="service-image" />
        <h2>{service.name}</h2>
        <div className="service-meta">
          <span><FaStar /> {service.rating}</span>
          <span><FaUserFriends /> {t('reviewsCount', { count: service.reviews })}</span>
        </div>
        <p className="service-info"><FaMapMarkerAlt /> {service.location}</p>
        {service.pricePerHour && <p className="service-info">OMR {service.pricePerHour} / hour</p>}
        {service.pricePerPerson && <p className="service-info">OMR {service.pricePerPerson} / {t('personLabel')}</p>}
        <p className="service-description">{service.description}</p>
        <div className="service-features">
          <h3>{t('features')}</h3>
          <ul>
            {service.features.map((feature, index) => (
              <li key={index}><FaCheckCircle /> {feature}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="booking-form-column">
        <h2>{t('bookThisService')}</h2>
        <form onSubmit={handleSubmit} className="booking-form" noValidate>
          <div className="form-group">
            <label><FaMapMarkerAlt /> {t('locationDetails')}</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder={t('eventAddressPlaceholder')}
              required
            />
          </div>
          <div className="form-group">
            <label><FaPhone /> {t('phoneNumber')}</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={t('phoneNumberPlaceholder')}
              required
            />
          </div>
          <div className="form-group">
            <label><FaEnvelope /> {t('emailAddress')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('emailAddressPlaceholder')}
              required
            />
          </div>

          {service.pricePerHour && (
            <div className="form-group">
              <label><FaClock /> {t('numberOfHours')}</label>
              <input
                type="number"
                name="hours"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                min="1"
                required
              />
            </div>
          )}

          {service.pricePerPerson && (
            <div className="form-group">
              <label><FaUserFriends /> {t('numberOfPersons')}</label>
              <input
                type="number"
                name="persons"
                value={numberOfPersons}
                onChange={(e) => setNumberOfPersons(e.target.value)}
                min="1"
                required
              />
            </div>
          )}
          
          {totalPrice > 0 && (
            <div className="form-group">
              <label>{t('totalPrice')}</label>
              <p className="total-price">OMR {totalPrice.toFixed(2)}</p>
            </div>
          )}

          <div className="form-group">
            <label><FaCalendarAlt /> {t('selectAvailableDate')}</label>
            {renderCalendar()}
          </div>

          {selectedDate && (
            <div className="form-group">
              <label>{t('selectAvailableTime', { date: selectedDate })}</label>
              <div className="time-slots-container">
                {service.availability[selectedDate] && service.availability[selectedDate].map((time, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`time-slot-button ${selectedTime === time ? 'selected' : ''}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="payment-section-container">
            <h3 style={{ textAlign: 'center' }}><FaCreditCard /> {t('paymentInformation')}</h3>
            
              <div className="card-visualization" style={{ marginBottom: '2rem' }}>
                  <div className="card-chip"></div>
                  <div className="card-number">
                  {formData.cardNumber ? formData.cardNumber.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim() : '**** **** **** ****'}
                  </div>
                  <div className="card-info-row">
                  <div className="card-holder">
                      <div className="card-holder-label">{t('cardHolderName')}</div>
                      <div className="card-holder-name">{formData.cardHolderName || 'Your Name'}</div>
                  </div>
                  <div className="card-expiry">
                      <div className="card-expiry-label">{t('expiryDate')}</div>
                      <div className="card-expiry-date">{formData.expiryDate || 'MM/YY'}</div>
                  </div>
                  </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-color)', opacity: 0.8 }}>
                  {t('cardHolderName')}
                </label>
                <input
                  type="text"
                  name="cardHolderName"
                  value={formData.cardHolderName.toUpperCase()}
                  onChange={(e) => {
                      const formattedValue = e.target.value.replace(/[^a-zA-Z ]/g, "");
                      setFormData({...formData, cardHolderName: formattedValue.toUpperCase()});
                  }}
                  placeholder="e.g. John Doe"
                  maxLength="20"
                  required
                  style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--background-color)', color: 'var(--text-color)', textTransform: 'uppercase' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-color)', opacity: 0.8 }}>
                    {t('cardNumber')}
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    inputMode="numeric"
                    maxLength="19"
                    value={formData.cardNumber.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim()}
                    onChange={(e) => {
                      const formattedValue = e.target.value.replace(/\D/g, '');
                      setFormData({...formData, cardNumber: formattedValue});
                    }}
                    placeholder="0000 0000 0000 0000"
                    required
                    style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--background-color)', color: 'var(--text-color)' }}
                  />
                </div>
              <div className="form-row" style={{ marginBottom: '1.5rem', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-color)', opacity: 0.8 }}>
                    {t('expiryDate')}
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    inputMode="numeric"
                    maxLength="5"
                    value={formData.expiryDate}
                    onChange={(e) => {
                      const input = e.target.value.replace(/\D/g, '');
                      let formattedValue = input;
                      if (input.length > 2) {
                        formattedValue = input.substring(0, 2) + '/' + input.substring(2, 4);
                      }
                      setFormData({...formData, expiryDate: formattedValue});
                    }}
                    placeholder="MM/YY"
                    required
                    style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--background-color)', color: 'var(--text-color)' }}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-color)', opacity: 0.8 }}>
                    {t('cvc')}
                  </label>
                  <input
                    type="text"
                    name="cvc"
                    inputMode="numeric"
                    maxLength="4"
                    value={formData.cvc.replace(/\D/g, '')}
                    onChange={(e) => {
                      const formattedValue = e.target.value.replace(/\D/g, '');
                      setFormData({...formData, cvc: formattedValue});
                    }}
                    placeholder="CVC"
                    required
                    style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--background-color)', color: 'var(--text-color)' }}
                  />
                </div>
              </div>
              <div className="form-group-checkbox">
                <input
                  id="saveCard"
                  type="checkbox"
                  name="saveCard"
                  checked={formData.saveCard}
                  onChange={handleChange}
                />
                <label htmlFor="saveCard">{t('saveCardForFuture')}</label>
              </div>
          </div>
          
          <button type="submit" className="submit-booking-button" disabled={!selectedDate || !selectedTime}>{t('confirmBooking')}</button>
        </form>
      </div>
    </div>
    </div>
  );
};

export default BookingPage;
