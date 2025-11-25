import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function ProviderSidebar({ toggleSidebar }) {
  
  return (
          <ul className="sidebar-menu">
           
            <li>
              <Link to="/add-service" onClick={toggleSidebar}>Add Service</Link>
            </li>

            <li>
              <Link to="/my-services" onClick={toggleSidebar}>My Services</Link>
            </li>
            
          </ul>
  );
}
export default ProviderSidebar;