import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ServicesList.css';

const ServicesList = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/services');
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="services-list-container">
      <h1>All Services</h1>
      <div className="services-grid">
        {services.map(service => (
          <Link to={`/service/${service._id}`} key={service._id} className="service-card">
            <img src={`http://localhost:5000${service.images[0]}`} alt={service.name} />
            <div className="service-card-content">
              <h2>{service.name}</h2>
              <p>{service.location}</p>
              <p>OMR {service.pricePerHour} / hour</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ServicesList;
