import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './AddService.css';

const AddService = () => {
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
        <h1>Add a New Service</h1>
        <button onClick={() => navigate('/manage-listings')} className="action-btn">Cancel</button>
      </header>
      <main className="dashboard-content">
        <div className="add-service-container">
          <form onSubmit={handleSubmit} className="add-service-form">
            <div className="form-group">
              <label>Service Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Service Type</label>
              <input type="text" name="type" value={formData.type} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Price (per hour)</label>
              <input type="text" name="price" value={formData.price} onChange={handleChange} placeholder="$100 - $400 / hour" required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Features (comma-separated)</label>
              <input type="text" name="features" value={formData.features} onChange={handleChange} placeholder="Feature 1, Feature 2, Feature 3" />
            </div>
            <div className="form-group">
              <label>Service Image</label>
              <input type="file" onChange={handleImageChange} accept="image/*" required />
            </div>
            {/* A more complex UI would be needed for availability, but this is a starting point */}
            <div className="form-group">
              <label>Availability</label>
              <p>Availability management will be implemented here.</p>
            </div>
            <button type="submit" className="action-btn">Add Service</button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddService;
