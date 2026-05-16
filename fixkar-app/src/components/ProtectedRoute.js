import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '../utils/api';

// This component wraps routes that require authentication
function ProtectedRoute({ children, requiredRole = null }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        // Set default authorization header for all requests
        api.defaults.headers.common['x-auth-token'] = token;
        
        // Verify token by getting current user
        const response = await api.get('/auth/user');
        setUser(response.data);
        setIsAuthenticated(true);
        setLoading(false);
      } catch (err) {
        console.error('Authentication check failed:', err);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  if (loading) {
    return <div className="loading">Checking authentication...</div>;
  }
  
  if (!isAuthenticated) {
    // Redirect to login page and save the intended destination
    return <Navigate to="/auth" state={{ from: location.pathname, requiredRole }} replace />;
  }
  
  // Check if a specific role is required
  if (requiredRole && user.role !== requiredRole) {
  return (
      <Navigate
        to="/unauthorized"
        state={{ requiredRole }}
        replace
      />
    );
  }
  return children;
}

export default ProtectedRoute;