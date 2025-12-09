import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch, FaMapMarkerAlt, FaMoneyBillAlt, FaStar, FaCalendarCheck, FaUserFriends, 
  FaSearchLocation, FaMapMarkedAlt, FaUtensils, FaCameraRetro, FaMusic, FaCheckCircle
} from 'react-icons/fa';
import './NewBooking.css';

const NewBooking = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [rating, setRating] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const resultsRef = useRef(null);

  const services = [
    {
      id: 1,
      name: 'Elite Photography Studios',
      type: 'Photography',
      location: 'Muscat, Oman',
      reviews: 127,
      rating: 4.9,
      description: 'Professional event photography with years of experience capturing precious moments.',
      features: ['Wedding Photography', 'Corporate Events', 'Portrait Sessions'],
      price: 'OMR 40 / hour',
      image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60'
    },
    {
      id: 2,
      name: 'Gourmet Catering Co.',
      type: 'Catering',
      location: 'Salalah, Oman',
      reviews: 89,
      rating: 4.8,
      description: 'Exceptional culinary experiences tailored to your event needs and preferences.',
      features: ['Menu Planning', 'Food Service', 'Beverage Service'],
      price: 'OMR 20 / hour',
      pricePerPerson: 'OMR 2',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60'
    },
    {
      id: 3,
      name: 'Elegant Wedding Halls',
      type: 'Wedding Halls',
      location: 'Sohar, Oman',
      reviews: 156,
      rating: 5,
      description: 'Stunning wedding halls with state-of-the-art facilities and flexible spaces.',
      features: ['Indoor Spaces', 'Outdoor Gardens', 'Audio/Visual Equipment'],
      price: 'OMR 120 / hour',
      pricePerPerson: 'OMR 2',
      image: 'https://www.shangri-la.com/-/media/Shangri-La/muscat_barraljissahresort/settings/weddings-celebrations/SLMU_Events_Spaces_1920x940.jpg'
    },
    {
      id: 4,
      name: 'Joyful Birthday Parties',
      type: 'Birthdays',
      location: 'Nizwa, Oman',
      reviews: 94,
      rating: 4.7,
      description: 'Unforgettable birthday parties for all ages, with entertainment and activities.',
      features: ['Themed Decorations', 'Games and Activities', 'Cake and Catering'],
      price: 'OMR 30 / hour',
      pricePerPerson: 'OMR 2',
      image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60'
    }
  ];

  const handleSearch = () => {
    let results = services.filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (location) {
      results = results.filter(service => service.location.toLowerCase().includes(location.toLowerCase()));
    }

    if (price) {
      results = results.filter(service => {
        const servicePrice = parseInt(service.price.replace(/\D/g, ''));
        return servicePrice <= parseInt(price);
      });
    }

    if (rating) {
      results = results.filter(service => service.rating >= parseFloat(rating));
    }

    setSearchResults(results);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleServiceClick = (serviceType) => {
    const results = services.filter(service =>
      service.type.toLowerCase().includes(serviceType.toLowerCase())
    );
    setSearchResults(results);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const backgroundImageUrl = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80';

  const popularServices = [
    { name: 'Wedding Halls', icon: <FaMapMarkedAlt />, description: 'Find the perfect hall' },
    { name: 'Catering', icon: <FaUtensils />, description: 'Delicious food options' },
    { name: 'Photography', icon: <FaCameraRetro />, description: 'Capture every moment' },
    { name: 'Birthdays', icon: <FaMusic />, description: 'Celebrate special days' },
  ];

  const topProviders = services
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return (
    <div>
      <div className="new-booking-container" style={{ backgroundImage: `url(${backgroundImageUrl})` }}>
        <div className="overlay"></div>
        <div className="content-container">
          <div className="header-text">
            <h1>Your Perfect Event Starts Here</h1>
            <p>Discover amazing events and connect with top-rated service providers for your special occasions</p>
          </div>
          
          <div className="search-box">
            <div className="search-input">
              <FaSearch className="icon" />
              <input 
                type="text" 
                placeholder="Search events or services..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="search-input">
              <FaMapMarkerAlt className="icon" />
              <select value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="">Location</option>
                <option value="Muscat">Muscat</option>
                <option value="Salalah">Salalah</option>
                <option value="Sohar">Sohar</option>
                <option value="Nizwa">Nizwa</option>
              </select>
            </div>
            <div className="search-input">
              <FaMoneyBillAlt className="icon" />
              <select value={price} onChange={(e) => setPrice(e.target.value)}>
                <option value="">Max Price</option>
                <option value="50">OMR 50</option>
                <option value="150">OMR 150</option>
                <option value="300">OMR 300</option>
              </select>
            </div>
            <div className="search-input">
              <FaStar className="icon" />
              <select value={rating} onChange={(e) => setRating(e.target.value)}>
                <option value="">Rating</option>
                <option value="4.5">4.5+</option>
                <option value="4">4.0+</option>
                <option value="3">3.0+</option>
              </select>
            </div>
            <button className="search-button" onClick={handleSearch}>Search</button>
          </div>

          <div className="features-container">
            <div className="feature">
              <div className="feature-icon-wrapper">
                <FaCalendarCheck className="feature-icon" />
              </div>
              <h3>Share Your Moment</h3>
              <p>Let the world know about your special event</p>
            </div>
            <div className="feature">
              <div className="feature-icon-wrapper">
                  <FaUserFriends className="feature-icon" />
              </div>
              <h3>Find Providers</h3>
              <p>Connect with trusted event service professionals</p>
            </div>
            <div className="feature">
              <div className="feature-icon-wrapper">
                  <FaSearchLocation className="feature-icon" />
              </div>
              <h3>Book Instantly</h3>
              <p>Secure your spot with easy online booking</p>
            </div>
          </div>
        </div>
      </div>
      <div className="top-providers-container">
        <h2>Top Service Providers</h2>
        <div className="results-grid">
          {topProviders.map((provider, index) => (
            <div key={index} className="result-card" onClick={() => navigate(`/service/${provider.id}`)}>
              <div className="card-image-container">
                <img src={provider.image} alt={provider.name} className="result-image" />
                <div className="rating-badge">
                  <FaStar /> {provider.rating}
                </div>
              </div>
              <div className="result-details">
                <div className="service-tag">{provider.type}</div>
                <h3>{provider.name}</h3>
                <p className="reviews">{provider.reviews} reviews</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="popular-services-container">
        <h2>Popular Services</h2>
        <div className="services-grid">
          {popularServices.map((service, index) => (
            <div key={index} className="service-card" onClick={() => handleServiceClick(service.name)}>
              <div className="service-icon">{service.icon}</div>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="search-results-container" ref={resultsRef}>
          <h2>Search Results</h2>
          <div className="results-grid">
            {searchResults.map((result, index) => (
              <div key={index} className="result-card">
                <div className="card-image-container">
                  <img src={result.image} alt={result.name} className="result-image" />
                  <div className="rating-badge">
                    <FaStar /> {result.rating}
                  </div>
                </div>
                <div className="result-details">
                  <div className="service-tag">{result.type}</div>
                  <h3>{result.name}</h3>
                  <p className="reviews">{result.reviews} reviews</p>
                  <p className="description">{result.description}</p>
                  <ul className="features-list">
                    {result.features.map((feature, i) => (
                      <li key={i}><FaCheckCircle /> {feature}</li>
                    ))}
                  </ul>
                  <div className="card-footer">
                    <p className="price">{result.price}</p>
                    <button className="book-button" onClick={() => navigate(`/service/${result.id}`)}>Book</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewBooking;
