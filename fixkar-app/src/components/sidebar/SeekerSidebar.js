import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function SeekerSidebar({ toggleSidebar }) {
  
  return (
          <ul className="sidebar-menu">
            <li>
              <Link to="/filters" onClick={toggleSidebar}>Book Service</Link>
            </li>
            <li>
              <Link to="/my-bookings" onClick={toggleSidebar}>My bookings</Link>
            </li>
          </ul>
  );
}
export default SeekerSidebar;