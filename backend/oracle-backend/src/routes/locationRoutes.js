const express = require("express")
const router = express.Router()
const locationController = require("../controllers/locationController")

// GET all locations
router.get("/", locationController.getAllLocations)

module.exports = router
