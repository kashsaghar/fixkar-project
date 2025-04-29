import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';

function Settings() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }
    
    // Fetch user data
    // This is a placeholder - replace with your actual API call
    const fetchUserData = async () => {
      try {
        // Simulating API call
        const userData = JSON.parse(localStorage.getItem('user')) || {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          address: '123 Main St, City, Country'
        };
        
        setFormData(prevState => ({
          ...prevState,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          address: userData.address
        }));
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      alert("New passwords don't match");
      return;
    }
    
    try {
      // Simulating API call to update user data
      // In a real app, you would send this to your backend
      localStorage.setItem('user', JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      }));
      
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Account Settings</h1>
        <div className="settings-actions">
          <button className="back-btn" onClick={() => navigate('/profile')}>
            Back to Profile
          </button>
          <LogoutButton className="settings-logout-btn" />
        </div>
      </div>
      
      <div className="settings-content">
        <form onSubmit={handleSubmit}>
          <div className="settings-section">
            <h3>Personal Information</h3>
            
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>
          </div>
          
          <div className="settings-section">
            <h3>Change Password</h3>
            
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="settings-section">
            <h3>Notification Preferences</h3>
            
            <div className="form-check">
              <input
                type="checkbox"
                id="emailNotifications"
                name="emailNotifications"
                defaultChecked
              />
              <label htmlFor="emailNotifications">Email Notifications</label>
            </div>
            
            <div className="form-check">
              <input
                type="checkbox"
                id="smsNotifications"
                name="smsNotifications"
                defaultChecked
              />
              <label htmlFor="smsNotifications">SMS Notifications</label>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="save-btn">Save Changes</button>
          </div>
        </form>
        
        <div className="danger-zone">
          <h3>Danger Zone</h3>
          <button className="delete-account-btn">Delete Account</button>
        </div>
      </div>
    </div>
  );
}

export default Settings;