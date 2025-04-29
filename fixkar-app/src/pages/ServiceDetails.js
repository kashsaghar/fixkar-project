import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

function ServiceDetails() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Try to get current user (if logged in)
        try {
          const userResponse = await api.get('/auth/user');
          setUser(userResponse.data);
        } catch (err) {
          // User not logged in, continue without user data
          console.log('User not logged in');
        }
        
        // Fetch service details
        const serviceResponse = await api.get(`/services/${serviceId}`);
        setService(serviceResponse.data);
        
        // Fetch reviews for this service
        const reviewsResponse = await api.get(`/reviews/service/${serviceId}`);
        setReviews(reviewsResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching service details:', err);
        setError(err.response?.data?.message || 'Failed to load service details');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [serviceId]);
  
  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };
  
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'star filled' : 'star'}>★</span>
      );
    }
    return stars;
  };
  
  if (loading) {
    return (
      <section className="service-detail-page">
        <div className="loading">Loading...</div>
      </section>
    );
  }
  
  if (error) {
    return (
      <section className="service-detail-page">
        <div className="error">{error}</div>
      </section>
    );
  }
  
  if (!service) {
    return (
      <section className="service-detail-page">
        <div className="error">Service not found</div>
      </section>
    );
  }
  
  return (
    <section className="service-detail-page">
      <div className="service-detail-container">
        <div className="service-detail-header">
          <h1>{service.title}</h1>
          <span className={`availability-badge ${service.is_available ? 'available' : 'unavailable'}`}>
            {service.is_available ? 'Available' : 'Unavailable'}
          </span>
        </div>
        
        <div className="service-provider-info">
          <div className="provider-avatar">
            <img 
              src={service.provider_picture || "/placeholder.svg"} 
              alt={service.provider_name} 
            />
          </div>
          <div className="provider-details">
            <h3>{service.provider_name}</h3>
            <p>Service Provider</p>
          </div>
        </div>
        
        <div className="service-description">
          <h2>Description</h2>
          <p>{service.description}</p>
        </div>
        
        <div className="service-meta">
          <div className="meta-item">
            <h4>Price</h4>
            <p>₹{service.price}</p>
          </div>
          <div className="meta-item">
            <h4>Duration</h4>
            <p>{service.duration_minutes} minutes</p>
          </div>
          <div className="meta-item">
            <h4>Category</h4>
            <p>{service.category_name}</p>
          </div>
          <div className="meta-item">
            <h4>Rating</h4>
            <p>
              {calculateAverageRating()} 
              <span className="review-stars">★</span> 
              ({reviews.length})
            </p>
          </div>
        </div>
        
        {service.is_available && user && user.role === 'seeker' && (
          <Link to={`/book/${service.service_id}`} className="book-service-btn">
            Book This Service
          </Link>
        )}
        
        {!user && (
          <Link to="/auth" className="book-service-btn">
            Login to Book
          </Link>
        )}
        
        {service.is_available === false && (
          <div className="unavailable-notice">
            <p>This service is currently unavailable for booking.</p>
          </div>
        )}
        
        <div className="service-reviews">
          <h2>Reviews ({reviews.length})</h2>
          
          {reviews.length === 0 ? (
            <p>No reviews yet for this service.</p>
          ) : (
            reviews.map(review => (
              <div key={review.review_id} className="review-item">
                <div className="review-item-header">
                  <h4>{review.user_name}</h4>
                  <div className="review-stars">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <p>{review.comment}</p>
                <div className="review-date">
                  {new Date(review.review_date).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default ServiceDetails;