"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { adminAPI } from "../utils/api"
import "../App.css"

function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteModal, setDeleteModal] = useState(false)
  const [selectedReview, setSelectedReview] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user")) || {}

    if (!token || user.role !== "admin") {
      navigate("/unauthorized")
      return
    }

    fetchReviews()
  }, [navigate])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const data = await adminAPI.getAllReviews()
      setReviews(Array.isArray(data) ? data : data.reviews || [])
      setError(null)
    } catch (err) {
      console.error("Error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    try {
      await adminAPI.deleteReview(reviewId)
      fetchReviews()
      setDeleteModal(false)
      alert("Review deleted successfully")
    } catch (err) {
      console.error("Error:", err)
      alert(`Error: ${err.message}`)
    }
  }

  const ReviewRow = ({ review }) => (
    <tr key={review.review_id}>
      <td>{review.review_id}</td>
      <td>
        <div className="rating">{"⭐".repeat(review.rating)}</div>
      </td>
      <td>{review.reviewer_name}</td>
      <td>{review.service_title}</td>
      <td className="review-comment">{review.comments?.substring(0, 50)}...</td>
      <td>
        <button
          className="btn-delete-review"
          onClick={() => {
            setSelectedReview(review)
            setDeleteModal(true)
          }}
        >
          Delete
        </button>
      </td>
    </tr>
  )

  if (loading) return <div className="admin-loading">Loading reviews...</div>
  if (error) return <div className="admin-error">Error: {error}</div>

  return (
    <div className="admin-reviews">
      <div className="admin-header">
        <h1>Review Moderation</h1>
        <p>Total Reviews: {reviews.length}</p>
      </div>

      <div className="reviews-table">
        <table>
          <thead>
            <tr>
              <th>Review ID</th>
              <th>Rating</th>
              <th>Reviewer</th>
              <th>Service</th>
              <th>Comment</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <ReviewRow key={review.review_id} review={review} />
            ))}
          </tbody>
        </table>
      </div>

      {deleteModal && selectedReview && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Review</h3>
            <p>Are you sure you want to delete this review?</p>
            <p className="review-detail">"{selectedReview.comments}"</p>
            <div className="modal-actions">
              <button className="btn-confirm" onClick={() => handleDeleteReview(selectedReview.review_id)}>
                Delete
              </button>
              <button className="btn-cancel" onClick={() => setDeleteModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminReviews
