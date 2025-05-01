import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import api, { filtersAPI } from '../utils/api';

function ServiceForm() {
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchingData, setFetchingData] = useState(isEditMode);
  const [user, setUser] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    description: '',
    price: '',
    duration_minutes: 60,
    is_available: true,
    location: '',
  });
  
  const defaultLocations = [
    "Clifton", "Defence", "Gulshan-e-Iqbal", "Gulistan-e-Johar",
    "North Nazimabad", "Federal B Area", "Saddar", "Malir",
    "Korangi", "Landhi", "Orangi Town", "Nazimabad",
    "PECHS", "Bahadurabad", "Tariq Road", "Shahrah-e-Faisal",
    "Liaquatabad", "North Karachi", "Shah Faisal Colony",
    "Model Colony", "Kemari", "Lyari", "Baldia Town",
    "Bin Qasim Town", "Gadap Town"
  ];
  
  // Fetch user data, categories, and locations on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Check if user is logged in
        const userResponse = await api.get('/auth/user');
        if (!userResponse.data) {
          // Redirect to login if not logged in
          navigate('/auth');
          return;
        }
        
        setUser(userResponse.data);

        // Fetch categories
        const categoriesResponse = await api.get('/categories');
        setCategories(categoriesResponse.data);
        
        // Fetch locations
        try {
          const filterOptions = await filtersAPI.getFilterOptions();
          if (filterOptions && filterOptions.locations && filterOptions.locations.length > 0) {
            setLocations(filterOptions.locations);
            console.log("Locations loaded from API:", filterOptions.locations);
          } else {
            console.log("No locations from API, using default list");
            setLocations(defaultLocations);
          }
        } catch (locErr) {
          console.error('Error fetching locations:', locErr);
          console.log("Using default locations due to error");
          setLocations(defaultLocations);
        }

        // If we have service data in location state, use that
        if (location.state?.service) {
          const { title, category_id, description, price, duration_minutes, is_available, location: serviceLocation } = location.state.service;
          setFormData({
            title,
            category_id,
            description,
            price,
            duration_minutes,
            is_available,
            location: serviceLocation || ''
          });
        } 
        // Otherwise, if in edit mode, fetch the service data
        else if (isEditMode) {
          try {
            const serviceResponse = await api.get(`/services/${id}`);
            const serviceData = serviceResponse.data;
            
            setFormData({
              title: serviceData.title,
              category_id: serviceData.category_id,
              description: serviceData.description,
              price: serviceData.price,
              duration_minutes: serviceData.duration_minutes,
              is_available: serviceData.is_available,
              location: serviceData.location || ''
            });
          } catch (serviceErr) {
            console.error('Error fetching service data:', serviceErr);
            setError(serviceErr.response?.data?.message || 'Failed to fetch service data');
          }
        }
        setLoading(false);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to fetch data');
        setLoading(false);
        if (err.response?.status === 401) {
          navigate('/auth');
        }
      }
    };
    
    fetchData();
  }, [navigate, id, location.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Add provider_id from logged in user
      const serviceData = {
        ...formData,
        provider_id: user.user_id
      };
      
      if (isEditMode) {
        // If id exists, update the existing service
        await api.put(`/services/${id}`, serviceData);
        alert('Service updated successfully!');
      } else {
        // Else create a new service
        serviceData.created_at = new Date().toISOString();
        await api.post('/services', serviceData);
        alert('Service created successfully!');
      }
  
      navigate('/my-services');
    } catch (err) {
      console.error('Error saving service:', err);
      setError(err.response?.data?.message || 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <section className="formsFormat">
        <h1>{isEditMode ? 'Edit Service' : 'Add your Service'}</h1>
        <div className="loading">Loading...</div>
      </section>
    );
  }
  
  if (error) {
    return (
      <section className="formsFormat">
        <h1>{isEditMode ? 'Edit Service' : 'Add your Service'}</h1>
        <div className="error">{error}</div>
      </section>
    );
  }
  
  return (
    <section className="formsFormat">
      <h1>{isEditMode ? 'Edit Service' : 'Add your Service'}</h1>
      
      <form className="service-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Service Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category_id">Category:</label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            required
            className="form-control"
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.category_id} value={category.category_id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="form-control"
            rows="4"
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="price">Price (pkr):</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="50"
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="duration_minutes">Duration (minutes):</label>
          <input
            type="number"
            id="duration_minutes"
            name="duration_minutes"
            value={formData.duration_minutes}
            onChange={handleChange}
            required
            min="15"
            step="15"
            className="form-control"
          />
        </div>
        
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="is_available"
            name="is_available"
            checked={formData.is_available}
            onChange={handleChange}
          />
          <label htmlFor="is_available">Service is currently available</label>
        </div>

        <div className="form-group">
          <label htmlFor="location">Location:</label>
          <select
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="form-control"
          >
            <option value="">Select a Location</option>
            {locations.map((location, index) => (
              <option key={index} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group provider-info">
          <p><strong>Provider:</strong> {user?.name}</p>
          <p><small>Service will be registered under your account</small></p>
        </div>
        
        <button type="submit" className="servicesubmit" disabled={loading}>
          {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Service' : 'Create Service')}
        </button>
      </form>
    </section>
  );
}

export default ServiceForm;