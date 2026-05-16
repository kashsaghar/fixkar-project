"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {adminAPI} from "../utils/api"
import "../App.css"

function AdminServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user")) || {}

    if (!token || user.role !== "admin") {
      navigate("/unauthorized")
      return
    }

    fetchAllServices()
  }, [navigate])

  const fetchAllServices = async () => {
    try {
      setLoading(true)
      const allData = await adminAPI.getAllServices()
      const parsed = Array.isArray(allData) ? allData : allData.services || []
      setServices(parsed)
      setError(null)
    } catch (err) {
      console.error("Error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  
 const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }
    
    try {
      await adminAPI. rejectService(serviceId);
      
      // Remove the service from the state
      setServices(services.filter(service => service.service_id !== serviceId));
      
      alert('Service deleted successfully');
    } catch (err) {
      console.error('Error deleting service:', err);
      alert('Failed to delete service');
    }
  };

  const ServiceRow = ({ service }) => (
    <tr key={service.service_id}>
      <td>{service.title}</td>
      <td>pkr {service.price}</td>
      <td>{service.provider_name || "N/A"}</td>
      <td>{service.booking_count || 0} bookings</td>

      <td>
        <div className="service-actions">

          {/* Delete Button */}
          <button
            className="btn-delete"
            onClick={() => handleDeleteService(service.service_id)}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  )

  if (loading) return <div className="admin-loading">Loading services...</div>
  if (error) return <div className="admin-error">Error: {error}</div>

  return (
    <div className="admin-services">
      <div className="admin-header">
        <h1>All Services</h1>
      </div>

      <div className="services-table">
        <table>
          <thead>
            <tr>
              <th>Service Title</th>
              <th>Price</th>
              <th>Provider</th>
              <th>Bookings</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {services.map((service) => (
              <ServiceRow key={service.service_id} service={service} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminServices
