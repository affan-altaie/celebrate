import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaCalendarAlt, FaCamera } from 'react-icons/fa';
import './ServiceDetails.css';

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
    price: 'OMR 40 / hour',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
    location: 'Muscat, Oman',
    distance: '5 miles',
    publishedDate: '2023-01-15',
    photos: [
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1520342868574-5fa3804e551c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1505238680356-667803448bb6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60'
    ]
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
    price: 'OMR 20 / hour',
    pricePerPerson: 'OMR 2',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
    location: 'Salalah, Oman',
    distance: '10 miles',
    publishedDate: '2023-02-20',
    photos: [
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60'
    ]
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
    price: 'OMR 120 / hour',
    pricePerPerson: 'OMR 2',
    image: 'https://www.shangri-la.com/-/media/Shangri-La/muscat_barraljissahresort/settings/weddings-celebrations/SLMU_Events_Spaces_1920x940.jpg',
    location: 'Sohar, Oman',
    distance: '15 miles',
    publishedDate: '2023-03-10',
    photos: [
        'https://www.shangri-la.com/-/media/Shangri-La/muscat_barraljissahresort/settings/weddings-celebrations/SLMU_Events_Spaces_1920x940.jpg',
        'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
        'https://images.unsplash.com/photo-1505238680356-667803448bb6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60'
    ]
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
    price: 'OMR 30 / hour',
    pricePerPerson: 'OMR 2',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
    location: 'Nizwa, Oman',
    distance: '8 miles',
    publishedDate: '2023-04-05',
    photos: [
        'https://images.unsplash.com/photo-1513151233558-d860c5398176?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
        'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
        'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60'
    ]
  }
];

const customerReviews = [
    {
      id: 1,
      author: 'John Doe',
      rating: 5,
      comment: 'Absolutely amazing! The photos from our wedding were stunning. Highly recommend!',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80',
      photos: [
        'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60',
        'https://images.unsplash.com/photo-1542042161-d10f8a84d337?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60'
      ]
    },
    {
      id: 2,
      author: 'Jane Smith',
      rating: 4,
      comment: 'Great service and beautiful photos. The photographer was very professional.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80',
      photos: [
        'https://images.unsplash.com/photo-1519211975-6204b504236b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60'
      ]
    }
  ];
  

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);

  useEffect(() => {
    const selectedService = services.find(s => s.id === parseInt(id));
    setService(selectedService);
  }, [id]);

  if (!service) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="service-details-container">
      <button onClick={() => navigate(-1)} className="back-button">Back to Search</button>
      
      <div className="service-header">
        <img src={service.image} alt={service.name} className="service-main-image" />
        <div className="service-header-info">
          <Link to={`/provider-profile/${service.providerId}`} className="provider-link">
            <h1>Service Provider: {service.name}</h1>
          </Link>
          <div className="service-meta">
            <span><FaStar /> {service.rating} ({service.reviews} reviews)</span>
            <span><FaMapMarkerAlt /> <strong>Location:</strong> {service.location} (<strong>Distance:</strong> {service.distance})</span>
            <span><FaCalendarAlt /> <strong>Date of Publish:</strong> {service.publishedDate}</span>
          </div>
          <p className="service-description">{service.description}</p>
          <div className="service-price-book">
            <div className="price-info">
              <span className="price-display">{service.price}</span>
              {service.pricePerPerson && <span className="price-per-person">{service.pricePerPerson} / person</span>}
            </div>
            <button className="book-now-button" onClick={() => navigate(`/booking/${service.id}`)}>Book Now</button>
          </div>
          <button onClick={() => navigate(`/report-service/${service.id}`)} className="report-btn">Report Service</button>
        </div>
      </div>

      <div className="service-gallery">
        <h2><FaCamera /> Photo Gallery</h2>
        <div className="photo-grid">
          {service.photos.map((photo, index) => (
            <img key={index} src={photo} alt={`${service.name} gallery ${index + 1}`} className="gallery-photo" />
          ))}
        </div>
      </div>

      <div className="customer-reviews">
        <h2>Customer Reviews</h2>
        {customerReviews.map(review => (
          <div key={review.id} className="review-card">
            <img src={review.image} alt={review.author} className="review-author-image" />
            <div className="review-content">
              <div className="review-header">
                <strong>{review.author}</strong>
                <div className="review-rating">
                  {[...Array(review.rating)].map((_, i) => <FaStar key={i} color="#ffc107" />)}
                  {[...Array(5 - review.rating)].map((_, i) => <FaStar key={i} color="#e4e5e9" />)}
                </div>
              </div>
              <p>{review.comment}</p>
              {review.photos && (
                <div className="review-photos">
                  {review.photos.map((photo, index) => (
                    <img key={index} src={photo} alt={`${review.author} review ${index + 1}`} className="review-photo" />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceDetails;
