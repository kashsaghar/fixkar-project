import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

function ComplaintForm() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Check if user is logged in
        const userResponse = await api.get('/auth/user');
        if (!userResponse.data) {
          navigate('/auth');
          return;
        }
        
        setUser(userResponse.data);
        
        // Fetch booking details
        const bookingResponse = await api.get(`/bookings/${bookingId}`);
        setBooking(bookingResponse.data);
        
        // Check if user is authorized to file a complaint for this booking
        if (bookingResponse.data.seeker_id !== userResponse.data.user_id && 
            bookingResponse.data.provider_id !== userResponse.data.user_id) {
          setError('You are not authorized to file a complaint for this booking');
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
    
    fetchData();
  }, [bookingId, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const complaintData = {
        user_id: user.user_id,
        booking_id: parseInt(bookingId),
        title: formData.title,
        description: formData.description,
        status: 'open',
        created_at: new Date().toISOString()
      };
      
      await api.post('/complaints', complaintData);
      
      alert('Complaint submitted successfully!');
      navigate('/my-bookings');
    } catch (err) {
      console.error('Error submitting complaint:', err);
      setError(err.response?.data?.message || 'Failed to submit complaint');
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <section className="formsFormat">
        <h1>File a Complaint</h1>
        <div className="loading">Loading...</div>
      </section>
    );
  }
  
  if (error) {
    return (
      <section className="formsFormat">
        <h1>File a Complaint</h1>
        <div className="error">{error}</div>
      </section>
    );
  }
  
  return (
    <section className="formsFormat">
      <h1>File a Complaint</h1>
      
      <div className="booking-details">
        <h2>Booking Details</h2>
        <p><strong>Service:</strong> {booking.service_title}</p>
        <p><strong>Provider:</strong> {booking.provider_name}</p>
        <p><strong>Date:</strong> {new Date(booking.scheduled_time).toLocaleDateString()}</p>
        <p><strong>Status:</strong> {booking.status}</p>
      </div>
      
      <form className="complaint-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Complaint Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="form-control"
            placeholder="Brief title for your complaint"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Complaint Details:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="form-control"
            rows="6"
            placeholder="Please provide detailed information about your complaint..."
          ></textarea>
        </div>
        
        <button type="submit" className="complaint-submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </form>
    </section>
  );
}

export default ComplaintForm;