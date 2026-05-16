import React, { useState } from 'react';
import {contactAPI} from '../utils/api';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatus(null);

    try{
      const response = await contactAPI.createMessage(formData);
    setStatus(response.message);
    setFormData({
      name: '',
      email: '',
      message: ''
    });
  } catch (err) {
    console.error('Error submitting message:', err);
    setError(err.message || 'Failed to submit message');
  } finally {
    setLoading(false);
  }
};

  return (
    <section className="formsFormat">
      <h2>Contact Us</h2>
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input 
          className="name" 
          type="text" 
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your Name" 
          required
        />
        
        <label>Email:</label>
        <input 
          className="email" 
          type="email" 
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Your Email" 
          required
        />
        
        <label>Message:</label>
        <textarea 
          name="message"
          type="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Your Message" 
          required
        ></textarea>

        
  {status && <p style={{ color: "green" }}>{status}</p>}
  {error && <p style={{ color: "red" }}>{error}</p>}

        
        <button type="submit">Send</button>
      </form>
    </section>
  );
}

export default Contact;