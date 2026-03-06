import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Dashboard.css';
import './AddService.css';

const AddService = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    price: '',
    description: '',
    features: '',
    image: null,
    availability: {},
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here you would typically handle form submission, including file upload
    console.log('New service submitted:', formData);
    // On success, navigate back to the manage listings page
    navigate('/manage-listings');
  };

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
              <label>{t('pricePerHour')}</label>
              <input type="text" name="price" value={formData.price} onChange={handleChange} placeholder="OMR 100 - OMR 400 / hour" required />
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
              <label>{t('serviceImage')}</label>
              <input type="file" onChange={handleImageChange} accept="image/*" required />
            </div>
            {/* A more complex UI would be needed for availability, but this is a starting point */}
            <div className="form-group">
              <label>{t('availability')}</label>
              <p>{t('availabilityManagementPlaceholder')}</p>
            </div>
            <button type="submit" className="action-btn">{t('addServiceBtn')}</button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddService;
