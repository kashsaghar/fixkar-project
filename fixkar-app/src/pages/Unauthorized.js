import React from 'react';
import { Link } from 'react-router-dom';

function Unauthorized() {
  return (
    <section className="unauthorized-page">
      <div className="unauthorized-container">
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <div className="unauthorized-actions">
          <Link to="/" className="btn-primary">Go to Home</Link>
        </div>
      </div>
    </section>
  );
}

export default Unauthorized;