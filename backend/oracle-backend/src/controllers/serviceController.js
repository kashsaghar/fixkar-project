const serviceModel = require("../models/serviceModel")

// Get all services
const getAllServices = async (req, res) => {
  try {
    const serviceRows = await serviceModel.getAllServices()

    const services = serviceRows.map((row) => ({
      service_id: row[0],
      title: row[1],
      description: row[2],
      price: row[3],
      duration_minutes: row[4],
      is_available: row[5],
      provider_id: row[6],
      category_id: row[7],
      created_at: row[8],
      location: row[9],
    }))

    res.json(services)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ error: err.message })
  }
}

// Get service by ID
const getService = async (req, res) => {
  try {
    const serviceRow = await serviceModel.getServiceById(req.params.id)

    if (!serviceRow) {
      return res.status(404).json({ message: "Service not found" })
    }

    const service = {
      service_id: serviceRow[0],
      title: serviceRow[1],
      description: serviceRow[2],
      price: serviceRow[3],
      duration_minutes: serviceRow[4],
      is_available: serviceRow[5],
      provider_id: serviceRow[6],
      category_id: serviceRow[7],
      created_at: serviceRow[8],
      location: serviceRow[9],
    }

    res.json(service)
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ error: err.message })
  }
}

// Create service
const createService = async (req, res) => {
  if (req.user.role !== "provider") {
    return res.status(403).json({ message: "Only service providers can add services" })
  }

  const { title, description, price, duration_minutes, category_id, location } = req.body

  try {
    const serviceId = await serviceModel.createService(
      title,
      description,
      price,
      duration_minutes,
      category_id,
      location,
      req.user.id,
    )

    res.status(201).json({
      message: "Service created successfully",
      service_id: serviceId,
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ error: err.message })
  }
}

// Update service
const updateService = async (req, res) => {
  try {
    const providerId = await serviceModel.getServiceAuthInfo(req.params.id)

    if (!providerId) {
      return res.status(404).json({ message: "Service not found" })
    }

    // Check authorization
    if (req.user.id !== providerId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this service" })
    }

    const { title, description, price, duration_minutes, is_available, category_id, location } = req.body

    await serviceModel.updateService(
      req.params.id,
      title,
      description,
      price,
      duration_minutes,
      is_available,
      category_id,
      location,
    )

    res.json({ message: "Service updated successfully" })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ error: err.message })
  }
}

// Delete service
const deleteService = async (req, res) => {
  try {
    const providerId = await serviceModel.getServiceAuthInfo(req.params.id)

    if (!providerId) {
      return res.status(404).json({ message: "Service not found" })
    }

    // Check authorization
    if (req.user.id !== providerId && req.user.role !== "provider") {
      return res.status(403).json({ message: "Not authorized to delete this service" })
    }

    await serviceModel.deleteService(req.params.id)

    res.json({ message: "Service deleted successfully" })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ error: err.message })
  }
}

// Get services by provider
const getProviderServices = async (req, res) => {
  console.log("ROLE FROM TOKEN:", req.user.role);

  if (req.user.role?.trim().toLowerCase() !== "provider") {
    return res.status(403).json({ message: "Only service providers can access this endpoint" })
  }

  try {
    const serviceRows = await serviceModel.getServicesByProviderId(req.user.id)

    const services = serviceRows.map((row) => ({
      service_id: row[0],
      title: row[1],
      description: row[2],
      price: row[3],
      duration_minutes: row[4],
      is_available: row[5],
      provider_id: row[6],
      category_id: row[7],
      created_at: row[8],
      location: row[9],
    }))

    res.json(services)
  } catch (err) {
    console.error("services error: ",err)
    res.status(500).json({ error: err.message })
  }
}

const getServiceProvider = async (req, res) => {
  try {
    const serviceId = req.params.id

    const providerRows = await serviceModel.getProviderBySId(serviceId)

    if (providerRows.length === 0) {
      return res.status(404).json({ message: "Provider not found for this service" })
    }

    const row = providerRows[0]

    const provider = {
      user_id: row[0],
      name: row[1],
      email: row[2],
      phone: row[3],
      role: row[4],
    }

    res.json(provider)

  } catch (err) {
    console.error("Error fetching provider:", err)
    res.status(500).json({ error: err.message })
  }
}


// Update service availability
const updateServiceAvailability = async (req, res) => {
  try {
    const { is_available } = req.body

    if (typeof is_available !== "boolean") {
      return res.status(400).json({ message: "is_available must be boolean" })
    }

    const providerId = await serviceModel.getServiceAuthInfo(req.params.id)

    if (!providerId) {
      return res.status(404).json({ message: "Service not found" })
    }

    if (req.user.id !== providerId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this service" })
    }

    await serviceModel.updateServiceAvailability(req.params.id, is_available)

    res.json({ message: `Service marked as ${is_available ? "available" : "unavailable"}` })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  getAllServices,
  getService,
  createService,
  updateService,
  deleteService,
  getProviderServices,
  getServiceProvider,
  updateServiceAvailability,
}
