import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaStar, FaCamera } from 'react-icons/fa';
import './LeaveReview.css';

const LeaveReview = () => {
  const { t } = useTranslation();
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);

  const handleRating = (rate) => {
    setRating(rate);
  };

  const handleImageChange = (e) => {
    if (e.target.files.length > 4) {
      alert(t('max4Images'));
      return;
    }
    setImages([...e.target.files]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically submit the review to your backend
    console.log('Review submitted:', { bookingId, rating, comment, images });
    navigate('/booking-history');
  };

  return (
    <div className="leave-review-container">
      <button onClick={() => navigate(-1)} className="back-button">{t('backToBookingHistory')}</button>
      <div className="review-form-card">
        <h2>{t('leaveReviewTitle')}</h2>
        <p>{t('bookingId')}: {bookingId}</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('yourRating')}</label>
            <div className="star-rating">
              {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                  <FaStar
                    key={starValue}
                    className="star"
                    color={starValue <= rating ? '#ffc107' : '#e4e5e9'}
                    onClick={() => handleRating(starValue)}
                  />
                );
              })}
            </div>
          </div>
          <div className="form-group">
            <label>{t('yourComments')}</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('tellUsExperience')}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('addPhotos')}</label>
            <div className="image-upload-container">
              <FaCamera />
              <p>{t('dragDrop')}</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="image-upload-input"
              />
            </div>
            <div className="image-previews">
              {images.map((image, index) => (
                <img key={index} src={URL.createObjectURL(image)} alt={`preview ${index}`} className="image-preview" />
              ))}
            </div>
          </div>
          <button type="submit" className="submit-review-button">{t('submitReview')}</button>
        </form>
      </div>
    </div>
  );
};

export default LeaveReview;
