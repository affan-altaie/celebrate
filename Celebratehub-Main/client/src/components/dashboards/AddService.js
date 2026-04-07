import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaCamera } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Dashboard.css';
import './AddService.css';

const AddService = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    pricePerHour: '',
    pricePerPerson: '',
    location: '',
    description: '',
    features: '',
    images: [],
    availability: {},
  });
  const [imageError, setImageError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedAvailabilityDate, setSelectedAvailabilityDate] = useState(null);
  const [timeInput, setTimeInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    // Form submission logic
    console.log('New service submitted:', formData);
    toast.success('Service added successfully!');
    navigate('/manage-listings');
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
      <main className="dashboard-content">
        <div className="add-service-container">
          <form onSubmit={handleSubmit} className="add-service-form">
            <div className="form-group">
              <label>{t('serviceNameLabel')}</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>{t('roleLabel')}</label>
              <input type="text" name="type" value={formData.type} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>{t('locationLabel')}</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Salalah, Oman" required />
            </div>
            <div className="form-group">
              <label>{t('pricePerHour')}</label>
              <input type="text" name="pricePerHour" value={formData.pricePerHour} onChange={handleChange} placeholder="OMR 20 / hour" required />
            </div>
            <div className="form-group">
              <label>{t('pricePerPerson')}</label>
              <input type="text" name="pricePerPerson" value={formData.pricePerPerson} onChange={handleChange} placeholder="OMR 2 / person" />
            </div>
            <div className="form-group">
              <label>{t('descriptionLabel')}</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>{t('featuresLabel')}</label>
              <input type="text" name="features" value={formData.features} onChange={handleChange} placeholder={t('featuresPlaceholder')} />
            </div>
            <div className="form-group">
              <label>{t('serviceImage', 'Service Images')}</label>
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
                  <div key={index} className="image-preview-container">
                    <img src={URL.createObjectURL(image)} alt={`preview ${index}`} className="image-preview" />
                    <button type="button" onClick={() => removeImage(index)} className="remove-image-btn">&times;</button>
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
