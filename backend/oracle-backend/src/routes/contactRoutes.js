const express = require("express")
const router = express.Router()
const contactController = require("../controllers/contactController")

// POST new message
router.post("/", contactController.createMessage)

module.exports = router
