import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import { FaCamera, FaRegStar, FaStar, FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Dashboard.css';
import './AddService.css';

const ServicePreview = ({ service, mainImageIndex }) => {
  const { t } = useTranslation();
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
      <div className="star-rating">
        {[...Array(fullStars)].map((_, i) => <FaStar key={`full-${i}`} />)}
        {halfStar && <FaStar key="half" style={{ clipPath: 'inset(0 50% 0 0)' }} />}
        {[...Array(emptyStars)].map((_, i) => <FaRegStar key={`empty-${i}`} />)}
      </div>
    );
  };

  const getImageUrl = (image) => {
    if (image instanceof File) {
      return URL.createObjectURL(image);
    }
    return image;
  };

  return (
    <div className="service-preview-card">
      <div className="service-image-container">
        {service.images && service.images.length > 0 ? (
          <img src={getImageUrl(service.images[mainImageIndex])} alt="Service Preview" className="service-main-image" />
        ) : (
          <div className="image-placeholder">
            <FaCamera />
            <p>{t('imagePreview')}</p>
          </div>
        )}
      </div>
      <div className="service-details">
        <h2>{service.name || t('serviceNameExample')}</h2>
        <div className="service-rating">
          {renderStars(service.rating || 4.8)}
          <span>{service.rating || 4.8} ({service.reviews || 0} reviews)</span>
        </div>
        <div className="service-location">
          <FaMapMarkerAlt />
          <span>{service.location || 'Salalah, Oman'}</span>
        </div>
        <div className="service-pricing">
          {service.pricePerHour && <p>OMR {service.pricePerHour} / hour</p>}
          {service.pricePerPerson && <p>OMR {service.pricePerPerson} / person</p>}
        </div>
        <p className="service-description">
          {service.description || 'Service description...'}
        </p>
        <div className="service-features">
          <h4>{t('features')}</h4>
          <ul>
            {(typeof service.features === 'string' ? service.features : (service.features || []).join(', ')).split(',').map((feature, index) => (
              feature.trim() && <li key={index}>✓ {feature.trim()}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const EditListing = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    pricePerHour: '',
    pricePerPerson: '',
    location: '',
    description: '',
    features: '',
    images: [],
    availability: {},
    cancellationPolicy: '',
  });
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [imageError, setImageError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedAvailabilityDates, setSelectedAvailabilityDates] = useState([]);
  const [timeInput, setTimeInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [providerName, setProviderName] = useState('');
  const [serviceName, setServiceName] = useState('');

  const locations = [
    "Adam",
    "Al Amerat",
    "Al Awabi",
    "Al Buraimi",
    "Al Hamra",
    "Al Jazir",
    "Al Jabal Al Akhdar",
    "Al Kamil Wal Wafi",
    "Al Khaburah",
    "Al Mudaybi",
    "Al Musannah",
    "Al Qabil",
    "As Sunaynah",
    "As Suwaiq",
    "Bahla",
    "Barka",
    "Bawshar",
    "Bidbid",
    "Bidiyah",
    "Bukha",
    "Dhalkut",
    "Dhank",
    "Dibba Al-Baya",
    "Dima Wa Al Taiyyin",
    "Duqm",
    "Haima",
    "Ibra",
    "Ibri",
    "Izki",
    "Jaalan Bani Bu Ali",
    "Jaalan Bani Bu Hassan",
    "Khasab",
    "Liwa",
    "Madha",
    "Mahdah",
    "Mahout",
    "Manah",
    "Masirah",
    "Mirbat",
    "Muqshin",
    "Muttrah",
    "Muscat",
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
    const fetchService = async () => {
      try {
        const response = await api.get(`/services/${id}?all=true`);
        const data = response.data;
        if (!data) {
           toast.error('Service not found.');
           navigate('/manage-listings');
           return;
        }
        const nameParts = (data.name || '').split(': ');
        if (nameParts.length > 1) {
          setProviderName(nameParts[0]);
          setServiceName(nameParts.slice(1).join(': '));
        } else {
          setServiceName(data.name || '');
          const userString = localStorage.getItem('user');
          if (userString) {
            const user = JSON.parse(userString);
            if (user && user.username) {
              setProviderName(user.username);
            }
          }
        }

        setFormData({
          ...data,
          features: Array.isArray(data.features) ? data.features.join(', ') : (data.features || ''),
          images: data.images || [],
          availability: data.availability || {},
          cancellationPolicy: data.cancellationPolicy || '',
        });
        setMainImageIndex(data.mainImageIndex || 0);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch service:', error);
        toast.error('Failed to load service data.');
        setLoading(false);
      }
    };
    fetchService();
  }, [id, navigate]);

  useEffect(() => {
    setFormData(prev => ({...prev, name: providerName ? `${providerName}: ${serviceName}` : serviceName}));
  }, [serviceName, providerName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') {
      setServiceName(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };


  const handleFiles = (files) => {
    setImageError('');
    const newImages = [...formData.images];
    
    if (newImages.length + files.length > 8) {
      const error = t('max8Images', 'You can upload a maximum of 8 images.');
      setImageError(error);
      toast.error(error);
      return;
    }

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        const error = t('fileTooLarge', `File ${file.name} is too large. Maximum size is 5MB.`);
        setImageError(error);
        toast.error(error);
        continue;
      }
      if (!file.type.startsWith('image/')) {
        const error = t('invalidImageType', `File ${file.name} is not a valid image type.`);
        setImageError(error);
        toast.error(error);
        continue;
      }
      newImages.push(file);
    }

    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData(prev => ({ ...prev, images: newImages }));

    if (index === mainImageIndex) {
      setMainImageIndex(0);
    } else if (index < mainImageIndex) {
      setMainImageIndex(mainImageIndex - 1);
    }
  };

  const setMainImage = (index) => {
    setMainImageIndex(index);
  };

  const handleDateClick = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date >= today) {
      const dateStr = date.toDateString();
      setSelectedAvailabilityDates(prev => {
        const exists = prev.find(d => d.toDateString() === dateStr);
        if (exists) {
          return prev.filter(d => d.toDateString() !== dateStr);
        } else {
          return [...prev, date];
        }
      });
      setTimeInput('');
    }
  };

  const selectWeekdays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekdays = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      // Sunday (0) to Thursday (4)
      if (date >= today && dayOfWeek >= 0 && dayOfWeek <= 4) {
        weekdays.push(date);
      }
    }
    setSelectedAvailabilityDates(weekdays);
  };

  const selectWeekends = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekends = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      // Thursday (4) to Saturday (6)
      if (date >= today && dayOfWeek >= 4 && dayOfWeek <= 6) {
        weekends.push(date);
      }
    }
    setSelectedAvailabilityDates(weekends);
  };

  const clearSelection = () => {
    setSelectedAvailabilityDates([]);
  };

  const standardTimeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  const toggleTimeSlot = (time) => {
    if (selectedAvailabilityDates.length === 0) return;

    const newAvailability = { ...formData.availability };
    
    const allHaveIt = selectedAvailabilityDates.every(date => {
      const dateStr = date.toISOString().split('T')[0];
      return newAvailability[dateStr]?.includes(time);
    });

    selectedAvailabilityDates.forEach(date => {
      const dateStr = date.toISOString().split('T')[0];
      if (!newAvailability[dateStr]) {
        newAvailability[dateStr] = [];
      }

      if (allHaveIt) {
        newAvailability[dateStr] = newAvailability[dateStr].filter(t => t !== time);
        if (newAvailability[dateStr].length === 0) delete newAvailability[dateStr];
      } else {
        if (!newAvailability[dateStr].includes(time)) {
          newAvailability[dateStr].push(time);
          newAvailability[dateStr].sort();
        }
      }
    });

    setFormData(prev => ({ ...prev, availability: newAvailability }));
  };

  const clearAllTimesForSelected = () => {
    if (selectedAvailabilityDates.length === 0) return;
    const newAvailability = { ...formData.availability };
    selectedAvailabilityDates.forEach(date => {
      const dateStr = date.toISOString().split('T')[0];
      delete newAvailability[dateStr];
    });
    setFormData(prev => ({ ...prev, availability: newAvailability }));
    toast.info(t('timesClearedForSelected', { count: selectedAvailabilityDates.length }));
  };

  const addTimeSlot = () => {
    if (selectedAvailabilityDates.length > 0 && timeInput) {
      const newAvailability = { ...formData.availability };
      
      selectedAvailabilityDates.forEach(date => {
        const dateStr = date.toISOString().split('T')[0];
        if (!newAvailability[dateStr]) {
          newAvailability[dateStr] = [];
        }
        if (!newAvailability[dateStr].includes(timeInput)) {
          newAvailability[dateStr].push(timeInput);
          newAvailability[dateStr].sort();
        }
      });
      
      setFormData(prev => ({ ...prev, availability: newAvailability }));
      setTimeInput('');
      toast.success(t('timeSlotAddedToSelected', { count: selectedAvailabilityDates.length }));
    }
  };

  const removeTimeSlot = (dateStr, time) => {
    const newAvailability = { ...formData.availability };
    if (newAvailability[dateStr]) {
      newAvailability[dateStr] = newAvailability[dateStr].filter(t => t !== time);
      if (newAvailability[dateStr].length === 0) {
        delete newAvailability[dateStr];
      }
      setFormData(prev => ({ ...prev, availability: newAvailability }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pricePerHour && !formData.pricePerPerson) {
        toast.error(t('priceRequiredError', 'Please provide at least one pricing option (per hour or per person).'));
        return;
    }
    if (formData.images.length < 2) {
      toast.error(t('min2Images', 'You must upload at least 2 images.'));
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('pricePerHour', formData.pricePerHour);
    data.append('pricePerPerson', formData.pricePerPerson);
    data.append('location', formData.location);
    data.append('description', formData.description);
    data.append('features', formData.features);
    data.append('cancellationPolicy', formData.cancellationPolicy);
    data.append('availability', JSON.stringify(formData.availability));
    data.append('mainImageIndex', mainImageIndex);

    const existingImages = [];
    formData.images.forEach(image => {
      if (typeof image === 'string') {
        existingImages.push(image);
      } else if (image instanceof File) {
        data.append('images', image);
      }
    });
    data.append('existingImages', JSON.stringify(existingImages));

    try {
      await api.put(`/services/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Listing updated successfully!');
      navigate('/manage-listings');
    } catch (error) {
      console.error('Error updating listing:', error);
      toast.error('Failed to update listing.');
    }
  };

  const renderAvailabilityCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const dates = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
        dates.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        const isSelected = selectedAvailabilityDates.some(d => d.toDateString() === date.toDateString());
        const hasAvailability = formData.availability[dateStr] && formData.availability[dateStr].length > 0;
        const isPast = date < today;

        dates.push(
            <div
                key={day}
                className={`calendar-day ${hasAvailability ? 'available' : ''} ${isSelected ? 'selected' : ''} ${isPast ? 'disabled' : ''}`}
                onClick={() => !isPast && handleDateClick(date)}
            >
                {day}
            </div>
        );
    }
    
    return (
        <div className="availability-calendar">
            <div className="calendar-navigation">
                <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} aria-label="Previous Month">
                    <FaChevronLeft />
                </button>
                <h3>{currentMonth.toLocaleString(t('locale'), { month: 'long', year: 'numeric' })}</h3>
                <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} aria-label="Next Month">
                    <FaChevronRight />
                </button>
            </div>
            <div className="quick-select-buttons">
                <button type="button" onClick={selectWeekdays}>{t('weekdays')}</button>
                <button type="button" onClick={selectWeekends}>{t('weekends')}</button>
                <button type="button" onClick={clearSelection}>{t('clear')}</button>
            </div>
            <div className="calendar-grid">
                <div className="calendar-header">{t('sun')}</div>
                <div className="calendar-header">{t('mon')}</div>
                <div className="calendar-header">{t('tue')}</div>
                <div className="calendar-header">{t('wed')}</div>
                <div className="calendar-header">{t('thu')}</div>
                <div className="calendar-header">{t('fri')}</div>
                <div className="calendar-header">{t('sat')}</div>
                {dates}
            </div>
        </div>
    );
  };
  
  const renderAvailabilityManager = () => {
    const isSingleSelection = selectedAvailabilityDates.length === 1;
    const selectedDateStr = isSingleSelection ? selectedAvailabilityDates[0].toISOString().split('T')[0] : null;
    
    const getSlotStatus = (time) => {
      const presentIn = selectedAvailabilityDates.filter(date => {
        const dateStr = date.toISOString().split('T')[0];
        return formData.availability[dateStr]?.includes(time);
      });
      if (presentIn.length === 0) return 'none';
      if (presentIn.length === selectedAvailabilityDates.length) return 'all';
      return 'some';
    };

    return (
        <div className="availability-manager">
            {renderAvailabilityCalendar()}
            {selectedAvailabilityDates.length > 0 && (
                <div className="time-slots-manager">
                    <div className="manager-header">
                        <h4>
                            {isSingleSelection 
                                ? t('availableTimesFor', { date: selectedDateStr }) 
                                : t('addingTimesForDates', { count: selectedAvailabilityDates.length })}
                        </h4>
                        {!isSingleSelection && (
                            <button type="button" className="clear-times-btn" onClick={clearAllTimesForSelected}>
                                {t('clearAllTimes')}
                            </button>
                        )}
                    </div>
                    
                    <div className="selection-summary-container">
                        <p className="selection-summary">
                            {selectedAvailabilityDates.map(d => d.getDate()).sort((a,b) => a-b).join(', ')} {currentMonth.toLocaleString('default', { month: 'short' })}
                        </p>
                    </div>

                    <div className="time-slots-grid">
                        {standardTimeSlots.map(time => {
                            const status = getSlotStatus(time);
                            return (
                                <button 
                                    key={time} 
                                    type="button" 
                                    className={`time-grid-slot ${status}`}
                                    onClick={() => toggleTimeSlot(time)}
                                >
                                    {time}
                                </button>
                            );
                        })}
                    </div>

                    <div className="custom-time-add">
                        <label>{t('addCustomTime')}:</label>
                        <div className="add-time-slot">
                            <input
                                type="time"
                                value={timeInput}
                                onChange={(e) => setTimeInput(e.target.value)}
                            />
                            <button type="button" onClick={addTimeSlot}>{t('addTime')}</button>
                        </div>
                    </div>

                    {isSingleSelection && (
                        <div className="current-slots-summary">
                            <h5>{t('currentSlots')}:</h5>
                            <div className="time-slots-list">
                                {formData.availability[selectedDateStr] && formData.availability[selectedDateStr].length > 0 ? (
                                    formData.availability[selectedDateStr].map(time => (
                                        <div key={time} className="time-slot-chip">
                                            {time}
                                            <button type="button" onClick={() => removeTimeSlot(selectedDateStr, time)}>&times;</button>
                                        </div>
                                    ))
                                ) : (
                                    <span className="no-slots-msg">{t('noSlotsSet')}</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
  }

  if (loading) return <div className="dashboard-container">{t('loading')}</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>{t('editListing')}</h1>
        <button onClick={() => navigate('/manage-listings')} className="action-btn">{t('cancel')}</button>
      </header>
      <main className="add-service-layout">
        <div className="service-preview-column">
            <ServicePreview service={formData} mainImageIndex={mainImageIndex} />
        </div>
        <div className="add-service-form-column">
            <form onSubmit={handleSubmit} className="add-service-form">
              <div className="form-group">
                  <label htmlFor="name">{t('serviceNameLabel')}</label>
                  <input id="name" type="text" name="name" value={serviceName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="category">{t('categoryLabel')}</label>
                <select id="category" name="category" value={formData.category} onChange={handleChange} required>
                    <option value="">{t('selectCategory')}</option>
                    <option value="wedding-halls">{t('weddingHalls')}</option>
                    <option value="catering">{t('catering')}</option>
                    <option value="photography">{t('photography')}</option>
                    <option value="birthdays">{t('birthdays')}</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="location">{t('locationLabel')}</label>
                <select id="location" name="location" value={formData.location} onChange={handleChange} required>
                    <option value="">{t('selectLocation')}</option>
                    {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>
                <div className="form-group">
                    <label htmlFor="pricePerHour">{t('pricePerHour')}</label>
                    <input id="pricePerHour" type="text" name="pricePerHour" value={formData.pricePerHour} onChange={handleChange} placeholder="OMR 20 / hour" />
                </div>
                <div className="form-group">
                    <label htmlFor="pricePerPerson">{t('pricePerPerson')}</label>
                    <input id="pricePerPerson" type="text" name="pricePerPerson" value={formData.pricePerPerson} onChange={handleChange} placeholder="OMR 2 / person" />
                </div>
              <div className="form-group">
                  <label htmlFor="description">{t('descriptionLabel')}</label>
                  <textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
              </div>
              <div className="form-group">
                  <label htmlFor="features">{t('featuresLabel')}</label>
                  <input id="features" type="text" name="features" value={formData.features} onChange={handleChange} />
              </div>
              <div className="form-group">
                  <label htmlFor="cancellationPolicy">{t('cancellationPolicy')}</label>
                  <textarea 
                      id="cancellationPolicy" 
                      name="cancellationPolicy" 
                      value={formData.cancellationPolicy} 
                      onChange={handleChange} 
                      placeholder={t('cancellationPolicyPlaceholder')} 
                  />
              </div>
              <div className="form-group">
                <label htmlFor="image-upload-input">{t('serviceImage', 'Service Images')}</label>
                 <div 
                  className={`image-upload-container ${isDragging ? 'drag-over' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => document.getElementById('image-upload-input').click()}
                 >
                  <input
                    type="file"
                    id="image-upload-input"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="image-upload-input"
                  />
                  <FaCamera />
                  <p>{t('dragDrop')}</p>
                   <p className="upload-guidelines">{t('imageUploadGuidelines', 'Min 2, Max 8 images. Max 5MB each.')}</p>
                </div>
                {imageError && <p className="error-message">{imageError}</p>}
                <div className="image-previews">
                  {formData.images.map((image, index) => (
                    <div 
                        key={index} 
                        className={`image-preview-container ${index === mainImageIndex ? 'main' : ''}`}
                        onClick={() => setMainImage(index)}
                    >
                      <img 
                        src={image instanceof File ? URL.createObjectURL(image) : image} 
                        alt={`preview ${index}`} 
                        className="image-preview" 
                      />
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); removeImage(index); }} 
                        className="remove-image-btn"
                      >
                        &times;
                      </button>
                      {index === mainImageIndex && <div className="main-image-label">{t('main')}</div>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>{t('availability')}</label>
                {renderAvailabilityManager()}
              </div>
              <button type="submit" className="action-btn">{t('saveChanges')}</button>
            </form>
        </div>
      </main>
    </div>
  );
};

export default EditListing;
