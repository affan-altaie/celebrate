import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaCalendarAlt, FaStar, FaUserFriends, FaCheckCircle, FaClock } from 'react-icons/fa';
import './BookingPage.css';

const BookingPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
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
  });

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/services/${id}`);
        setService(response.data);
      } catch (error) {
        console.error('Error fetching service:', error);
      }
    };

    fetchService();
  }, [id]);

  useEffect(() => {
    if (service) {
      const total = (service.pricePerHour * hours) + (service.pricePerPerson * numberOfPersons);
      setTotalPrice(total);
    }
  }, [service, hours, numberOfPersons]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      toast.error(t("selectDateTimeAlert"));
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
      const response = await axios.post("http://localhost:5000/api/bookings", {
        userId: userId,
        serviceId: service._id,
        serviceName: service.name,
        date: selectedDate,
        time: selectedTime,
        hours: hours,
        totalPrice: totalPrice,
        location: formData.location,
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

  const renderCalendar = () => {
    const today = new Date('2025-12-01');
    const month = today.getMonth();
    const year = today.getFullYear();
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
          <img src={`http://localhost:5000${service.images[service.mainImageIndex]}`} alt={service.name} className="service-image" />
        <h2>{service.name}</h2>
        <div className="service-meta">
          <span><FaStar /> {service.rating}</span>
          <span><FaUserFriends /> {t('reviewsCount', { count: service.reviews })}</span>
        </div>
        <p className="service-info"><FaMapMarkerAlt /> {service.location}</p>
        <p className="service-info">OMR {service.pricePerHour} / hour</p>
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
        <form onSubmit={handleSubmit} className="booking-form">
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
          
          <button type="submit" className="submit-booking-button" disabled={!selectedDate || !selectedTime}>{t('confirmBooking')}</button>
        </form>
      </div>
    </div>
    </div>
  );
};

export default BookingPage;
