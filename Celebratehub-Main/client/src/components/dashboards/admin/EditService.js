import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const EditService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [service, setService] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await axios.get(`/api/services/${id}`);
        setService(response.data);
        setName(response.data.name);
        setCategory(response.data.category);
        setLocation(response.data.location);
        setPricePerHour(response.data.pricePerHour);
        setImages(response.data.images || []);
      } catch (error) {
        console.error('Error fetching service:', error);
      }
    };
    fetchService();
  }, [id]);

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('location', location);
    formData.append('pricePerHour', pricePerHour);
    if (images.length > 0) {
        images.forEach(image => {
            formData.append('images', image);
        });
    }

    try {
      await axios.put(`/api/services/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Service updated successfully');
      navigate('/admin/manage-services');
    } catch (error) {
      console.error('Error updating service:', error);
      alert('Failed to update service');
    }
  };

  if (!service) {
    return <div>{t('loading')}</div>;
  }

  return (
    <div className="admin-container">
      <h1>{t('editService')}</h1>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label>{t('serviceNameLabel')}</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>{t('category')}</label>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>{t('location')}</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>{t('pricePerHour')}</label>
          <input type="number" value={pricePerHour} onChange={(e) => setPricePerHour(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>{t('imageLabel')}</label>
          <input type="file" multiple onChange={handleImageChange} accept="image/*" />
        </div>
        <button type="submit" className="action-btn">{t('updateService')}</button>
      </form>
    </div>
  );
};

export default EditService;