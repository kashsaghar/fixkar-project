const locationModel = require("../models/locationModel")

// Get all locations
const getAllLocations = async (req, res) => {
  try {
    const locations = await locationModel.getAllLocations()
    res.json(locations)
  } catch (err) {
    console.error("Error fetching locations:", err)
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  getAllLocations,
}
