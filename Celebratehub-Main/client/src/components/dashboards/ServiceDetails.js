import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaStar, FaMapMarkerAlt, FaCalendarAlt, FaCamera } from "react-icons/fa";
import axios from "axios";
import "./ServiceDetails.css";
import defaultProfilePic from '../../assets/images/default-profile.png';

const ServiceDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await axios.get(`/api/services/${id}`);
        setService(response.data);
        setSelectedImageIndex(response.data.mainImageIndex || 0);
      } catch (error) {
        console.error("Error fetching service:", error);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await axios.get(`/api/reviews/service/${id}`);
        setReviews(response.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchService();
    fetchReviews();
  }, [id]);

  const getImageUrl = (path) => {
    if (!path) {
      return defaultProfilePic;
    }
    if (path.startsWith('http')) {
      return path;
    }
    return `/${path}`;
  };

  if (!service) {
    return <div className="loading">{t("loading")}</div>;
  }

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const isProvider = user?.role === "provider";
  const isAdmin = user?.role === "admin";
  const isCustomer = !user || user.role === "customer";

  const formatDate = (dateString) => {
    if (!dateString) {
      return t("N/A");
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return t("N/A");
    }
    return date.toLocaleDateString();
  };

  const serviceName = service.name.split(": ")[1] || service.name;
  const providerName = service.providerId ? service.providerId.username : "";

  const isServiceAvailable = (availability) => {
    if (!availability || Object.keys(availability).length === 0) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Object.keys(availability).some(dateStr => {
      const date = new Date(dateStr);
      return date >= today && availability[dateStr].length > 0;
    });
  };

  const available = isServiceAvailable(service.availability);

  return (
    <div className="service-details-container">
      <div className="service-details-content">
        <button onClick={() => navigate(-1)} className="back-button">{t("back")}</button>
        
        <div className="service-header">
          <img src={service.images[selectedImageIndex]} alt={service.name} className="service-main-image" />
          <div className="service-header-info">
            <h1>
              {service.providerId ? (
                <Link to={`/provider/${service.providerId._id}`} className="provider-link">
                  {providerName}:
                </Link>
              ) : (
                `${providerName}:`
              )}
              {` ${serviceName}`}
            </h1>
            <div className="service-meta">
              <span><FaStar /> {service.rating || t("N/A")} ({t("reviewsCount", { count: reviews.length })})</span>
              <span><FaMapMarkerAlt /> <strong>{t("locationLabel")}:</strong> {service.location}</span>
              <span><FaCalendarAlt /> <strong>{t("dateOfPublish")}:</strong> {formatDate(service.createdAt)}</span>
            </div>
            <p className="service-description">{service.description === "affan: iftar" ? t("iftarFeastDescription") : service.description}</p>
            
            <div className="service-policy">
              <h3>{t('cancellationPolicy')}</h3>
              <p>{service.cancellationPolicy || t('noCancellationPolicy')}</p>
            </div>

            <div className="service-price-book">
              <div className="price-info">
                {service.pricePerHour && <span className="price-display">OMR {service.pricePerHour} / hour</span>}
                {service.pricePerPerson && <span className="price-display">OMR {service.pricePerPerson} / {t("person")}</span>}
              </div>
              {!isProvider && !isAdmin && (
                <button 
                  className={`book-now-button ${!available ? 'disabled' : ''}`} 
                  onClick={() => available && navigate(`/booking/${service._id}`)}
                  disabled={!available}
                >
                  {t("bookNow")}
                </button>
              )}
            </div>
            {!isProvider && !isAdmin && (
              <button onClick={() => navigate(`/report-service/${service._id}`)} className="report-btn">{t("reportService")}</button>
            )}
          </div>
        </div>

        {!available && isCustomer && (
          <div className="unavailability-banner">
            {t("noAvailableDates")}
          </div>
        )}

        <div className="service-gallery">
          <h2><FaCamera /> {t("photoGallery")}</h2>
          <div className="photo-grid">
            {service.images.map((photo, index) => (
              <img 
                key={index} 
                src={photo} 
                alt={`${service.name} ${index + 1}`} 
                className={`gallery-photo ${index === selectedImageIndex ? "active" : ""}`}
                onClick={() => setSelectedImageIndex(index)}
                style={{ cursor: "pointer", border: index === selectedImageIndex ? "2px solid #007bff" : "none" }}
              />
            ))}
          </div>
        </div>

        <div className="service-reviews">
          <h2>{t("customerReviews")} ({reviews.length})</h2>
          {reviews.length > 0 ? (
            reviews.map(review => (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  <img
                    src={getImageUrl(review.user.profilePicture)}
                    alt={review.user.username}
                    className="review-user-image"
                    onError={(e) => { e.target.onerror = null; e.target.src = defaultProfilePic; }}
                  />
                  <div className="review-info">
                    <p><strong>{review.user.username}</strong> - {new Date(review.createdAt).toLocaleDateString()}</p>
                    <p><FaStar /> {review.rating}</p>
                  </div>
                </div>
                <p className="review-comment">{review.comment}</p>
                <div className="review-photos">
                  {review.images.map((image, index) => (
                    <img key={index} src={image} alt={`Review ${index + 1}`} className="review-photo" />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p>{t("noReviewsYet")}</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default ServiceDetails;
