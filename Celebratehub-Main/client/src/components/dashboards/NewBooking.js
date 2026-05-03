import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaSearch, FaMapMarkerAlt, FaMoneyBillAlt, FaStar, FaCalendarCheck, FaUserFriends,
  FaSearchLocation, FaMapMarkedAlt, FaUtensils, FaCameraRetro, FaMusic, FaCheckCircle,
  FaTimes, FaHistory, FaTag
} from 'react-icons/fa';
import axios from 'axios';
import './NewBooking.css';
import defaultProfilePic from '../../assets/logo1.png';

const NewBooking = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [priceSort, setPriceSort] = useState('');
  const [ratingSort, setRatingSort] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [services, setServices] = useState([]);

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

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('/api/services');
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchServices();
  }, []);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const resultsRef = useRef(null);
  const searchInputRef = useRef(null);

  // Enhanced search functionality
  const generateSearchSuggestions = (term) => {
    if (!term.trim()) {
      setSearchSuggestions([]);
      return;
    }

    const suggestions = [];
    const lowerTerm = term.toLowerCase();

    // Add service names as suggestions
    services.forEach(service => {
      if (service.name && service.name.toLowerCase().includes(lowerTerm) && !suggestions.includes(service.name)) {
        suggestions.push(service.name);
      }
      if (service.type && service.type.toLowerCase().includes(lowerTerm) && !suggestions.includes(service.type)) {
        suggestions.push(service.type);
      }
    });

    // Add popular search terms
    const popularTerms = ['Wedding', 'Birthday', 'Catering', 'Photography', 'Event', 'Party'];
    popularTerms.forEach(term => {
      if (term.toLowerCase().includes(lowerTerm) && !suggestions.includes(term)) {
        suggestions.push(term);
      }
    });

    setSearchSuggestions(suggestions.slice(0, 5)); // Limit to 5 suggestions
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    generateSearchSuggestions(value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    handleSearch({ term: suggestion });
  };

  const handleSearchHistoryClick = (historyItem) => {
    setSearchTerm(historyItem.term);
    setLocation(historyItem.location);
    setPriceSort('');
    setRatingSort('');
    setShowSuggestions(false);
    handleSearch({ term: historyItem.term, location: historyItem.location });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchSuggestions([]);
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSearch = (searchParams) => {
    const termToSearch = searchParams && typeof searchParams.term !== 'undefined' ? searchParams.term : searchTerm;
    const locationToSearch = searchParams && typeof searchParams.location !== 'undefined' ? searchParams.location : location;
    const priceSortOrder = priceSort;
    const ratingSortOrder = ratingSort;

    if (!termToSearch.trim() && !locationToSearch && !priceSortOrder && !ratingSortOrder) {
      return;
    }

    setIsSearching(true);

    const searchQuery = {
      term: termToSearch,
      location: locationToSearch,
      timestamp: Date.now()
    };
    
    const newHistory = [searchQuery, ...searchHistory.filter(h => 
      !(h.term === termToSearch && h.location === locationToSearch)
    )].slice(0, 10);
    
    setSearchHistory(newHistory);

    setTimeout(() => {
      let results = services.filter(service =>
        (service.name && service.name.toLowerCase().includes(termToSearch.toLowerCase())) ||
        (service.type && service.type.toLowerCase().includes(termToSearch.toLowerCase())) ||
        (service.category && service.category.toLowerCase().includes(termToSearch.toLowerCase()))
      );

      if (locationToSearch) {
        results = results.filter(service => service.location.toLowerCase().includes(locationToSearch.toLowerCase()));
      }

      if (priceSortOrder) {
        results.sort((a, b) => {
          const priceA = a.pricePerHour || a.pricePerPerson || 0;
          const priceB = b.pricePerHour || b.pricePerPerson || 0;
          if (priceSortOrder === 'asc') {
            return priceA - priceB;
          } else { // desc
            return priceB - priceA;
          }
        });
      }

      if (ratingSortOrder) {
        results.sort((a, b) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          if (ratingSortOrder === 'asc') {
            return ratingA - ratingB;
          } else { // desc
            return ratingB - ratingA;
          }
        });
      }

      setSearchResults(results);
      setIsSearching(false);
      
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 300);
  };

  const handleServiceClick = (serviceType) => {
    setSearchTerm(serviceType);
    setLocation('');
    setPriceSort('');
    setRatingSort('');
    handleSearch({ term: serviceType, location: '' });
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
            <h1>{t('newBookingTitle')}</h1>
            <p>{t('newBookingSubtitle')}</p>
          </div>
          
          <div className="search-box">
            <div className="search-input search-input-main">
              <FaSearch className="icon" />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={handleSearchInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={handleClearSearch}>
                  <FaTimes />
                </button>
              )}
              {showSuggestions && (
                <div className="search-suggestions">
                  {searchSuggestions.length > 0 ? (
                    searchSuggestions.map((suggestion, index) => (
                      <div 
                        key={index}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <FaTag className="suggestion-icon" />
                        {suggestion}
                      </div>
                    ))
                  ) : (
                    <div className="no-suggestions">
                      No suggestions found
                    </div>
                  )}
                  {searchHistory.length > 0 && (
                    <div className="suggestions-divider"></div>
                  )}
                  {searchHistory.slice(0, 3).map((historyItem, index) => (
                    <div 
                      key={index}
                      className="suggestion-item history-item"
                      onClick={() => handleSearchHistoryClick(historyItem)}
                    >
                      <FaHistory className="suggestion-icon" />
                      <span className="history-term">{historyItem.term}</span>
                      {historyItem.location && (
                        <span className="history-location">
                          <FaMapMarkerAlt /> {historyItem.location}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="search-input">
              <FaMapMarkerAlt className="icon" />
              <select value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="">{t('locationLabel')}</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{t(loc)}</option>
                ))}
              </select>
            </div>
            <div className="search-input">
              <FaMoneyBillAlt className="icon" />
              <select value={priceSort} onChange={(e) => setPriceSort(e.target.value)}>
                <option value="">{t('sortByPriceLabel', 'Sort by Price')}</option>
                <option value="asc">{t('priceLowToHigh', 'Price: Low to High')}</option>
                <option value="desc">{t('priceHighToLow', 'Price: High to Low')}</option>
              </select>
            </div>
            <div className="search-input">
              <FaStar className="icon" />
              <select value={ratingSort} onChange={(e) => setRatingSort(e.target.value)}>
                <option value="">{t('sortByRatingLabel', 'Sort by Rating')}</option>
                <option value="desc">{t('ratingHighToLow', 'Rating: High to Low')}</option>
                <option value="asc">{t('ratingLowToHigh', 'Rating: Low to High')}</option>
              </select>
            </div>
            <button className="search-button" onClick={() => handleSearch()} disabled={isSearching}>
              {isSearching ? (
                <span className="searching-spinner">Searching...</span>
              ) : (
                t('searchButton')
              )}
            </button>
          </div>

          <div className="features-container">
            <div className="feature">
              <div className="feature-icon-wrapper">
                <FaCalendarCheck className="feature-icon" />
              </div>
              <h3>{t('shareMomentTitle')}</h3>
              <p>{t('shareMomentDesc')}</p>
            </div>
            <div className="feature">
              <div className="feature-icon-wrapper">
                  <FaUserFriends className="feature-icon" />
              </div>
              <h3>{t('findProvidersTitle')}</h3>
              <p>{t('findProvidersDesc')}</p>
            </div>
            <div className="feature">
              <div className="feature-icon-wrapper">
                  <FaSearchLocation className="feature-icon" />
              </div>
              <h3>{t('bookInstantlyTitle')}</h3>
              <p>{t('bookInstantlyDesc')}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="top-providers-container">
        <h2>{t('topProvidersTitle')}</h2>
        <div className="results-grid">
          {topProviders.map((provider, index) => (
            <div key={index} className="result-card" onClick={() => navigate(`/service/${provider._id}`)}>
              <div className="card-image-container">
                <img src={provider.images[provider.mainImageIndex]} alt={provider.name} className="result-image" />
                <div className="rating-badge">
                  <FaStar /> {provider.rating}
                </div>
              </div>
              <div className="result-details">
              <img 
                src={provider.providerId && provider.providerId.profilePicture ? provider.providerId.profilePicture : defaultProfilePic}
                alt={provider.providerId ? provider.providerId.username : 'Default'}
                className="provider-logo" 
              />
                <div className="service-tag">{provider.type}</div>
                <h3>{provider.name}</h3>
                <p className="reviews">{t('reviewsCount', { count: provider.reviews ? provider.reviews.length : 0 })}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="popular-services-container">
        <h2>{t('popularServicesTitle')}</h2>
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
          <h2>{t('searchResultsTitle')}</h2>
          <div className="results-grid">
          {searchResults.map((result, index) => (
            <div key={index} className="result-card">
              <div className="card-image-container">
                <img src={result.images[result.mainImageIndex]} alt={result.name} className="result-image" />
                <div className="rating-badge">
                    <FaStar /> {result.rating}
                  </div>
                </div>
                <div className="result-details">
                <img 
                  src={result.providerId && result.providerId.profilePicture ? result.providerId.profilePicture : defaultProfilePic}
                  alt={result.providerId ? result.providerId.username : 'Default'}
                  className="provider-logo" 
                />
                  <div className="service-tag">{result.type}</div>
                  <h3>{result.name}</h3>
                  {result.location && <p className="location"><FaMapMarkerAlt className="icon" /> {result.location}</p>}
                  <p className="reviews">{t('reviewsCount', { count: result.reviews ? result.reviews.length : 0 })}</p>
                  <p className="description">{result.description}</p>
                  <ul className="features-list">
                    {result.features.map((feature, i) => (
                      <li key={i}><FaCheckCircle /> {feature}</li>
                    ))}
                  </ul>
                  <div className="card-footer">
                    <p className="price">OMR {result.pricePerHour || result.pricePerPerson} / {result.pricePerHour ? 'hour' : 'person'}</p>
                    <button className="book-button" onClick={() => navigate(`/booking/${result._id}`)}>{t('bookButton')}</button>
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
