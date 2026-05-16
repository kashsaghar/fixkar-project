"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { adminAPI } from "../utils/api"
import "../App.css"

function AdminComplaints() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [statusModal, setStatusModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user")) || {}

    if (!token || user.role !== "admin") {
      navigate("/unauthorized")
      return
    }

    fetchComplaints()
  }, [navigate])

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const data = await adminAPI.getAllComplaints()
      setComplaints(Array.isArray(data) ? data : data.complaints || [])
      setError(null)
    } catch (err) {
      console.error("Error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      await adminAPI.updateComplaintStatus(complaintId, newStatus)
      fetchComplaints()
      setStatusModal(false)
      alert("Complaint status updated successfully")
    } catch (err) {
      console.error("Error:", err)
      alert(`Error: ${err.message}`)
    }
  }

  const ComplaintRow = ({ complaint }) => (
    <tr key={complaint.complaint_id}>
      <td>{complaint.complaint_id}</td>
      <td>{complaint.created_at}</td>
      <td>{complaint.complainant_name}</td>
      <td>{complaint.provider_name}</td>
      <td className="complaint-description">{complaint.description?.substring(0, 50)}...</td>
      <td>
        <span
          className={`status-badge ${complaint.status === "pending" ? "status-pending" : complaint.status === "resolved" ? "status-completed" : "status-cancelled"}`}
        >
          {complaint.status}
        </span>
      </td>
      <td>
        <button
          className="action-btn-small"
          onClick={() => {
            setSelectedComplaint(complaint)
            setStatusModal(true)
          }}
        >
          Update Status
        </button>
      </td>
    </tr>
  )

  if (loading) return <div className="admin-loading">Loading complaints...</div>
  if (error) return <div className="admin-error">Error: {error}</div>

  return (
    <div className="admin-complaints">
      <div className="admin-header">
        <h1>Complaint Management</h1>
        <p>Total Complaints: {complaints.length}</p>
      </div>

      <div className="complaints-table">
        <table>
          <thead>
            <tr>
              <th>Complaint ID</th>
              <th>Date</th>
              <th>Complaint</th>
              <th>Provider</th>
              <th>Description</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((complaint) => (
              <ComplaintRow key={complaint.complaint_id} complaint={complaint} />
            ))}
          </tbody>
        </table>
      </div>

      {statusModal && selectedComplaint && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Update Complaint Status</h3>
            <p>Complaint ID: {selectedComplaint.complaint_id}</p>
            <p className="complaint-detail">"{selectedComplaint.description}"</p>
            <div className="status-options">
              {["pending", "resolved", "rejected"].map((status) => (
                <button
                  key={status}
                  className="status-option-btn"
                  onClick={() => handleStatusChange(selectedComplaint.complaint_id, status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
            <button className="btn-cancel" onClick={() => setStatusModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminComplaints
