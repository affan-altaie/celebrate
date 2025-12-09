import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import './ProviderProfile.css';
import logo1 from '../../assets/logo1.png'; // Fallback image

const services = [
  {
    id: 1,
    providerId: 101,
    name: 'Elite Photography Studios',
    type: 'Photography',
    reviews: 127,
    rating: 4.9,
    description: 'Professional event photography with years of experience capturing precious moments.',
    features: ['Wedding Photography', 'Corporate Events', 'Portrait Sessions'],
    price: '$500 - $2000',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 5,
    providerId: 101,
    name: 'Studio Event Videography',
    type: 'Videography',
    reviews: 98,
    rating: 4.8,
    description: 'Cinematic event videography to capture your special day in motion.',
    features: ['Full-day Coverage', 'Drone Footage', 'Highlight Reel'],
    price: '$1500 - $4000',
    image: 'https://images.unsplash.com/photo-1512485800893-b08ec1ea59b1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 2,
    providerId: 102,
    name: 'Gourmet Catering Co.',
    type: 'Catering',
    reviews: 89,
    rating: 4.8,
    description: 'Exceptional culinary experiences tailored to your event needs and preferences.',
    features: ['Menu Planning', 'Food Service', 'Beverage Service'],
    price: '$30 - $100/person',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 3,
    providerId: 103,
    name: 'Elegant Wedding Halls',
    type: 'Wedding Halls',
    reviews: 156,
    rating: 5,
    description: 'Stunning wedding halls with state-of-the-art facilities and flexible spaces.',
    features: ['Indoor Spaces', 'Outdoor Gardens', 'Audio/Visual Equipment'],
    price: '$2000 - $10000',
    image: 'https://www.shangri-la.com/-/media/Shangri-La/muscat_barraljissahresort/settings/weddings-celebrations/SLMU_Events_Spaces_1920x940.jpg'
  },
  {
    id: 4,
    providerId: 104,
    name: 'Joyful Birthday Parties',
    type: 'Birthdays',
    reviews: 94,
    rating: 4.7,
    description: 'Unforgettable birthday parties for all ages, with entertainment and activities.',
    features: ['Themed Decorations', 'Games and Activities', 'Cake and Catering'],
    price: '$300 - $1200',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60'
  }
];

const providers = {
  101: {
    name: 'Elite Photography',
    logo: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=60',
    location: 'New York, NY',
    contact: '555-123-4567'
  },
  102: {
    name: 'Gourmet Catering',
    logo: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=60',
    location: 'San Francisco, CA',
    contact: '555-987-6543'
  },
  103: {
    name: 'Elegant Wedding Halls',
    logo: 'https://www.shangri-la.com/-/media/Shangri-La/muscat_barraljissahresort/settings/weddings-celebrations/SLMU_Events_Spaces_1920x940.jpg',
    location: 'Los Angeles, CA',
    contact: '555-111-2222'
  },
  104: {
    name: 'Joyful Birthday Parties',
    logo: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=60',
    location: 'Chicago, IL',
    contact: '555-333-4444'
  }
};

const customerReviews = [
  { id: 1, providerId: 101, author: 'John Doe', rating: 5, comment: 'Absolutely amazing! The photos from our wedding were stunning. Highly recommend!', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80' },
  { id: 2, providerId: 101, author: 'Jane Smith', rating: 4, comment: 'Great service and beautiful photos. The photographer was very professional.', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80' },
  { id: 3, providerId: 102, author: 'Peter Jones', rating: 5, comment: 'The food was delicious and the presentation was beautiful. Our guests were very impressed.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80' }
];

const ProviderProfile = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  
  const provider = providers[providerId];
  const providerServices = services.filter(s => s.providerId === parseInt(providerId));
  const reviews = customerReviews.filter(r => r.providerId === parseInt(providerId));
  
  if (!provider) {
    return <div>Provider not found</div>;
  }

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  const handleImageError = (e) => {
    e.target.src = logo1;
  };

  return (
    <div className="provider-profile-container">
      <button onClick={() => navigate(-1)} className="back-button">Back</button>
      
      <div className="provider-header">
        <img src={provider.logo} alt={`${provider.name} logo`} className="provider-logo" onError={handleImageError} />
        <div className="provider-info">
          <h1>{provider.name}'s Services</h1>
          <div className="provider-meta">
            <span><FaMapMarkerAlt /> {provider.location}</span>
            <span><FaPhone /> {provider.contact}</span>
            <span className="average-rating"><FaStar /> {averageRating.toFixed(1)} ({reviews.length} reviews)</span>
          </div>
        </div>
      </div>

      <h2>Our Services</h2>
      <div className="services-grid">
        {providerServices.map(service => (
          <div key={service.id} className="service-card" onClick={() => navigate(`/service/${service.id}`)}>
            <img src={service.image} alt={service.name} className="service-image" onError={handleImageError} />
            <div className="service-info">
              <h3>{service.name}</h3>
              <p className="service-type">{service.type}</p>
              <div className="service-rating">
                <FaStar /> {service.rating} ({service.reviews} reviews)
              </div>
              <p className="service-price">{service.price}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="customer-reviews">
        <h2>Customer Reviews</h2>
        {reviews.map(review => (
          <div key={review.id} className="review-card">
            <img src={review.image} alt={review.author} className="review-author-image" onError={handleImageError} />
            <div className="review-content">
              <strong>{review.author}</strong>
              <div className="review-rating">
                {[...Array(review.rating)].map((_, i) => <FaStar key={i} color="#ffc107" />)}
                {[...Array(5 - review.rating)].map((_, i) => <FaStar key={i} color="#e4e5e9" />)}
              </div>
              <p>{review.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProviderProfile;
