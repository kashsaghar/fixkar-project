import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

function BookingForm() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
  const [formData, setFormData] = useState({
    booking_date: '',
    scheduled_time: '',
    address: '',
    notes: ''
  });
  
  // Fetch service and user data
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
        
        // Fetch service details
        const serviceResponse = await api.get(`/services/${serviceId}`);
        setService(serviceResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to load necessary data');
        setLoading(false);
        
        if (err.response?.status === 401) {
          navigate('/auth');
        }
      }
    };
    
    fetchData();
  }, [serviceId, navigate]);
  
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
      
      // Combine date and time
      const scheduledDateTime = new Date(`${formData.booking_date}T${formData.scheduled_time}`);
      
      const bookingData = {
        service_id: parseInt(serviceId),
        seeker_id: user.user_id,
        booking_date: new Date().toISOString(),
        scheduled_time: scheduledDateTime.toISOString(),
        address: formData.address,
        total_amount: service.price,
        notes: formData.notes,
        status: 'pending'
      };
      
      const response = await api.post('/bookings', bookingData);
      
      alert('Booking created successfully!');
      navigate('/my-bookings');
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <section className="formsFormat">
        <h1>Book Service</h1>
        <div className="loading">Loading...</div>
      </section>
    );
  }
  
  if (error) {
    return (
      <section className="formsFormat">
        <h1>Book Service</h1>
        <div className="error">{error}</div>
      </section>
    );
  }
  
  if (!service) {
    return (
      <section className="formsFormat">
        <h1>Book Service</h1>
        <div className="error">Service not found</div>
      </section>
    );
  }
  
  return (
    <section className="formsFormat">
      <h1>Book Service</h1>
      
      <div className="service-details">
        <h2>{service.title}</h2>
        <p><strong>Category:</strong> {service.category_name}</p>
        <p><strong>Provider:</strong> {service.provider_name}</p>
        <p><strong>Price:</strong> ₹{service.price}</p>
        <p><strong>Duration:</strong> {service.duration_minutes} minutes</p>
      </div>
      
      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="booking_date">Date:</label>
          <input
            type="date"
            id="booking_date"
            name="booking_date"
            value={formData.booking_date}
            onChange={handleChange}
            required
            className="form-control"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="scheduled_time">Time:</label>
          <input
            type="time"
            id="scheduled_time"
            name="scheduled_time"
            value={formData.scheduled_time}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="address">Service Address:</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="form-control"
            rows="3"
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="notes">Additional Notes:</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="form-control"
            rows="3"
          ></textarea>
        </div>
        
        <div className="booking-summary">
          <h3>Booking Summary</h3>
          <p><strong>Service:</strong> {service.title}</p>
          <p><strong>Provider:</strong> {service.provider_name}</p>
          <p><strong>Total Amount:</strong> ₹{service.price}</p>
        </div>
        
        <button type="submit" className="booking-submit" disabled={loading}>
          {loading ? 'Processing...' : 'Confirm Booking'}
        </button>
      </form>
    </section>
  );
}

export default BookingForm;