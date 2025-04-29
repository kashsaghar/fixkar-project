import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
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
        
        // Fetch bookings based on user role
        let endpoint = '/bookings/my-bookings';
        if (userResponse.data.role === 'provider') {
          endpoint = '/bookings/provider-bookings';
        }
        
        const bookingsResponse = await api.get(endpoint);
        setBookings(bookingsResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(err.response?.data?.message || 'Failed to load bookings');
        setLoading(false);
        
        if (err.response?.status === 401) {
          navigate('/auth');
        }
      }
    };
    
    fetchData();
  }, [navigate]);
  
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      
      // Update the booking in the state
      setBookings(bookings.map(booking => 
        booking.booking_id === bookingId 
          ? { ...booking, status: newStatus } 
          : booking
      ));
      
      alert(`Booking status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('Failed to update booking status');
    }
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'accepted': return 'badge-info';
      case 'in_progress': return 'badge-primary';
      case 'completed': return 'badge-success';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };
  
  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };
  
  if (loading) {
    return (
      <section className="bookings-page">
        <h1>My Bookings</h1>
        <div className="loading">Loading...</div>
      </section>
    );
  }
  
  if (error) {
    return (
      <section className="bookings-page">
        <h1>My Bookings</h1>
        <div className="error">{error}</div>
      </section>
    );
  }
  
  return (
    <section className="bookings-page">
      <h1>{user?.role === 'provider' ? 'Service Requests' : 'My Bookings'}</h1>
      
      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>No bookings found.</p>
          {user?.role === 'seeker' && (
            <Link to="/services" className="btn-primary">Browse Services</Link>
          )}
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking.booking_id} className="booking-card">
              <div className="booking-header">
                <h3>{booking.service_title}</h3>
                <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                  {booking.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="booking-details">
                <p><strong>Scheduled:</strong> {formatDateTime(booking.scheduled_time)}</p>
                <p><strong>Address:</strong> {booking.address}</p>
                <p><strong>Total Amount:</strong> ₹{booking.total_amount}</p>
                
                {user?.role === 'seeker' ? (
                  <p><strong>Provider:</strong> {booking.provider_name}</p>
                ) : (
                  <p><strong>Customer:</strong> {booking.seeker_name}</p>
                )}
                
                {booking.notes && (
                  <p><strong>Notes:</strong> {booking.notes}</p>
                )}
              </div>
              
              <div className="booking-actions">
                {user?.role === 'provider' && booking.status === 'pending' && (
                  <>
                    <button 
                      className="btn-success" 
                      onClick={() => handleStatusChange(booking.booking_id, 'accepted')}
                    >
                      Accept
                    </button>
                    <button 
                      className="btn-danger" 
                      onClick={() => handleStatusChange(booking.booking_id, 'cancelled')}
                    >
                      Decline
                    </button>
                  </>
                )}
                
                {user?.role === 'provider' && booking.status === 'accepted' && (
                  <button 
                    className="btn-primary" 
                    onClick={() => handleStatusChange(booking.booking_id, 'in_progress')}
                  >
                    Start Service
                  </button>
                )}
                
                {user?.role === 'provider' && booking.status === 'in_progress' && (
                  <button 
                    className="btn-success" 
                    onClick={() => handleStatusChange(booking.booking_id, 'completed')}
                  >
                    Complete Service
                  </button>
                )}
                
                {user?.role === 'seeker' && booking.status === 'pending' && (
                  <button 
                    className="btn-danger" 
                    onClick={() => handleStatusChange(booking.booking_id, 'cancelled')}
                  >
                    Cancel Booking
                  </button>
                )}
                
                {user?.role === 'seeker' && booking.status === 'completed' && !booking.has_review && (
                  <Link 
                    to={`/review/${booking.booking_id}`} 
                    className="btn-primary"
                  >
                    Leave Review
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default MyBookings;