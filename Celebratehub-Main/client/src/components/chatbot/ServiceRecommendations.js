import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ServiceRecommendations.css';
import logo1 from '../../assets/logo1.png'; // Fallback image

const ServiceRecommendations = (props) => {
  const navigate = useNavigate();
  // recommendations are passed via payload from createChatBotMessage
  const recommendations = props.payload || [];

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const handleImageError = (e) => {
    e.target.src = logo1;
  };

  return (
    <div className="service-recommendations-container">
      {recommendations.map((service) => {
        // Clean name (remove provider prefix)
        const displayName = service.name.includes(': ') ? service.name.split(': ')[1] : service.name;
        
        // Robust image selection
        let displayImage = logo1;
        if (service.images && service.images.length > 0) {
          const mainIndex = service.mainImageIndex || 0;
          displayImage = service.images[mainIndex] || service.images[0] || logo1;
        }

        return (
          <button 
            key={service._id} 
            className="service-recommendation-item"
            onClick={() => navigate(`/service/${service._id}`)}
          >
            <div className="service-image-container">
              <img 
                src={displayImage} 
                alt={displayName} 
                className="service-recommendation-image"
                onError={handleImageError}
              />
            </div>
            <div className="service-info">
              <span className="service-name">{displayName}</span>
              <span className="service-category">{service.category}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ServiceRecommendations;
