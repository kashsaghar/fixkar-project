import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, LogIn } from 'react-feather';
import ProviderSidebar from "./ProviderSidebar";
import SeekerSidebar from "./SeekerSidebar";
import AdminSidebar from "./AdminSidebar";
import api from '../../utils/api';

function Sidebar({ isOpen, toggleSidebar }) {
  
  const [user, setUser] = useState(null);
     useEffect(() => {
         // Get user info from localStorage
         const storedUser = JSON.parse(localStorage.getItem('user'));
         if (storedUser) {
           setUser(storedUser);
         }
       }, []);
       
  const isLoggedIn = !!localStorage.getItem('token') && user != null;

  useEffect(() => {
  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/user'); 
      setUser(response.data);
    } catch (err) {
      console.error(err);
    }
  };
  fetchUser();
}, []);

  
  const renderSidebarByRole = () => {
  if (!user) return null;
  
  switch (user.role) {
    case "provider":
      return <ProviderSidebar toggleSidebar={toggleSidebar} />;
    case "seeker":
      return <SeekerSidebar toggleSidebar={toggleSidebar} />;
    case "admin":
      return <AdminSidebar toggleSidebar={toggleSidebar} />;
    default:
      return null;
  }
};

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
            {isLoggedIn ? (
            <>
              {renderSidebarByRole()}
            </>
          ) : (
            <>
             <ul className="sidebar-menu">
            <li>
              <Link to="/" onClick={toggleSidebar}>Home</Link>
            </li>
            <li>
              <Link to="/about" onClick={toggleSidebar}>About Us</Link>
            </li>
            <li>
              <Link to="/contact" onClick={toggleSidebar}>Contact</Link>
            </li>
             </ul>
            </>
          )}
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
              <Link to="/auth" className="sidebar-footer-item" onClick={toggleSidebar}>
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