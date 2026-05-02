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

  // New state for payment options
  const [savedCard, setSavedCard] = useState(null);
  const [useSavedCard, setUseSavedCard] = useState(false);
  
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

  const locations = [
    "Adam",
    "Al Amerat",
    "Al Awabi",
    "Al Buraimi",
    "Al Hamra",
    "Al Jazir",
    "Al Kamil Wal Wafi",
    "Al Khaburah",
    "Al Mudaybi",
    "Al Musannah",
    "Al Qabil",
    "As Sunaynah",
    "As Suwayq",
    "Bahla",
    "Barka",
    "Bawshar",
    "Bidbid",
    "Bidiyah",
    "Bukha",
    "Dhalkut",
    "Dhank",
    "Dibba Al-Baya",
    "Dima Wa At Taiyyin",
    "Duqm",
    "Haima",
    "Ibra",
    "Ibri",
    "Izki",
    "Jalan Bani Bu Ali",
    "Jalan Bani Bu Hassan",
    "Khasab",
    "Liwa",
    "Madha",
    "Mahdah",
    "Mahout",
    "Manah",
    "Masirah",
    "Mirbat",
    "Muqshin",
    "Muscat",
    "Muttrah",
    "Nakhal",
    "Nizwa",
    "Qurayyat",
    "Rakhyut",
    "Rustaq",
    "Sadah",
    "Saham",
    "Salalah",
    "Samail",
    "Seeb",
    "Shalim and the Hallaniyat Islands",
    "Shinas",
    "Sohar",
    "Sur",
    "Taqah",
    "Thumrait",
    "Wadi Al Maawil",
    "Wadi Bani Khalid",
    "Yanqul"
  ].sort();
  // Fetch Service Details
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

  // Fetch User Balance and Saved Card
  useEffect(() => {
    const fetchUserData = async () => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser && storedUser.id) {
            try {
                const { data } = await axios.get(`/api/payments/balance/${storedUser.id}`);
                if (data.savedCard) {
                    setSavedCard(data.savedCard);
                    setUseSavedCard(true); // Default to using saved card if available
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        }
    };
    fetchUserData();
  }, []);

  // Calculate Total Price
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
    if (!selectedDate || !selectedTime) {
      toast.error(t("selectDateTimeAlert"));
      return;
    }

    if (!useSavedCard) {
        // Run validation only if using a new card
        if (!formData.cardHolderName.trim() || !/^[a-zA-Z\s]+$/.test(formData.cardHolderName)) {
            toast.error(t('cardHolderNameInvalid')); return;
        }
        if (formData.cardNumber.replace(/\D/g, '').length !== 16) {
            toast.error(t('invalidCardNumber')); return;
        }
        if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(formData.expiryDate)) {
            toast.error(t("invalidExpiryDate")); return;
        }
        if (!/^\d{3,4}$/.test(formData.cvc)) {
            toast.error(t('invalidCvc')); return;
        }
    }

    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || !storedUser.id) {
      toast.error(t("loginToBook"));
      navigate("/login");
      return;
    }

    const bookingPayload = {
        userId: storedUser.id,
        serviceId: service._id,
        serviceName: service.name,
        date: selectedDate,
        time: selectedTime,
        hours: hours,
        totalPrice: totalPrice,
        location: formData.location,
        useSavedCard: useSavedCard,
        payment: useSavedCard ? undefined : {
          cardNumber: formData.cardNumber,
          expiryDate: formData.expiryDate,
          cvc: formData.cvc,
          cardHolderName: formData.cardHolderName,
        },
        saveCard: !useSavedCard && formData.saveCard,
      };

    try {
      const response = await axios.post("/api/bookings", bookingPayload);
      if (response.status === 201) {
        const bookingDetails = {
            service,
            booking: { ...formData, date: selectedDate, time: selectedTime, price: totalPrice },
        };
        toast.success(t("bookingSuccessful"));
        navigate("/booking-confirmation", { state: { bookingDetails } });
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(error.response?.data?.message || t("bookingFailed"));
    }
  };

  const handlePrevMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const renderCalendar = () => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const dates = [];
    for (let i = 0; i < firstDayOfMonth; i++) dates.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isAvailable = service.availability && service.availability[dateStr] && service.availability[dateStr].length > 0;
      const isSelected = selectedDate === dateStr;
      dates.push(
        <div key={day} className={`calendar-day ${isAvailable ? 'available' : ''} ${isSelected ? 'selected' : ''}`} onClick={() => isAvailable && (setSelectedDate(dateStr), setSelectedTime(null))}>
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
        <div className="calendar-grid">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="calendar-header">{t(day.toLowerCase())}</div>)}{dates}</div>
      </div>
    );
  };

  if (!service) return <div className="loading">{t('loading')}</div>;

  return (
    <div className="booking-page-container-wrapper">
      <button onClick={() => navigate(-1)} className="back-button">{t('backToServiceDetails')}</button>
      <div className="booking-page-container">
        <div className="booking-details-column">
            <img src={service.images[service.mainImageIndex]} alt={service.name} className="service-image" />
            <h2>{service.name}</h2>
            <div className="service-meta"><span><FaStar /> {service.rating}</span> <span><FaUserFriends /> {t('reviewsCount', { count: service.reviews })}</span></div>
            <p className="service-info"><FaMapMarkerAlt /> {service.location}</p>
            {service.pricePerHour && <p className="service-info">OMR {service.pricePerHour} / hour</p>}
            {service.pricePerPerson && <p className="service-info">OMR {service.pricePerPerson} / {t('personLabel')}</p>}
            <p className="service-description">{service.description}</p>
            <div className="service-features"><h3>{t('features')}</h3><ul>{service.features.map((feature, index) => <li key={index}><FaCheckCircle /> {feature}</li>)}</ul></div>
        </div>
        <div className="booking-form-column">
          <h2>{t('bookThisService')}</h2>
          <form onSubmit={handleSubmit} className="booking-form" noValidate>
            <div className="form-group"><label><FaMapMarkerAlt /> {t('locationDetails')}</label><select name="location" value={formData.location} onChange={handleChange} required><option value="">{t('selectLocation')}</option>{locations.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
            <div className="form-group"><label><FaPhone /> {t('phoneNumber')}</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder={t('phoneNumberPlaceholder')} required /></div>
            <div className="form-group"><label><FaEnvelope /> {t('emailAddress')}</label><input type="email" name="email" value={formData.email} onChange={handleChange} placeholder={t('emailAddressPlaceholder')} required /></div>
            {service.pricePerHour && <div className="form-group"><label><FaClock /> {t('numberOfHours')}</label><input type="number" name="hours" value={hours} onChange={(e) => setHours(e.target.value)} min="1" required /></div>}
            {service.pricePerPerson && <div className="form-group"><label><FaUserFriends /> {t('numberOfPersons')}</label><input type="number" name="persons" value={numberOfPersons} onChange={(e) => setNumberOfPersons(e.target.value)} min="1" required /></div>}
            {totalPrice > 0 && <div className="form-group"><label>{t('totalPrice')}</label><p className="total-price">OMR {totalPrice.toFixed(2)}</p></div>}
            <div className="form-group"><label><FaCalendarAlt /> {t('selectAvailableDate')}</label>{renderCalendar()}</div>
            {selectedDate && <div className="form-group"><label>{t('selectAvailableTime', { date: selectedDate })}</label><div className="time-slots-container">{service.availability[selectedDate]?.map((time, index) => <button key={index} type="button" className={`time-slot-button ${selectedTime === time ? 'selected' : ''}`} onClick={() => setSelectedTime(time)}>{time}</button>)}</div></div>}
            
            <div className="payment-section-container">
              <h3 style={{ textAlign: 'center' }}><FaCreditCard /> {t('paymentInformation')}</h3>

              {savedCard && (
                <div className="payment-choice">
                  <div className="choice-option">
                    <input type="radio" id="useSavedCard" name="paymentMethod" checked={useSavedCard} onChange={() => setUseSavedCard(true)} />
                    <label htmlFor="useSavedCard">{t('useSavedCard')} (.... .... .... {savedCard.cardNumber.slice(-4)})</label>
                  </div>
                  <div className="choice-option">
                    <input type="radio" id="useNewCard" name="paymentMethod" checked={!useSavedCard} onChange={() => setUseSavedCard(false)} />
                    <label htmlFor="useNewCard">{t('useNewCard')}</label>
                  </div>
                </div>
              )}

              {/* VISUALIZATION: Show saved card if used, or new card being typed */}
              <div className="card-visualization" style={{ marginBottom: '2rem' }}>
                <div className="card-chip"></div>
                <div className="card-number">{useSavedCard && savedCard ? `**** **** **** ${savedCard.cardNumber.slice(-4)}` : (formData.cardNumber ? formData.cardNumber.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim() : '**** **** **** ****')}</div>
                <div className="card-info-row">
                    <div className="card-holder"><div className="card-holder-label">{t('cardHolderName')}</div><div className="card-holder-name">{useSavedCard && savedCard ? savedCard.cardHolderName : (formData.cardHolderName || 'Your Name')}</div></div>
                    <div className="card-expiry"><div className="card-expiry-label">{t('expiryDate')}</div><div className="card-expiry-date">{useSavedCard && savedCard ? savedCard.expiryDate : (formData.expiryDate || 'MM/YY')}</div></div>
                </div>
              </div>

              {/* NEW CARD FORM: Show only if not using saved card */}
              {!useSavedCard && (
                <div id="new-card-form">
                    <div className="form-group" style={{ marginBottom: '1.2rem' }}><label>{t('cardHolderName')}</label><input type="text" name="cardHolderName" value={formData.cardHolderName.toUpperCase()} onChange={(e) => setFormData({...formData, cardHolderName: e.target.value.replace(/[^a-zA-Z ]/g, "").toUpperCase()})} placeholder="e.g. John Doe" maxLength="20" required style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '10px' }}/></div>
                    <div className="form-group" style={{ marginBottom: '1.2rem' }}><label>{t('cardNumber')}</label><input type="text" name="cardNumber" inputMode="numeric" maxLength="19" value={formData.cardNumber.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim()} onChange={(e) => setFormData({...formData, cardNumber: e.target.value.replace(/\D/g, '')})} placeholder="0000 0000 0000 0000" required style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '10px' }} /></div>
                    <div className="form-row" style={{ marginBottom: '1.5rem' }}>
                        <div className="form-group" style={{ flex: 1 }}><label>{t('expiryDate')}</label><input type="text" name="expiryDate" inputMode="numeric" maxLength="5" value={formData.expiryDate} onChange={(e) => { const input = e.target.value.replace(/\D/g, ''); setFormData({...formData, expiryDate: input.length > 2 ? input.substring(0, 2) + '/' + input.substring(2, 4) : input}); }} placeholder="MM/YY" required style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '10px' }}/></div>
                        <div className="form-group" style={{ flex: 1 }}><label>{t('cvc')}</label><input type="text" name="cvc" inputMode="numeric" maxLength="4" value={formData.cvc.replace(/\D/g, '')} onChange={(e) => setFormData({...formData, cvc: e.target.value.replace(/\D/g, '')})} placeholder="CVC" required style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '10px' }}/></div>
                    </div>
                    <div className="form-group-checkbox"><input id="saveCard" type="checkbox" name="saveCard" checked={formData.saveCard} onChange={handleChange} /><label htmlFor="saveCard">{t('saveCardForFuture')}</label></div>
                </div>
              )}
            </div>
            <button type="submit" className="submit-booking-button" disabled={!selectedDate || !selectedTime}>{t('confirmBooking')}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
