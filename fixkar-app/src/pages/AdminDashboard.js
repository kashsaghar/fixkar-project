"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { adminAPI } from "../utils/api"
import "../App.css"

function AdminDashboard() {
  const [stats, setStats] = useState(null)
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

    fetchDashboardStats()
  }, [navigate])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const data = await adminAPI.getDashboardStats()
      setStats(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching stats:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, color }) => (
    <div className={`stat-card stat-${color}`}>
      <h3>{title}</h3>
      <p className="stat-value">{value}</p>
    </div>
  )

  if (loading) return <div className="admin-loading">Loading dashboard...</div>
  if (error) return <div className="admin-error">Error: {error}</div>

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back! Here's your platform overview.</p>
      </div>

      <div className="dashboard-stats">
        <StatCard title="Total Users" value={stats?.totalUsers || 0} color="blue" />
        <StatCard title="Service Providers" value={stats?.totalProviders || 0} color="green" />
        <StatCard title="Service Seekers" value={stats?.totalSeekers || 0} color="purple" />
        <StatCard title="Total Bookings" value={stats?.totalBookings || 0} color="orange" />
      </div>

      <div className="dashboard-additional-stats">
        <StatCard title="Completed Bookings" value={stats?.completedBookings || 0} color="teal" />
        <StatCard title="Pending Complaints" value={stats?.pendingComplaints || 0} color="red" />
      </div>

      <div className="dashboard-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="action-btn" onClick={() => navigate("/admin/users")}>
            Manage Users
          </button>
          <button className="action-btn" onClick={() => navigate("/admin/services")}>
            Manage Services
          </button>
          <button className="action-btn" onClick={() => navigate("/admin/bookings")}>
            View Bookings
          </button>
          <button className="action-btn" onClick={() => navigate("/admin/complaints")}>
            Handle Complaints
          </button>
          <button className="action-btn" onClick={() => navigate("/admin/reviews")}>
            Moderate Reviews
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
