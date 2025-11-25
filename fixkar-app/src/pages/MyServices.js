import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

function MyServices() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        
        // Check if user is logged in and is a provider
        const userResponse = await api.get('/auth/user');
        if (!userResponse.data) {
          navigate('/auth');
          return;
        }
        
        if (userResponse.data.role !== 'provider') {
          navigate('/');
          return;
        }
        
        // Fetch provider's services
        const servicesResponse = await api.get('/services/provider/me');
        setServices(servicesResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(err.response?.data?.message || 'Failed to load services');
        setLoading(false);
        
        if (err.response?.status === 401) {
          navigate('/auth');
        }
      }
    };
    
    fetchServices();
  }, [navigate]);
  
  const handleToggleAvailability = async (serviceId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      
      await api.patch(`/services/${serviceId}/availability`, {
        is_available: newStatus
      });
      
      // Update the service in the state
      setServices(services.map(service => 
        service.service_id === serviceId 
          ? { ...service, is_available: newStatus } 
          : service
      ));
      
      alert(`Service is now ${newStatus ? 'available' : 'unavailable'}`);
    } catch (err) {
      console.error('Error updating service:', err);
      alert('Failed to update service availability');
    }
  };
  
  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }
    
    try {
      await api.delete(`services/:id`);
      
      // Remove the service from the state
      setServices(services.filter(service => service.service_id !== serviceId));
      
      alert('Service deleted successfully');
    } catch (err) {
      console.error('Error deleting service:', err);
      alert('Failed to delete service');
    }
  };
  
  if (loading) {
    return (
      <section className="services-page">
        <h1>My Services</h1>
        <div className="loading">Loading...</div>
      </section>
    );
  }
  
  if (error) {
    return (
      <section className="services-page">
        <h1>My Services</h1>
        <div className="error">{error}</div>
      </section>
    );
  }
  
  return (
    <section className="services-page">
      <div className="services-header">
        <h1>My Services</h1>
        <Link to="/add-service" className="btn-primary">Add New Service</Link>
      </div>
      
      {services.length === 0 ? (
        <div className="no-services">
          <p>You haven't added any services yet.</p>
          <Link to="/add-service" className="btn-primary">Add Your First Service</Link>
        </div>
      ) : (
        <div className="services-list">
          {services.map(service => (
            <div key={service.service_id} className="service-card">
              <h3>{service.title}</h3>
              
              <div className="service-card-details">
                <p><strong>Category:</strong> {service.category_name}</p>
                <p><strong>Price:</strong> ₹{service.price}</p>
                <p><strong>Duration:</strong> {service.duration_minutes} minutes</p>
                <p>
                  <strong>Status:</strong> 
                  <span className={`availability-badge ${service.is_available ? 'available' : 'unavailable'}`}>
                    {service.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </p>
              </div>
              
              <div className="service-card-actions">
                <button 
                  className={service.is_available ? 'btn-danger' : 'btn-success'}
                  onClick={() => handleToggleAvailability(service.service_id, service.is_available)}
                >
                  {service.is_available ? 'Mark Unavailable' : 'Mark Available'}
                </button>
                
                <Link to={`/edit-service/${service.service_id}`} state={{service}} className="btn-primary">
                  Edit
                </Link>
                
                <button 
                  className="btn-danger"
                  onClick={() => handleDeleteService(service.service_id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default MyServices;