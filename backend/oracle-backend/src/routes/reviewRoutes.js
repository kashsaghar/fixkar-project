const express = require("express")
const router = express.Router()
const reviewController = require("../controllers/reviewController")
const auth = require("../middleware/auth")

// GET reviews for a service
router.get("/service/:serviceId", reviewController.getServiceReviews)

// POST new review
router.post("/", auth, reviewController.createReview)

module.exports = router
