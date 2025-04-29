import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';

function Profile() {
  const [user, setUser] = useState(null);
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
        // In a real app, you would fetch from your backend
        const userData = JSON.parse(localStorage.getItem('user')) || {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          address: '123 Main St, City, Country',
          joinDate: 'January 2023'
        };
        
        setUser(userData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <div className="profile-actions">
          <button className="edit-profile-btn" onClick={() => navigate('/settings')}>
            Edit Profile
          </button>
          <LogoutButton className="profile-logout-btn" />
        </div>
      </div>
      
      <div className="profile-content">
        <div className="profile-avatar">
          {/* If you have user avatar, use it here */}
          <div className="avatar-placeholder">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
        
        <div className="profile-details">
          <div className="detail-group">
            <h3>Personal Information</h3>
            <div className="detail-item">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{user?.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{user?.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Phone:</span>
              <span className="detail-value">{user?.phone}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Address:</span>
              <span className="detail-value">{user?.address}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Member Since:</span>
              <span className="detail-value">{user?.joinDate}</span>
            </div>
          </div>
          
          {/* Add more sections as needed */}
          <div className="detail-group">
            <h3>Account Activity</h3>
            <div className="detail-item">
              <span className="detail-label">Last Login:</span>
              <span className="detail-value">Today</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Services Booked:</span>
              <span className="detail-value">5</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Services Provided:</span>
              <span className="detail-value">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;