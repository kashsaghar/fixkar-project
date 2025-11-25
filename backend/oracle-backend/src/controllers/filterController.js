const filterModel = require("../models/filterModel")

// Get filtered services
const getFilteredServices = async (req, res) => {
  try {
    console.log("Filter request received with query params:", req.query)

    const { search, category, location, minPrice, maxPrice, minRating, sortBy } = req.query

    const serviceRows = await filterModel.getFilteredServices({
      search,
      category,
      location,
      minPrice,
      maxPrice,
      minRating,
      sortBy,
    })

    console.log(`Query executed successfully. Returned ${serviceRows.length} rows.`)

    const services = serviceRows.map((row) => ({
      service_id: row.SERVICE_ID,
      title: row.TITLE,
      description: row.DESCRIPTION,
      price: row.PRICE,
      duration_minutes: row.DURATION_MINUTES,
      is_available: row.IS_AVAILABLE === 1,
      provider_id: row.PROVIDER_ID,
      category_id: row.CATEGORY_ID,
      created_at: row.CREATED_AT,
      provider_name: row.PROVIDER_NAME,
      category_name: row.CATEGORY_NAME,
      location: row.LOCATION,
      average_rating: row.AVERAGE_RATING,
      rating_count: row.RATING_COUNT,
      image_url: row.IMAGE_URL,
      has_special_offer: row.HAS_SPECIAL_OFFER === 1,
    }))

    console.log("Sending response with services data")
    res.json(services)
  } catch (err) {
    console.error("Error in filter controller:", err)
    res.status(500).json({
      error: err.message,
      code: err.code || "UNKNOWN",
    })
  }
}

// Get filter options
const getFilterOptions = async (req, res) => {
  try {
    const filterOptions = await filterModel.getFilterOptions()
    res.json(filterOptions)
  } catch (err) {
    console.error("Error fetching filter options:", err.message)
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  getFilteredServices,
  getFilterOptions,
}
