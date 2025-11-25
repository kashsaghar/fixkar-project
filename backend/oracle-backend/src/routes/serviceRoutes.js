const express = require("express")
const router = express.Router()
const serviceController = require("../controllers/serviceController")
const auth = require("../middleware/auth")

// GET all services
router.get("/", serviceController.getAllServices)

// GET service by ID
router.get("/:id", serviceController.getService)

// POST new service
router.post("/", auth, serviceController.createService)

// PUT update service
router.put("/:id", auth, serviceController.updateService)

// DELETE service
router.delete("/:id", auth, serviceController.deleteService)

// GET services by provider
router.get("/provider/me", auth, serviceController.getProviderServices)

// PATCH only service availability
router.patch("/:id/availability", auth, serviceController.updateServiceAvailability)

module.exports = router
