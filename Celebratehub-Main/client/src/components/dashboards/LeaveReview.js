import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FaStar, FaCamera, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './LeaveReview.css';

const LeaveReview = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [booking, setBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id || user?._id;

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await axios.get(`/api/bookings/${bookingId}`);
        setBooking(response.data);
        if (response.data.isReviewed) {
          toast.info(t('bookingAlreadyReviewed') || 'This booking has already been reviewed.');
          navigate('/booking-history');
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        toast.error(t('errorFetchingBooking') || 'Error fetching booking details.');
      }
    };

    fetchBooking();
  }, [bookingId, navigate, t]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 4) {
      toast.error(t('max4Images'));
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error(t('pleaseSelectRating') || 'Please select a rating.');
      return;
    }
    if (!comment.trim()) {
      toast.error(t('pleaseEnterComment') || 'Please enter a comment.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('bookingId', bookingId);
    formData.append('serviceId', booking.serviceId);
    formData.append('userId', userId);
    formData.append('rating', rating);
    formData.append('comment', comment);
    images.forEach(image => {
      formData.append('images', image);
    });

    try {
      await axios.post('/api/reviews', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success(t('reviewSubmitted'));
      navigate('/booking-history');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(t('errorSubmittingReview'));
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return <div className="loading">{t('loading')}</div>;

  return (
    <div className="leave-review-container">
      <button onClick={() => navigate('/booking-history')} className="back-button">
        {t('backToBookingHistory')}
      </button>

      <div className="review-form-card">
        <h2>{t('leaveReviewTitle')}</h2>
        <p><strong>{t('serviceLabel')}:</strong> {booking.serviceName}</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('yourRating')}</label>
            <div className="star-rating">
              {[...Array(5)].map((star, index) => {
                const ratingValue = index + 1;
                return (
                  <label key={index}>
                    <input
                      type="radio"
                      name="rating"
                      value={ratingValue}
                      onClick={() => setRating(ratingValue)}
                      style={{ display: 'none' }}
                    />
                    <FaStar
                      className="star"
                      color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                      size={30}
                      onMouseEnter={() => setHover(ratingValue)}
                      onMouseLeave={() => setHover(0)}
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="comment">{t('yourComments')}</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('tellUsExperience')}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('addPhotos')}</label>
            <div 
              className="image-upload-container"
              onClick={() => document.getElementById('review-image-input').click()}
            >
              <input
                type="file"
                id="review-image-input"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="image-upload-input"
              />
              <FaCamera size={30} />
              <p>{t('dragDrop')}</p>
            </div>
            <div className="image-previews">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="image-preview-item">
                  <img src={preview} alt={`preview ${index}`} className="image-preview" />
                  <button type="button" onClick={() => removeImage(index)} className="remove-image-btn">
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="submit-review-button" disabled={loading}>
            {loading ? t('loading') : t('submitReview')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LeaveReview;
