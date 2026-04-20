import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FaCamera, FaRegStar, FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Dashboard.css';
import './AddService.css';

const ImagePreviewer = ({ file, alt, className }) => {
    const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
        if (file) {
            const url = URL.createObjectURL(file);
            setImageUrl(url);

            return () => {
                URL.revokeObjectURL(url);
            };
        }
    }, [file]);

    if (!imageUrl) {
        return null;
    }

    return <img src={imageUrl} alt={alt} className={className} />;
};

const ServicePreview = ({ service, mainImageIndex }) => {
  const { t } = useTranslation();
  const [imageURL, setImageURL] = useState(null);

  useEffect(() => {
    let url;
    if (service.images && service.images.length > mainImageIndex) {
      url = URL.createObjectURL(service.images[mainImageIndex]);
      setImageURL(url);
    } else {
      setImageURL(null);
    }
    
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [service.images, mainImageIndex]);

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

  return (
    <div className="service-preview-card">
      <div className="service-image-container">
        {imageURL ? (
          <img src={imageURL} alt="Service Preview" />
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
          {renderStars(4.8)}
          <span>4.8 (89 reviews)</span>
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
          {service.description || 'Exceptional culinary experiences tailored to your event needs and preferences.'}
        </p>
        <div className="service-features">
          <h4>{t('features')}</h4>
          <ul>
            {(service.features || 'Menu Planning, Food Service, Beverage Service').split(',').map((feature, index) => (
              <li key={index}>✓ {feature.trim()}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const AddService = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
  });
  const [pricingOption, setPricingOption] = useState('perHour');
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [imageError, setImageError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedAvailabilityDate, setSelectedAvailabilityDate] = useState(null);
  const [timeInput, setTimeInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [providerName, setProviderName] = useState('');
  const [serviceName, setServiceName] = useState('');

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      if (user && user.username) {
        setProviderName(user.username);
      }
    }
  }, []);

  useEffect(() => {
    const combinedName = providerName ? `${providerName}: ${serviceName}` : serviceName;
    setFormData(prev => ({ ...prev, name: combinedName }));
  }, [serviceName, providerName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') {
        setServiceName(value);
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePricingOptionChange = (option) => {
    setPricingOption(option);
    if (option === 'perHour') {
        setFormData(prev => ({ ...prev, pricePerPerson: '' }));
    } else {
        setFormData(prev => ({ ...prev, pricePerHour: '' }));
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
    setSelectedAvailabilityDate(date);
    setTimeInput('');
  };

  const addTimeSlot = () => {
    if (selectedAvailabilityDate && timeInput) {
      const dateStr = selectedAvailabilityDate.toISOString().split('T')[0];
      const newAvailability = { ...formData.availability };
      if (!newAvailability[dateStr]) {
        newAvailability[dateStr] = [];
      }
      if (!newAvailability[dateStr].includes(timeInput)) {
        newAvailability[dateStr].push(timeInput);
        newAvailability[dateStr].sort();
        setFormData(prev => ({ ...prev, availability: newAvailability }));
      }
      setTimeInput('');
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
    if (formData.images.length < 2) {
      const error = t('min2Images', 'You must upload at least 2 images.');
      setImageError(error);
      toast.error(error);
      return;
    }

    const data = new FormData();
    console.log('formData state:', formData);
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('pricePerHour', formData.pricePerHour);
    data.append('pricePerPerson', formData.pricePerPerson);
    data.append('location', formData.location);
    data.append('description', formData.description);
    data.append('features', formData.features);
    data.append('availability', JSON.stringify(formData.availability));
      data.append('mainImageIndex', mainImageIndex);
      const userString = localStorage.getItem('user');
      if (!userString) {
        toast.error('You must be logged in to add a service.');
        return;
      }
      const user = JSON.parse(userString);
      if (!user || !user.email) {
        toast.error('You must be logged in to add a service.');
        return;
      }
      data.append('email', user.email);
 
      formData.images.forEach(image => {
      data.append('images', image);
    });

    try {
      console.log('Form data entries:');
      for (let pair of data.entries()) {
        console.log(pair[0]+ ', ' + pair[1]); 
      }
      const response = await axios.post('/api/services', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Response:', response);
      toast.success('Service added successfully!');
      navigate('/manage-listings');
    } catch (error) {
      console.error('Error:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      toast.error('Failed to add service.');
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

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        const isSelected = selectedAvailabilityDate && selectedAvailabilityDate.toDateString() === date.toDateString();
        const hasAvailability = formData.availability[dateStr] && formData.availability[dateStr].length > 0;

        dates.push(
            <div
                key={day}
                className={`calendar-day ${hasAvailability ? 'available' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => handleDateClick(date)}
            >
                {day}
            </div>
        );
    }
    
    return (
        <div className="availability-calendar">
            <div className="calendar-navigation">
                <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>&lt;</button>
                <h3>{currentMonth.toLocaleString(t('locale'), { month: 'long', year: 'numeric' })}</h3>
                <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>&gt;</button>
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
    const selectedDateStr = selectedAvailabilityDate ? selectedAvailabilityDate.toISOString().split('T')[0] : null;
    return (
        <div className="availability-manager">
            {renderAvailabilityCalendar()}
            {selectedAvailabilityDate && (
                <div className="time-slots-manager">
                    <h4>{t('availableTimesFor', { date: selectedDateStr })}</h4>
                    <div className="time-slots-list">
                        {formData.availability[selectedDateStr] && formData.availability[selectedDateStr].map(time => (
                            <div key={time} className="time-slot-chip">
                                {time}
                                <button type="button" onClick={() => removeTimeSlot(selectedDateStr, time)}>&times;</button>
                            </div>
                        ))}
                    </div>
                    <div className="add-time-slot">
                        <input
                            type="time"
                            value={timeInput}
                            onChange={(e) => setTimeInput(e.target.value)}
                        />
                        <button type="button" onClick={addTimeSlot}>{t('addTime')}</button>
                    </div>
                </div>
            )}
        </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>{t('addNewService')}</h1>
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
        <option value="Muscat">Muscat</option>
        <option value="Muttrah">Muttrah</option>
        <option value="Ruwi">Ruwi</option>
        <option value="Seeb">Seeb</option>
        <option value="Azaiba">Azaiba</option>
        <option value="Ghubra">Ghubra</option>
        <option value="Bausher">Bausher</option>
        <option value="Salalah">Salalah</option>
        <option value="Taqah">Taqah</option>
        <option value="Mirbat">Mirbat</option>
        <option value="Thumrait">Thumrait</option>
        <option value="Khasab">Khasab</option>
        <option value="Dibba Al-Baya">Dibba Al-Baya</option>
        <option value="Sohar">Sohar</option>
        <option value="Shinas">Shinas</option>
        <option value="Liwa">Liwa</option>
        <option value="Barka">Barka</option>
        <option value="Rustaq">Rustaq</option>
        <option value="Musannah">Musannah</option>
        <option value="Nizwa">Nizwa</option>
        <option value="Bahla">Bahla</option>
        <option value="Sumail">Sumail</option>
        <option value="Izki">Izki</option>
        <option value="Ibri">Ibri</option>
        <option value="Yanqul">Yanqul</option>
        <option value="Ibra">Ibra</option>
        <option value="Bidiyah">Bidiyah</option>
        <option value="Sur">Sur</option>
        <option value="Jalan Bani Bu Ali">Jalan Bani Bu Ali</option>
        <option value="Haima">Haima</option>
        <option value="Duqm">Duqm</option>
        <option value="Al Buraimi">Al Buraimi</option>
        <option value="Mahdah">Mahdah</option>
    </select>
</div>
<div className="form-group">
    <label>{t('priceOption', 'Pricing Option')}</label>
    <div className="toggle-switch">
        <button type="button" className={`toggle-btn ${pricingOption === 'perHour' ? 'active' : ''}`} onClick={() => handlePricingOptionChange('perHour')}>
            {t('perHour', 'Per Hour')}
        </button>
        <button type="button" className={`toggle-btn ${pricingOption === 'perPerson' ? 'active' : ''}`} onClick={() => handlePricingOptionChange('perPerson')}>
            {t('perPerson', 'Per Person')}
        </button>
    </div>
</div>
{pricingOption === 'perHour' ? (
    <div className="form-group">
        <label htmlFor="pricePerHour">{t('pricePerHour')}</label>
        <input id="pricePerHour" type="text" name="pricePerHour" value={formData.pricePerHour} onChange={handleChange} placeholder="OMR 20 / hour" required />
    </div>
) : (
    <div className="form-group">
        <label htmlFor="pricePerPerson">{t('pricePerPerson')}</label>
        <input id="pricePerPerson" type="text" name="pricePerPerson" value={formData.pricePerPerson} onChange={handleChange} placeholder="OMR 2 / person" required />
    </div>
)}
<div className="form-group">
    <label htmlFor="description">{t('descriptionLabel')}</label>
    <textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
</div>
<div className="form-group">
    <label htmlFor="features">{t('featuresLabel')}</label>
    <input id="features" type="text" name="features" value={formData.features} onChange={handleChange} placeholder={t('featuresPlaceholder')} />
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
                      <ImagePreviewer file={image} alt={`preview ${index}`} className="image-preview" />
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
              <button type="submit" className="action-btn">{t('addServiceBtn')}</button>
            </form>
        </div>
      </main>
    </div>
  );
};

export default AddService;
