import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaStar, FaMapMarkerAlt, FaCalendarAlt, FaCamera, FaShareAlt, FaHeart, FaRegHeart, FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import axios from "axios";
import "./ServiceDetails.css";
import logo1 from '../../assets/logo1.png';

const ServiceDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

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
    if (!path || path === 'null' || path === 'undefined') {
      return logo1;
    }
    if (path.startsWith('http')) {
      return path;
    }
    return `/${path}`;
  };

  const ratingDistribution = useMemo(() => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      if (distribution[review.rating] !== undefined) {
        distribution[review.rating]++;
      }
    });
    return distribution;
  }, [reviews]);

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "lowest") return a.rating - b.rating;
      return 0;
    });
  }, [reviews, sortBy]);

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

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : t("N/A");

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: service.name,
        text: service.description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(t("linkCopied"));
    }
  };

  return (
    <div className="service-details-container animate-fade-in">
      <div className="service-details-content">
        <div className="top-actions">
          <button onClick={() => navigate(-1)} className="back-button-new">
            <FaChevronLeft /> {t("back")}
          </button>
          <div className="header-action-buttons">
            <button className="action-icon-btn" onClick={handleShare} title={t("share")}>
              <FaShareAlt />
            </button>
            <button className={`action-icon-btn ${isFavorited ? 'active' : ''}`} onClick={() => setIsFavorited(!isFavorited)} title={t("favorite")}>
              {isFavorited ? <FaHeart color="#e91e63" /> : <FaRegHeart />}
            </button>
          </div>
        </div>
        
        <div className="service-header">
          <div className="gallery-main-container">
            <img 
              src={service.images[selectedImageIndex]} 
              alt={service.name} 
              className="service-main-image" 
              onClick={() => setIsModalOpen(true)}
            />
            <div className="image-counter">
              {selectedImageIndex + 1} / {service.images.length}
            </div>
          </div>
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
              <span><FaStar color="#ffc107" /> {averageRating} ({t("reviewsCount", { count: reviews.length })})</span>
              <span><FaMapMarkerAlt /> {service.location}</span>
              <span><FaCalendarAlt /> {formatDate(service.createdAt)}</span>
            </div>

            <div className="service-overview-card">
              <p className="service-description">{service.description === "affan: iftar" ? t("iftarFeastDescription") : service.description}</p>
              
              <div className="service-policy">
                <h4 style={{ margin: '1rem 0 0.5rem 0', fontSize: '1rem' }}>{t('cancellationPolicy')}</h4>
                <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>{service.cancellationPolicy || t('noCancellationPolicy')}</p>
              </div>
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

        <div className="service-reviews section-padding">
          <div className="reviews-header-block">
            <h2>{t("customerReviews")} ({reviews.length})</h2>
            <div className="review-sort">
              <label>{t("sortBy")}:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">{t("newest")}</option>
                <option value="highest">{t("highestRated")}</option>
                <option value="lowest">{t("lowestRated")}</option>
              </select>
            </div>
          </div>

          <div className="rating-distribution-container">
            <div className="overall-rating-card">
              <span className="big-rating">{averageRating}</span>
              <div className="stars-row">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} color={i < Math.floor(averageRating) ? "#ffc107" : "#e4e5e9"} />
                ))}
              </div>
              <span className="total-reviews-count">{reviews.length} {t("reviews")}</span>
            </div>
            <div className="distribution-bars">
              {[5, 4, 3, 2, 1].map(star => (
                <div key={star} className="distribution-row">
                  <span className="star-label">{star} <FaStar size={12} /></span>
                  <div className="bar-bg">
                    <div 
                      className="bar-fill" 
                      style={{ width: `${reviews.length > 0 ? (ratingDistribution[star] / reviews.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="count-label">{ratingDistribution[star]}</span>
                </div>
              ))}
            </div>
          </div>

          {reviews.length > 0 ? (
            sortedReviews.map(review => (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  <img
                    src={getImageUrl(review.user.profilePicture)}
                    alt={review.user.username}
                    className="review-user-image"
                    onError={(e) => { 
                      if (e.target.src !== logo1) {
                        e.target.onerror = null; 
                        e.target.src = logo1; 
                      }
                    }}
                  />
                  <div className="review-info">
                    <p className="reviewer-name"><strong>{review.user.username}</strong></p>
                    <p className="review-date">{new Date(review.createdAt).toLocaleDateString()}</p>
                    <div className="review-stars">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} color={i < review.rating ? "#ffc107" : "#e4e5e9"} size={14} />
                      ))}
                    </div>
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

      {isModalOpen && (
        <div className="image-lightbox-modal" onClick={() => setIsModalOpen(false)}>
          <button className="close-modal" onClick={() => setIsModalOpen(false)}><FaTimes /></button>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-nav prev" 
              onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? service.images.length - 1 : prev - 1))}
              disabled={service.images.length <= 1}
            >
              <FaChevronLeft />
            </button>
            <img src={service.images[selectedImageIndex]} alt="Full view" className="modal-image" />
            <button 
              className="modal-nav next" 
              onClick={() => setSelectedImageIndex((prev) => (prev === service.images.length - 1 ? 0 : prev + 1))}
              disabled={service.images.length <= 1}
            >
              <FaChevronRight />
            </button>
            <div className="modal-counter">
              {selectedImageIndex + 1} / {service.images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetails;
