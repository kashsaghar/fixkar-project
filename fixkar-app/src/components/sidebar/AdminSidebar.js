import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function AdminSidebar({ toggleSidebar }) {
  
  return (
          <ul className="sidebar-menu">

            <li>
              <Link to="/admin" onClick={toggleSidebar}>My Dashboard</Link>
            </li>
            <li>
              <Link to="/admin/bookings" onClick={toggleSidebar}>Bookings</Link>
            </li>

            <li>
              <Link to="/admin/users" onClick={toggleSidebar}>Users</Link>
            </li>

            <li>
              <Link to="/admin/services" onClick={toggleSidebar}>Services</Link>
            </li>
              <li>
              <Link to="/admin/reviews" onClick={toggleSidebar}>reviews</Link>
            </li>

            <li>
              <Link to="/admin/complaints" onClick={toggleSidebar}>complaints</Link>
            </li>
            
          </ul>
  );
}
export default AdminSidebar;