import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';
import api from '../utils/api';


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
  }, [navigate]);

    useEffect(() => {
  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/user'); 
      setUser(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false); 
    }
  };
  fetchUser();
}, []);
  
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
          <div className="avatar-placeholder">
            {user.name?.charAt(0) || 'U'}
          </div>
        </div>
        
        <div className="profile-details">
          <div className="detail-group">
            <h3>Personal Information</h3>
            <div className="detail-item">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{user.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{user.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Phone:</span>
              <span className="detail-value">{user.phone}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Role: </span>
              <span className="detail-value">{user.role}</span>
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