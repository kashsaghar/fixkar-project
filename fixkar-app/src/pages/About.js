import React from 'react';

function About() {
  return (
    <section className="about-section" id="about">
      <div className="about-container">
        <div className="about-box">
          <div className="about-header">
            <h2>About FixKar</h2>
            <div className="section-divider"></div>
          </div>

          <div className="about-content">
            <div className="about-text">
              <p>
                FixKar is a one-stop solution for all your service needs. We connect service providers with customers
                looking for quality services in Karachi and beyond.
              </p>
              <p>
                Our platform makes it easy to find reliable professionals for any job you need done, from plumbing and
                electrical work to cleaning and more.
              </p>
              <p>
                With our user-friendly interface, you can quickly browse through service providers, check their
                ratings, and book services with just a few clicks.
              </p>
            </div>

            <div className="about-features">
              <div className="feature">
                <div className="feature-icon">👥</div>
                <div className="feature-text">
                  <h4>Verified Providers</h4>
                  <p>All our service providers are thoroughly vetted and verified.</p>
                </div>
              </div>

              <div className="feature">
                <div className="feature-icon">⭐</div>
                <div className="feature-text">
                  <h4>Quality Service</h4>
                  <p>We ensure high-quality service through our rating system.</p>
                </div>
              </div>

              <div className="feature">
                <div className="feature-icon">⏱️</div>
                <div className="feature-text">
                  <h4>Quick Response</h4>
                  <p>Get quick responses to your service requests.</p>
                </div>
              </div>

              <div className="feature">
                <div className="feature-icon">🛡️</div>
                <div className="feature-text">
                  <h4>Secure Platform</h4>
                  <p>Your data and transactions are always secure with us.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
