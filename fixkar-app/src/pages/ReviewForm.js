import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

function ReviewForm() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    rating: 5,
    comment: ''
  });
  
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        
        // Check if user is logged in
        const userResponse = await api.get('/auth/user');
        if (!userResponse.data) {
          navigate('/auth');
          return;
        }
        
        // Fetch booking details
        const bookingResponse = await api.get(`/bookings/${bookingId}`);
        setBooking(bookingResponse.data);
        
        // Check if user is authorized to review this booking
        if (bookingResponse.data.seeker_id !== userResponse.data.user_id) {
          setError('You are not authorized to review this booking');
        }
        
        // Check if booking is completed
        if (bookingResponse.data.status !== 'completed') {
          setError('You can only review completed services');
        }
        
        // Check if booking already has a review
        if (bookingResponse.data.has_review) {
          setError('You have already reviewed this service');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError(err.response?.data?.message || 'Failed to load booking details');
        setLoading(false);
        
        if (err.response?.status === 401) {
          navigate('/auth');
        }
      }
    };
    
    fetchBooking();
  }, [bookingId, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'rating' ? parseInt(value) : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const reviewData = {
        booking_id: parseInt(bookingId),
        rating: formData.rating,
        comment: formData.comment,
        review_date: new Date().toISOString()
      };
      
      await api.post('/reviews', reviewData);
      
      alert('Review submitted successfully!');
      navigate('/my-bookings');
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || 'Failed to submit review');
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <section className="formsFormat">
        <h1>Leave a Review</h1>
        <div className="loading">Loading...</div>
      </section>
    );
  }
  
  if (error) {
    return (
      <section className="formsFormat">
        <h1>Leave a Review</h1>
        <div className="error">{error}</div>
      </section>
    );
  }
  
  return (
    <section className="formsFormat">
      <h1>Leave a Review</h1>
      
      <div className="service-details">
        <h2>{booking.service_title}</h2>
        <p><strong>Provider:</strong> {booking.provider_name}</p>
        <p><strong>Date:</strong> {new Date(booking.scheduled_time).toLocaleDateString()}</p>
      </div>
      
      <form className="review-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="rating">Rating:</label>
          <div className="rating-input">
            {[1, 2, 3, 4, 5].map(star => (
              <label key={star}>
                <input
                  type="radio"
                  name="rating"
                  value={star}
                  checked={formData.rating === star}
                  onChange={handleChange}
                />
                <span className={star <= formData.rating ? 'star filled' : 'star'}>★</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="comment">Your Review:</label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            required
            className="form-control"
            rows="4"
            placeholder="Share your experience with this service..."
          ></textarea>
        </div>
        
        <button type="submit" className="review-submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </section>
  );
}

export default ReviewForm;