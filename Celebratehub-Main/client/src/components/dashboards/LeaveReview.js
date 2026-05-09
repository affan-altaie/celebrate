import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaStar, FaCamera } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './LeaveReview.css';
import api from '../../api';

const LeaveReview = () => {
  const { t } = useTranslation();
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleRating = (rate) => {
    setRating(rate);
  };

  const handleFiles = (files) => {
    const fileList = Array.from(files);
    if (fileList.length + images.length > 4) {
      alert(t('max4Images'));
      return;
    }
    setImages(prevImages => [...prevImages, ...fileList]);
  };

  const handleImageChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('rating', rating);
    formData.append('comment', comment);
    for (let i = 0; i < images.length; i++) {
      formData.append('images', images[i]);
    }

    try {
      await api.post(`/reviews/${serviceId}`, formData);
      toast.success(t('reviewSubmitted'));
      setTimeout(() => navigate('/booking-history'), 2000); // Delay navigation
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(t('errorSubmittingReview'));
    }
  };

  return (
    <div className="leave-review-container">
      <button onClick={() => navigate(-1)} className="back-button">{t('backToBookingHistory')}</button>
      <div className="review-form-card">
        <h2>{t('leaveReviewTitle')}</h2>
        <p>{t('serviceId')}: {serviceId}</p>
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
            <div
              className={`image-upload-container ${isDragging ? 'drag-over' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current.click()}
            >
              <FaCamera />
              <p>{t('dragDrop')}</p>
              <input
                ref={fileInputRef}
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
