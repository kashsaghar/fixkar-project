import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';


function LogoutButton({ className }) {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await authAPI.logout(); 
      navigate('/auth');      
      alert('You have been successfully logged out');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };
  
  return (
    <button 
      onClick={handleLogout} 
      className={`logout-button ${className || ''}`}
    >
      Logout
    </button>
  );
}

export default LogoutButton;