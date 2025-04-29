import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import genieImage from '../assets/genie-new.png';
import services from '../assets/services.png';
import equipmentImage from '../assets/High-Quality-and-latest-equipment.png';
import { useNavigate } from "react-router-dom";

function Home() {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const handleGetStarted = () => {
    navigate('/filters');
    // Force scroll to top
    window.scrollTo(0, 0);
  };
  
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-container')) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <main>
      <section className="hero">
        <div className="bg-wrapper" style={{ backgroundImage: `url(${genieImage})` }}></div>
        <div className="max-w-xl">
          <h3>Choro fikar, bus fix kar</h3>
          <div className="actions">
            <div className="input-container">
              <input type="text" placeholder="Enter your full address" />
              <svg aria-hidden="true" focusable="false" className="fl-none" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#000105" fillRule="evenodd" clipRule="evenodd" d="M12 2C12.4142 2 12.75 2.33579 12.75 2.75L12.7506 3.67925C12.7507 3.88008 12.8998 4.04968 13.0989 4.07562C13.1524 4.08259 13.1986 4.08909 13.2375 4.09514C16.6725 4.62856 19.3848 7.34731 19.9084 10.7855C19.9135 10.8188 19.9189 10.8575 19.9247 10.9019C19.9506 11.1011 20.1204 11.2502 20.3214 11.2502L21.25 11.25C21.6642 11.25 22 11.5858 22 12C22 12.4142 21.6642 12.75 21.25 12.75L20.3212 12.7506C20.1205 12.7507 19.951 12.8995 19.9249 13.0985C19.9211 13.1273 19.9175 13.1532 19.9141 13.1762C19.4013 16.6567 16.647 19.4078 13.1649 19.9158C13.145 19.9187 13.1228 19.9218 13.0984 19.925C12.8995 19.9511 12.7507 20.1206 12.7506 20.3213L12.75 21.25C12.75 21.6642 12.4142 22 12 22C11.5858 22 11.25 21.6642 11.25 21.25L11.2502 20.3213C11.2502 20.1203 11.1011 19.9505 10.9018 19.9246C10.8535 19.9183 10.8115 19.9124 10.7758 19.9069C7.33814 19.379 4.62167 16.6629 4.09327 13.2254C4.08776 13.1896 4.08184 13.1474 4.07552 13.0989C4.04958 12.8997 3.87997 12.7507 3.67912 12.7506L2.75 12.75C2.33579 12.75 2 12.4142 2 12C2 11.5858 2.33579 11.25 2.75 11.25L3.67818 11.2502C3.87895 11.2502 4.04865 11.1015 4.07487 10.9024C4.07777 10.8805 4.08053 10.8604 4.08317 10.8422C4.58738 7.36412 7.32923 4.61075 10.8016 4.08916C10.8307 4.08479 10.8642 4.08013 10.902 4.07519C11.1012 4.04909 11.2502 3.87936 11.2502 3.67848L11.25 2.75C11.25 2.33579 11.5858 2 12 2ZM12 5.5C8.41015 5.5 5.5 8.41015 5.5 12C5.5 15.5899 8.41015 18.5 12 18.5C15.5899 18.5 18.5 15.5899 18.5 12C18.5 8.41015 15.5899 5.5 12 5.5ZM12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8ZM12 9.5C10.6193 9.5 9.5 10.6193 9.5 12C9.5 13.3807 10.6193 14.5 12 14.5C13.3807 14.5 14.5 13.3807 14.5 12C14.5 10.6193 13.3807 9.5 12 9.5Z"></path>
              </svg>
            </div>
            <button className="fs">Find Services</button>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="stat">
          <h3>1200+</h3>
          <p>Users</p>
        </div>
        <div className="stat">
          <h3>800+</h3>
          <p>Service Providers</p>
        </div>
        <div className="stat">
          <h3>5000+</h3>
          <p>Completed Services</p>
        </div>
      </section>

      <section className="partners">
        <div className="caption">
          <p>One App</p>
          <p>Many Services</p>
        </div>
        <div className="pic-services">
          <div className="background-image" style={{ backgroundImage: `url(${equipmentImage})` }}></div>

          <div className="content">
            <p className="header-text">List Your Services on Our Platform</p>
            <p>
              Want to reach thousands of new customers looking for reliable service providers? We've got you covered!
            </p>
            <p>
              It's simple: showcase your services online, receive job requests, complete them efficiently, and grow your business with ease!
            </p>
            <p>
              Ready to get started? Join us today!
            </p>
            <div>
              {!isLoggedIn ? (
                <>
                  <button className="gsbutton" onClick={() => navigate("/auth")}>Get Started</button>
                </>
              ) : (
                <>
                  <button className="gsbutton" onClick={() => navigate("/add-service")}>Get Started</button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="pic-services2">
          <div className="background-image" style={{ backgroundImage: `url(${services})` }}></div>

          <div className="content">
            <p className="header-text">Book Trusted Services in Minutes</p>
            <p>
              Need a reliable service provider? Whether it’s plumbing, cleaning, repairs, or more — we’ve got the right professional for you!
            </p>
            <p>
              It’s easy: browse available services, make a booking in just a few clicks, and get the job done hassle-free.
            </p>
            <p>
              Ready to book? Find your expert now!
            </p>
            <div>
              {!isLoggedIn ? (
                <>
                  <button className="gsbutton" onClick={() => navigate("/auth")}>Get Started</button>
                </>
              ) : (
                <>
                  <button className="gsbutton" onClick={() => navigate("/filters")}>Get Started</button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;