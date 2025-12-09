import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaCalendarAlt, FaCreditCard, FaStar, FaUserFriends, FaCheckCircle, FaClock } from 'react-icons/fa';
import './BookingPage.css';

const services = [
    {
      id: 1,
      name: 'Elite Photography Studios',
      type: 'Photography',
      price: 'OMR 40 / hour',
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
      price: 'OMR 20 / hour',
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
      price: 'OMR 120 / hour',
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
      price: 'OMR 30 / hour',
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
  });

  useEffect(() => {
    const selectedService = services.find(s => s.id === parseInt(id));
    setService(selectedService);
  }, [id]);

  useEffect(() => {
    if (service) {
      let total = 0;
      if (hours > 0) {
        const priceRange = service.price.match(/\d+/g);
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      alert('Please select an available date and time.');
      return;
    }
    const bookingDetails = {
      service,
      booking: {
        ...formData,
        date: selectedDate,
        time: selectedTime,
      },
    };
    console.log('Booking submitted:', bookingDetails);
    navigate('/booking-confirmation', { state: { bookingDetails } });
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
        <div className="calendar-header">Sun</div>
        <div className="calendar-header">Mon</div>
        <div className="calendar-header">Tue</div>
        <div className="calendar-header">Wed</div>
        <div className="calendar-header">Thu</div>
        <div className="calendar-header">Fri</div>
        <div className="calendar-header">Sat</div>
        {dates}
      </div>
    );
  };

  if (!service) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="booking-page-container-wrapper">
      <button onClick={() => navigate(-1)} className="back-button">Back to Service Details</button>
      <div className="booking-page-container">
        <div className="booking-details-column">
          <img src={service.image} alt={service.name} className="service-image" />
        <h2>{service.name}</h2>
        <div className="service-meta">
          <span><FaStar /> {service.rating}</span>
          <span><FaUserFriends /> {service.reviews} reviews</span>
        </div>
        <p className="service-info"><FaMapMarkerAlt /> {service.location}</p>
        <p className="service-info">{service.price}</p>
        {service.pricePerPerson && <p className="service-info">{service.pricePerPerson} / person</p>}
        <p className="service-description">{service.description}</p>
        <div className="service-features">
          <h3>Features</h3>
          <ul>
            {service.features.map((feature, index) => (
              <li key={index}><FaCheckCircle /> {feature}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="booking-form-column">
        <h2>Book This Service</h2>
        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label><FaMapMarkerAlt /> Location Details</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter your event address"
              required
            />
          </div>
          <div className="form-group">
            <label><FaPhone /> Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
            />
          </div>
          <div className="form-group">
            <label><FaEnvelope /> Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              required
            />
          </div>
          <div className="form-group">
            <label><FaClock /> Enter Number of Hours</label>
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
              <label><FaUserFriends /> Enter Number of Persons</label>
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
              <label>Total Price</label>
              <p className="total-price">OMR {totalPrice.toFixed(2)}</p>
            </div>
          )}

          <div className="form-group">
            <label><FaCalendarAlt /> Select an Available Date</label>
            {renderCalendar()}
          </div>

          {selectedDate && (
            <div className="form-group">
              <label>Select an Available Time for {selectedDate}</label>
              <div className="time-slots-container">
                {service.availability[selectedDate].map((time, index) => (
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

          <div className="payment-details">
            <h3><FaCreditCard /> Payment Information</h3>
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
                placeholder="0000 0000 0000 0000"
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="text"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  placeholder="MM/YY"
                  required
                />
              </div>
              <div className="form-group">
                <label>CVC</label>
                <input
                  type="text"
                  name="cvc"
                  value={formData.cvc}
                  onChange={handleChange}
                  placeholder="123"
                  required
                />
              </div>
            </div>
          </div>
          
          <button type="submit" className="submit-booking-button" disabled={!selectedDate || !selectedTime}>Confirm Booking</button>
        </form>
      </div>
    </div>
    </div>
  );
};

export default BookingPage;
