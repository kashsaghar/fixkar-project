const express = require("express")
const router = express.Router()
const complaintController = require("../controllers/complaintController")
const auth = require("../middleware/auth")

// POST new complaint
router.post("/", auth, complaintController.createComplaint)

// GET complaints for current user
router.get("/me", auth, complaintController.getUserComplaints)

module.exports = router
