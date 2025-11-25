const express = require("express")
const router = express.Router()
const filterController = require("../controllers/filterController")

// GET filtered services
router.get("/", filterController.getFilteredServices)

// GET available filter options (for dropdowns)
router.get("/options", filterController.getFilterOptions)

module.exports = router
