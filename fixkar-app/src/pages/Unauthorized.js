import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Unauthorized() {
  const location = useLocation();
  
  // Get required role passed from ProtectedRoute
  const requiredRole = location.state?.requiredRole;

  const message = requiredRole
    ? `You must be logged in as a ${requiredRole} to view this page.`
    : "You don't have permission to access this page.";

  return (
    <section className="unauthorized-page">
      <div className="unauthorized-container">
        <h1>Access Denied</h1>
        <p>{message}</p>

        <div className="unauthorized-actions">
          <Link to="/" className="btn-secondary" >
            Go to Home
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Unauthorized;
