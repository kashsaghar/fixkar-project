import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bookingsAPI, servicesAPI } from '../utils/api';

function BookingForm() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    booking_date: '',
    notes: ''
  });

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const serviceData = await servicesAPI.getServiceById(serviceId);
        setService(serviceData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching service:', err);
        setError('Failed to load service details. Please try again.');
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

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
      
      // Create booking data
      const bookingData = {
        service_id: serviceId,
        booking_date: formData.booking_date,
        notes: formData.notes
      };
      
      // Submit booking
      await bookingsAPI.createBooking(bookingData);
      
      // Show success message
      alert('Booking created successfully!');
      
      // Redirect to my bookings page
      navigate('/my-bookings');
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
      setLoading(false);
    }
  };

  if (loading && !service) {
    return (
      <div className="booking-form-container">
        <h2>Loading service details...</h2>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-form-container">
        <h2>Error</h2>
        <div className="error-message">{error}</div>
        <button onClick={() => navigate(-1)} className="btn-secondary">Go Back</button>
      </div>
    );
  }

  return (
    <div className="booking-form-container">
      <h2>Book Service</h2>
      
      {service && (
        <div className="service-summary">
          <h3>{service.title}</h3>
          <p><strong>Provider:</strong> {service.provider_name}</p>
          <p><strong>Price:</strong> PKR {service.price}</p>
          <p><strong>Duration:</strong> {service.duration_minutes} minutes</p>
          <p><strong>Location:</strong> {service.location}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-group">
          <label htmlFor="booking_date">Select Date and Time:</label>
          <input
            type="datetime-local"
            id="booking_date"
            name="booking_date"
            value={formData.booking_date}
            onChange={handleChange}
            required
            className="form-control"
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="notes">Additional Notes (Optional):</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="form-control"
            rows="4"
            placeholder="Any special instructions or requirements..."
          ></textarea>
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Processing...' : 'Confirm Booking'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default BookingForm;