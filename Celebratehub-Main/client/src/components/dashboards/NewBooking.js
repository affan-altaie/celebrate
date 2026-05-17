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

  const isServiceAvailable = (availability) => {
    if (!availability || Object.keys(availability).length === 0) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Object.keys(availability).some(dateStr => {
      const date = new Date(dateStr);
      return date >= today && availability[dateStr].length > 0;
    });
  };

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const isCustomer = !user || user.role === "customer";

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
      if (service.category && service.category.toLowerCase().includes(lowerTerm) && !suggestions.includes(service.category)) {
        suggestions.push(service.category);
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
      const lowerTerm = termToSearch.toLowerCase();
      const hyphenatedTerm = lowerTerm.replace(/\s+/g, '-');

      let results = services.filter(service =>
        (service.name && service.name.toLowerCase().includes(lowerTerm)) ||
        (service.category && service.category.toLowerCase().includes(lowerTerm)) ||
        (service.category && service.category.toLowerCase().includes(hyphenatedTerm))
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

  const handleServiceClick = (categoryKey, displayName) => {
    setSearchTerm(displayName);
    setLocation('');
    setPriceSort('');
    setRatingSort('');
    handleSearch({ term: categoryKey, location: '' });
  };
const handleRemoveFromHistory = (itemToRemove) => {
    const newHistory = searchHistory.filter(item => item.timestamp !== itemToRemove.timestamp);
    setSearchHistory(newHistory);
  };
  const backgroundImageUrl = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80';

  const popularServices = [
    { key: 'wedding-halls', name: t('weddingHalls'), icon: <FaMapMarkedAlt />, description: t('findPerfectHall') },
    { key: 'catering', name: t('catering'), icon: <FaUtensils />, description: t('deliciousFoodOptions') },
    { key: 'photography', name: t('photography'), icon: <FaCameraRetro />, description: t('captureEveryMoment') },
    { key: 'birthdays', name: t('birthdays'), icon: <FaMusic />, description: t('celebrateSpecialDays') },
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
<button 
  className="remove-history-item" 
  onClick={(e) => {
    e.stopPropagation(); // Prevent search from triggering
    handleRemoveFromHistory(historyItem);
  }}
>
  <FaTimes />
</button>
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
          {topProviders.map((provider, index) => {
            const available = isServiceAvailable(provider.availability);
            return (
              <div key={index} className={`result-card ${!available ? 'unavailable' : ''} ${provider.isFeatured ? 'featured-card' : ''}`} onClick={() => navigate(`/service/${provider._id}`)}>
                <div className="card-image-container">
                  <img src={provider.images[provider.mainImageIndex]} alt={provider.name} className="result-image" />
                  {!available && isCustomer && <div className="unavailable-banner">{t('currentlyUnavailable')}</div>}
                  {provider.isFeatured && <div className="featured-badge"><FaStar /> {t('featured')}</div>}
                  <div className="rating-badge">
                    <FaStar /> {provider.rating > 0 ? provider.rating : t("N/A")}
                  </div>
                </div>
                <div className="result-details">
                <img 
                  src={provider.providerId && provider.providerId.profilePicture ? provider.providerId.profilePicture : defaultProfilePic}
                  alt={provider.providerId ? provider.providerId.username : 'Default'}
                  className="provider-logo" 
                  onError={(e) => {
                    if (e.target.src !== defaultProfilePic) {
                      e.target.onerror = null;
                      e.target.src = defaultProfilePic;
                    }
                  }}
                />
                  <div className="service-tag">{t(provider.category === 'wedding-halls' ? 'weddingHalls' : provider.category)}</div>
                  <h3>{provider.name}</h3>
                  <p className="reviews">{t('reviewsCount', { count: provider.reviewsCount || 0 })}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="popular-services-container">
        <h2>{t('popularServicesTitle')}</h2>
        <div className="services-grid">
          {popularServices.map((service, index) => (
            <div key={index} className="service-card" onClick={() => handleServiceClick(service.key, service.name)}>
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
          {searchResults.map((result, index) => {
            const available = isServiceAvailable(result.availability);
            return (
              <div key={index} className={`result-card ${!available ? 'unavailable' : ''} ${result.isFeatured ? 'featured-card' : ''}`}>
                <div className="card-image-container" onClick={() => navigate(`/service/${result._id}`)} style={{ cursor: 'pointer' }}>
                  <img src={result.images[result.mainImageIndex]} alt={result.name} className="result-image" />
                  {!available && isCustomer && <div className="unavailable-banner">{t('currentlyUnavailable')}</div>}
                  {result.isFeatured && <div className="featured-badge" style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#ffc107', color: '#000', padding: '4px 10px', borderRadius: '4px', fontWeight: '700', fontSize: '0.75rem', zIndex: 1, display: 'flex', alignItems: 'center', gap: '5px' }}><FaStar /> {t('featured')}</div>}
                  <div className="rating-badge">
                      <FaStar /> {result.rating > 0 ? result.rating : t("N/A")}
                    </div>
                  </div>
                  <div className="result-details">
                  <img 
                    src={result.providerId && result.providerId.profilePicture ? result.providerId.profilePicture : defaultProfilePic}
                    alt={result.providerId ? result.providerId.username : 'Default'}
                    className="provider-logo" 
                    onError={(e) => {
                      if (e.target.src !== defaultProfilePic) {
                        e.target.onerror = null;
                        e.target.src = defaultProfilePic;
                      }
                    }}
                  />
                    <div className="service-tag">{t(result.category === 'wedding-halls' ? 'weddingHalls' : result.category)}</div>
                    <h3>{result.name}</h3>
                    {result.location && <p className="location"><FaMapMarkerAlt className="icon" /> {result.location}</p>}
                    <p className="reviews">{t('reviewsCount', { count: result.reviewsCount || 0 })}</p>
                    <p className="description">{result.description}</p>
                    <ul className="features-list">
                      {result.features.map((feature, i) => (
                        <li key={i}><FaCheckCircle /> {feature}</li>
                      ))}
                    </ul>
                    <div className="card-footer">
                      <p className="price">OMR {result.pricePerHour || result.pricePerPerson} / {result.pricePerHour ? 'hour' : 'person'}</p>
                      <button 
                        className={`book-button ${!available ? 'disabled' : ''}`} 
                        onClick={() => available && navigate(`/booking/${result._id}`)}
                        disabled={!available}
                      >
                        {t('bookButton')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewBooking;
