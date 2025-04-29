import React from 'react';
import { useNavigate } from 'react-router-dom';

function LogoutButton({ className }) {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // Clear authentication token
    localStorage.removeItem('token');
    
    // You might also want to clear any other user-related data
    localStorage.removeItem('user');
    
    // Redirect to home page
    navigate('/');
    
    // Optional: Show a logout success message
    alert('You have been successfully logged out');
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