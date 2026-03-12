import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Dashboard.css';

const EditListing = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    location: '',
    price: '',
    description: '',
    features: [],
    image: '',
  });

  useEffect(() => {
    // Fetch the service data to populate the form
    const fetchService = async () => {
      try {
        const response = await fetch(`/api/services/${id}`);
        const data = await response.json();
        setFormData(data);
      } catch (error) {
        console.error('Failed to fetch service:', error);
      }
    };
    fetchService();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFeatureChange = (e, index) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = e.target.value;
    setFormData(prevState => ({
      ...prevState,
      features: newFeatures,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        navigate('/manage-listings');
      } else {
        const data = await response.json();
        console.error(data.message);
      }
    } catch (error) {
      console.error('Failed to update service:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>{t('editListing')}</h1>
      </header>
      <main className="dashboard-content">
        <div className="dashboard-card full-width">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">{t('serviceName')}</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="type">{t('serviceType')}</label>
              <input
                type="text"
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="location">{t('location')}</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="price">{t('price')}</label>
              <input
                type="text"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">{t('description')}</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>{t('features')}</label>
              {formData.features.map((feature, index) => (
                <input
                  key={index}
                  type="text"
                  value={feature}
                  onChange={(e) => handleFeatureChange(e, index)}
                  style={{ marginBottom: '0.5rem' }}
                />
              ))}
            </div>
            <div className="form-group">
              <label htmlFor="image">{t('imageUrl')}</label>
              <input
                type="text"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="action-btn">{t('saveChanges')}</button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditListing;
