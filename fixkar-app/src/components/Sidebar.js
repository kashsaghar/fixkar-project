import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, LogIn } from 'react-feather';

function Sidebar({ isOpen, toggleSidebar }) {
  const isLoggedIn = !!localStorage.getItem('token');
  
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>FixKar</h3>
          <button className="close-btn" onClick={toggleSidebar}>&times;</button>
        </div>

        <div className="sidebar-content">
          <ul className="sidebar-menu">
            <li>
              <Link to="/" onClick={toggleSidebar}>Home</Link>
            </li>
            <li>
              <Link to="/about" onClick={toggleSidebar}>About Us</Link>
            </li>
            <li>
              <Link to="/filters" onClick={toggleSidebar}>Filters</Link>
            </li>
            <li>
              <Link to="/contact" onClick={toggleSidebar}>Contact</Link>
            </li>
            <li>
              <Link to="/add-service" onClick={toggleSidebar}>Add Service</Link>
            </li>
            <li>
              <Link to="/filters" onClick={toggleSidebar}>Book Service</Link>
            </li>
            <li>
              <Link to="/my-services" onClick={toggleSidebar}>My Services</Link>
            </li>
            {/* <li>
            
              <Link to="/auth" onClick={toggleSidebar}>
                <LogIn size={18} style={{ marginRight: '8px' }} /> Login / Sign Up </Link>
               
            </li>  */}
          </ul>
        </div>

        <div className="sidebar-footer">
          {isLoggedIn ? (
            <>
              <Link to="/profile" className="sidebar-footer-item" onClick={toggleSidebar}>
                <User size={18} />
                <span>Profile</span>
              </Link>
              <Link to="/settings" className="sidebar-footer-item" onClick={toggleSidebar}>
                <Settings size={18} />
                <span>Settings</span>
              </Link>
            </>
          ) : (
            <>
              {/* You can show something else here if you want */}
              <Link to="/login" className="sidebar-footer-item" onClick={toggleSidebar}>
                <User size={18} />
                <span>Login</span>
              </Link>
            </>
          )}
        </div>

      </div>
    </>
  );
}

export default Sidebar;