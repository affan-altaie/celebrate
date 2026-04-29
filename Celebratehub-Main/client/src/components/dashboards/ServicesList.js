import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ServicesList.css';
import { FaStar } from 'react-icons/fa';

const ServicesList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/services', {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        });
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="services-list-container">
      <h1 className="services-list-title">All Services</h1>
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading services...</p>
        </div>
      ) : services.length > 0 ? (
        <div className="results-grid">
          {services.map(service => (
            <div key={service._id} className="result-card" onClick={() => navigate(`/service/${service._id}`)}>
              <div className="card-image-container">
                <img src={service.images[service.mainImageIndex]} alt={service.name} className="result-image" />
                <div className="rating-badge">
                  <FaStar /> {service.rating}
                </div>
              </div>
              <div className="result-details">
                <div className="service-tag">{service.category}</div>
                <h3>{service.name}</h3>
                <p className="reviews">{service.reviews ? service.reviews.length : 0} reviews</p>
                 <div className="card-footer">
                    <p className="price">OMR {service.pricePerHour} / hour</p>
                    <button className="book-button" onClick={(e) => {e.stopPropagation(); navigate(`/service/${service._id}`)}}>
                      Book
                    </button>
                  </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-services-found">
          <h2>No services found.</h2>
          <p>We couldn't find any services. Please check back later.</p>
        </div>
      )}
    </div>
  );
};

export default ServicesList;
