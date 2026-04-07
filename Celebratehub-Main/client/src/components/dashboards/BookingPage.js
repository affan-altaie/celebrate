import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaCalendarAlt, FaCreditCard, FaStar, FaUserFriends, FaCheckCircle, FaClock } from 'react-icons/fa';
import './BookingPage.css';

const services = [
    {
      id: 1,
      name: 'Elite Photography Studios',
      type: 'Photography',
      pricePerHour: 'OMR 40 / hour',
      image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
      location: 'Muscat, Oman',
      availability: {
        '2025-12-17': ['09:00', '11:00', '14:00', '16:00'],
        '2025-12-18': ['10:00', '12:00', '15:00'],
        '2025-12-24': ['09:00', '11:00'],
        '2025-12-25': [],
      },
      rating: 4.9,
      reviews: 127,
      description: 'Professional event photography with years of experience capturing precious moments.',
      features: ['Wedding Photography', 'Corporate Events', 'Portrait Sessions'],
    },
    {
      id: 2,
      name: 'Gourmet Catering Co.',
      type: 'Catering',
      pricePerHour: 'OMR 20 / hour',
      pricePerPerson: 'OMR 2',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
      location: 'Salalah, Oman',
      availability: {
        '2025-12-20': ['12:00', '13:00', '18:00', '19:00'],
        '2025-12-21': ['12:00', '13:00', '18:00', '19:00'],
        '2025-12-27': ['17:00', '18:00'],
        '2025-12-28': ['11:00', '12:00', '13:00'],
      },
      rating: 4.8,
      reviews: 89,
      description: 'Exceptional culinary experiences tailored to your event needs and preferences.',
      features: ['Menu Planning', 'Food Service', 'Beverage Service'],
    },
    {
      id: 3,
      name: 'Elegant Wedding Halls',
      type: 'Wedding Halls',
      pricePerHour: 'OMR 120 / hour',
      pricePerPerson: 'OMR 2',
      image: 'https://www.shangri-la.com/-/media/Shangri-La/muscat_barraljissahresort/settings/weddings-celebrations/SLMU_Events_Spaces_1920x940.jpg',
      location: 'Sohar, Oman',
      availability: {
        '2025-12-15': ['10:00', '14:00', '18:00'],
        '2025-12-16': ['10:00', '14:00', '18:00'],
        '2025-12-22': ['11:00', '15:00'],
        '2025-12-23': ['11:00', '15:00'],
      },
      rating: 5,
      reviews: 156,
      description: 'Stunning wedding halls with state-of-the-art facilities and flexible spaces.',
      features: ['Indoor Spaces', 'Outdoor Gardens', 'Audio/Visual Equipment'],
    },
    {
      id: 4,
      name: 'Joyful Birthday Parties',
      type: 'Birthdays',
      pricePerHour: 'OMR 30 / hour',
      pricePerPerson: 'OMR 2',
      image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
      location: 'Nizwa, Oman',
      availability: {
        '2025-12-14': ['10:00', '12:00', '14:00', '16:00'],
        '2025-12-15': ['10:00', '12:00', '14:00', '16:00'],
        '2025-12-21': ['11:00', '13:00', '15:00'],
        '2025-12-22': ['11:00', '13:00', '15:00'],
      },
      rating: 4.7,
      reviews: 94,
      description: 'Unforgettable birthday parties for all ages, with entertainment and activities.',
      features: ['Themed Decorations', 'Games and Activities', 'Cake and Catering'],
    }
  ];
  

const BookingPage = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [hours, setHours] = useState(1);
  const [numberOfPersons, setNumberOfPersons] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [saveCard, setSaveCard] = useState(false);
  const [useSavedCard, setUseSavedCard] = useState(false);
  const [savedCardData, setSavedCardData] = useState(null);
  const [formData, setFormData] = useState({
    location: '',
    phone: '',
    email: '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    cardHolderName: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const selectedService = services.find(s => s.id === parseInt(id));
    setService(selectedService);

    // Fetch saved card info
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const userId = storedUser?.id || storedUser?._id;
    if (userId) {
      axios.get(`/api/payments/balance/${userId}`)
        .then(res => {
          if (res.data.savedCard && res.data.savedCard.cardNumber) {
            setSavedCardData(res.data.savedCard);
            setUseSavedCard(true);
            setSaveCard(true);
            setFormData(prev => ({
              ...prev,
              cardNumber: res.data.savedCard.cardNumber,
              expiryDate: res.data.savedCard.expiryDate,
              cardHolderName: res.data.savedCard.cardHolderName,
            }));
          }
        })
        .catch(err => console.error("Error fetching saved card:", err));
    }
  }, [id]);

  useEffect(() => {
    if (service) {
      let total = 0;
      if (hours > 0) {
        const priceRange = service.pricePerHour.match(/\d+/g);
        if (priceRange && priceRange.length > 0) {
          const minPrice = parseInt(priceRange[0], 10);
          total += minPrice * hours;
        }
      }
      if (service.pricePerPerson && numberOfPersons > 0) {
        const pricePerPerson = parseInt(service.pricePerPerson.match(/\d+/g)[0], 10);
        total += pricePerPerson * numberOfPersons;
      }
      setTotalPrice(total);
    } else {
      setTotalPrice(0);
    }
  }, [service, hours, numberOfPersons]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    let errors = { ...formErrors };

    switch (name) {
      case "cardHolderName":
        if (value.length > 50) {
          errors.cardHolderName = t("cardHolderNameTooLong");
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          errors.cardHolderName = t("cardHolderNameInvalid");
        } else {
          delete errors.cardHolderName;
        }
        break;
      case "cardNumber":
        const cleanedCardNumber = value.replace(/\s/g, "");
        if (cleanedCardNumber.length > 16) {
          errors.cardNumber = t("cardNumberTooLong");
        } else if (!/^[0-9]{16}$/.test(cleanedCardNumber)) {
          errors.cardNumber = t("cardNumberInvalid");
        } else {
          delete errors.cardNumber;
        }
        break;
      case "expiryDate":
        const [month, year] = value.split("/");
        const currentYear = new Date().getFullYear() % 100; // Get last two digits of year
        const currentMonth = new Date().getMonth() + 1; // Month is 0-indexed

        if (!month || !year || parseInt(month, 10) < 1 || parseInt(month, 10) > 12 || value.length !== 5) {
          errors.expiryDate = t("invalidExpiryDate") || "Invalid expiry date format. Please use MM/YY.";
        } else if (parseInt(year, 10) < currentYear || (parseInt(year, 10) === currentYear && parseInt(month, 10) < currentMonth)) {
          errors.expiryDate = t("expiredCardError") || "Card has expired. Please enter a valid expiry date.";
        } else {
          delete errors.expiryDate;
        }
        break;
      case "cvc":
        if (value.length > 4) {
          errors.cvc = t("cvcTooLong");
        } else if (!/^[0-9]{3,4}$/.test(value)) {
          errors.cvc = t("cvcInvalid");
        } else {
          delete errors.cvc;
        }
        break;
      default:
        break;
    }
    setFormErrors(errors);
  };

  const validateForm = () => {
    let errors = {};
    const { cardHolderName, cardNumber, expiryDate, cvc } = formData;

    if (!cardHolderName.trim()) {
      errors.cardHolderName = t("cardHolderNameRequired");
    } else if (cardHolderName.length > 50) {
      errors.cardHolderName = t("cardHolderNameTooLong");
    } else if (!/^[a-zA-Z\s]+$/.test(cardHolderName)) {
      errors.cardHolderName = t("cardHolderNameInvalid");
    }

    const cleanedCardNumber = cardNumber.replace(/\s/g, "");
    if (!cleanedCardNumber) {
      errors.cardNumber = t("cardNumberRequired");
    } else if (cleanedCardNumber.length > 16) {
      errors.cardNumber = t("cardNumberTooLong");
    } else if (!/^[0-9]{16}$/.test(cleanedCardNumber)) {
      errors.cardNumber = t("cardNumberInvalid");
    }

    if (!expiryDate) {
      errors.expiryDate = t("expiryDateRequired");
    } else {
      const [month, year] = expiryDate.split("/");
      const currentYear = new Date().getFullYear() % 100; // Get last two digits of year
      const currentMonth = new Date().getMonth() + 1; // Month is 0-indexed

      if (!month || !year || parseInt(month, 10) < 1 || parseInt(month, 10) > 12 || expiryDate.length !== 5) {
        errors.expiryDate = t("invalidExpiryDate") || "Invalid expiry date format. Please use MM/YY.";
      } else if (parseInt(year, 10) < currentYear || (parseInt(year, 10) === currentYear && parseInt(month, 10) < currentMonth)) {
        errors.expiryDate = t("expiredCardError") || "Card has expired. Please enter a valid expiry date.";
      }
    }

    if (!cvc) {
      errors.cvc = t("cvcRequired");
    } else if (cvc.length > 4) {
      errors.cvc = t("cvcTooLong");
    } else if (!/^[0-9]{3,4}$/.test(cvc)) {
      errors.cvc = t("cvcInvalid");
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      toast.error(t("selectDateTimeAlert"));
      return;
    }

    if (!validateForm()) {
      toast.error(t("paymentValidationErrors"));
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?.id || storedUser?._id;

    if (!storedUser || !userId) {
      toast.error(t("loginToBook"));
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post("/api/payments/process", {
        userId: userId,
        serviceId: service.id,
        serviceName: service.name,
        amount: totalPrice,
        cardHolderName: formData.cardHolderName,
        cardNumber: formData.cardNumber.replace(/\s/g, ""),
        expiryDate: formData.expiryDate,
        cvc: formData.cvc,
        saveCard: saveCard,
        language: i18n.language,
        bookingDetails: {
          ...formData,
          date: selectedDate,
          time: selectedTime,
          hours: hours,
        },
      });

      if (response.data.success) {
        const bookingDetails = {
          service,
          booking: {
            ...formData,
            date: selectedDate,
            time: selectedTime,
            price: totalPrice,
            transactionId: response.data.transactionId,
            newBalance: response.data.newBalance,
          },
        };
        toast.success(t("bookingSuccessful"))
        navigate("/booking-confirmation", { state: { bookingDetails } });
      }
    } catch (error) {
      console.error("Booking/Payment error:", error);
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
          <img src={service.image} alt={service.name} className="service-image" />
        <h2>{service.name}</h2>
        <div className="service-meta">
          <span><FaStar /> {service.rating}</span>
          <span><FaUserFriends /> {t('reviewsCount', { count: service.reviews })}</span>
        </div>
        <p className="service-info"><FaMapMarkerAlt /> {service.location}</p>
        <p className="service-info">{service.pricePerHour}</p>
        {service.pricePerPerson && <p className="service-info">{service.pricePerPerson} / {t('personLabel')}</p>}
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
                {service.availability[selectedDate].map((time, index) => (
                  <button
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

          <div className="payment-details">
            <h3><FaCreditCard /> {t('paymentInformation')}</h3>
            
            <div className="payment-section-container">
              {(formData.cardNumber || formData.cardHolderName) && (
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
              )}

              {savedCardData && (
                <div 
                  className={`saved-card-badge ${useSavedCard ? 'selected' : ''}`} 
                  onClick={() => {
                    setUseSavedCard(true);
                    setFormData(prev => ({
                      ...prev,
                      cardNumber: savedCardData.cardNumber,
                      expiryDate: savedCardData.expiryDate,
                      cardHolderName: savedCardData.cardHolderName,
                    }));
                  }}
                  style={{ cursor: 'pointer', border: useSavedCard ? '2px solid var(--primary-color)' : '1px dashed var(--primary-color)' }}
                >
                  <FaCreditCard />
                  <div className="saved-card-info">
                    <span className="label">{t('savedCard')}</span>
                    <span className="value">**** **** **** {savedCardData.cardNumber.slice(-4)}</span>
                  </div>
                </div>
              )}

              {!useSavedCard && (
                <>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label>{t('cardHolderName')}</label>
                    <input
                      type="text"
                      name="cardHolderName"
                      value={formData.cardHolderName.toUpperCase()}
                      onChange={(e) => {
                        const formattedValue = e.target.value.replace(/[^a-zA-Z ]/g, "");
                        setFormData(prev => ({...prev, cardHolderName: formattedValue.toUpperCase()}));
                      }}
                      placeholder="Name on Card"
                      required
                      maxLength={50}
                    />
                    {formErrors.cardHolderName && <p className="error-message">{formErrors.cardHolderName}</p>}
                  </div>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label>{t('cardNumber')}</label>
                    <input
                      type="text"
                      name="cardNumber"
                      inputMode="numeric"
                      maxLength="19" // 16 digits + 3 spaces
                      value={formData.cardNumber
                        .replace(/\D/g, "")
                        .replace(/(\d{4})(?=\d)/g, "$1 ")
                        .trim()}
                      onChange={(e) => {
                        const formattedValue = e.target.value
                          .replace(/\D/g, "")
                          .substring(0, 16)
                          .replace(/(\d{4})(?=\d)/g, "$1 ");
                        setFormData(prev => ({...prev, cardNumber: formattedValue}));
                      }}
                      placeholder="0000 0000 0000 0000"
                      required
                    />
                    {formErrors.cardNumber && <p className="error-message">{formErrors.cardNumber}</p>}
                  </div>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label>{t('expiryDate')}</label>
                    <input
                      type="text"
                      name="expiryDate"
                      inputMode="numeric"
                      pattern="[0-9/]{4}"
                      maxLength="5"
                      value={formData.expiryDate
                        .replace(/\D/g, "")
                        .replace(/(\d{2})(?=\d{2})/g, "$1/")
                        .substring(0, 5)}
                      onChange={(e) => {
                        const input = e.target.value.replace(/\D/g, "");
                        let formattedValue = input;
                        if (input.length > 2) {
                          formattedValue = input.substring(0, 2) + "/" + input.substring(2, 4);
                        }
                        setFormData(prev => ({...prev, expiryDate: formattedValue}));
                      }}
                      placeholder="MM/YY"
                      required
                    />
                    {formErrors.expiryDate && <p className="error-message">{formErrors.expiryDate}</p>}
                  </div>
                </>
              )}

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>{t('cvc')}</label>
                <input
                  type="text"
                  name="cvc"
                  value={formData.cvc}
                  onChange={handleChange}
                  placeholder="123"
                  required
                  maxLength={4}
                />
                {formErrors.cvc && <p className="error-message">{formErrors.cvc}</p>}
              </div>

              {savedCardData && (
                <button 
                  type="button" 
                  onClick={() => {
                    if (useSavedCard) {
                      setUseSavedCard(false);
                      setFormData(prev => ({ ...prev, cardNumber: '', expiryDate: '', cardHolderName: '' }));
                    } else {
                      setUseSavedCard(true);
                      setFormData(prev => ({
                        ...prev,
                        cardNumber: savedCardData.cardNumber,
                        expiryDate: savedCardData.expiryDate,
                        cardHolderName: savedCardData.cardHolderName,
                      }));
                    }
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', marginTop: '1rem', marginBottom: '1rem', padding: 0, fontSize: '0.9rem', fontWeight: '600', display: 'block' }}
                >
                  {useSavedCard ? t('addNewCard') : t('useSavedCard')}
                </button>
              )}

              {!useSavedCard && (
                <div className="form-group-checkbox" style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="saveCard"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                    style={{ width: 'auto', margin: 0 }}
                  />
                  <label htmlFor="saveCard" style={{ margin: 0, cursor: 'pointer', fontSize: '0.9rem', opacity: 0.9 }}>
                    {t('saveCardForFuture')}
                  </label>
                </div>
              )}
            </div>
          </div>
          
          <button type="submit" className="submit-booking-button" disabled={!selectedDate || !selectedTime || Object.keys(formErrors).length > 0}>{t('confirmBooking')}</button>
        </form>
      </div>
    </div>
    </div>
  );
};

export default BookingPage;
