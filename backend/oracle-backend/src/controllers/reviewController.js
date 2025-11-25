const reviewModel = require("../models/reviewModel")

// Get reviews for a service
const getServiceReviews = async (req, res) => {
  try {
    const reviewRows = await reviewModel.getReviewsByServiceId(req.params.serviceId)

    const reviews = reviewRows.map((row) => ({
      review_id: row[0],
      rating: row[1],
      comment: row[2],
      review_date: row[3],
      user_name: row[4],
    }))

    res.json(reviews)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ error: err.message })
  }
}

// Create review
const createReview = async (req, res) => {
  if (req.user.role !== "seeker") {
    return res.status(403).json({ message: "Only customers can leave reviews" })
  }

  const { booking_id, rating, comment } = req.body

  try {
    // Check if booking exists and belongs to user
    const bookingRow = await reviewModel.getBookingForReview(booking_id)
    if (!bookingRow) {
      return res.status(404).json({ message: "Booking not found" })
    }

    const bookingStatus = bookingRow[0]
    const bookingUserId = bookingRow[1]

    // Check authorization
    if (req.user.id !== bookingUserId) {
      return res.status(403).json({ message: "Not authorized to review this booking" })
    }

    // Check if booking is completed
    if (bookingStatus !== "completed") {
      return res.status(400).json({ message: "Can only review completed bookings" })
    }

    // Check if review already exists
    if (await reviewModel.reviewExists(booking_id)) {
      return res.status(400).json({ message: "Review already exists for this booking" })
    }

    // Create review
    const reviewId = await reviewModel.createReview(booking_id, rating, comment)

    res.status(201).json({
      message: "Review submitted successfully",
      review_id: reviewId,
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  getServiceReviews,
  createReview,
}
