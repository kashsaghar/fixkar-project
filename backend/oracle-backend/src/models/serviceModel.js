const connect = require("../config/db")
const oracledb = require("oracledb")

// Get all available services
const getAllServices = async () => {
  const conn = await connect()
  try {
    const result = await conn.execute(`
      SELECT s.service_id, s.title, s.description, s.price, s.duration_minutes, 
             s.is_available, s.provider_id, s.category_id, s.created_at,
            s.location, u.name as provider_name, c.name as category_name
      FROM services s
      JOIN users u ON s.provider_id = u.user_id
      JOIN categories c ON s.category_id = c.category_id
      WHERE s.is_available = 1
      ORDER BY s.created_at DESC
    `)
    return result.rows
  } finally {
    await conn.close()
  }
}

// Get service by ID
const getServiceById = async (serviceId) => {
  const conn = await connect()
  try {
    const result = await conn.execute(
      `
      SELECT s.service_id, s.title, s.description, s.price, s.duration_minutes, 
             s.is_available, s.provider_id, s.category_id, s.created_at, 
              s.location, u.name as provider_name, c.name as category_name
      FROM services s
      JOIN users u ON s.provider_id = u.user_id
      JOIN categories c ON s.category_id = c.category_id
      WHERE s.service_id = :1
    `,
      [serviceId],
    )
    return result.rows.length > 0 ? result.rows[0] : null
  } finally {
    await conn.close()
  }
}

// Create service
const createService = async (title, description, price, durationMinutes, categoryId, location, providerId) => {
  const conn = await connect()
  try {
    const result = await conn.execute(
      `INSERT INTO services (title, description, price, duration_minutes, is_available, provider_id, category_id, location) 
       VALUES (:1, :2, :3, :4, :5, :6, :7, :8)
       RETURNING service_id INTO :9`,
      [
        title,
        description,
        price,
        durationMinutes,
        0,
        providerId,
        categoryId,
        location,
        { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      ],
      { autoCommit: true },
    )
    return result.outBinds[0][0]
  } finally {
    await conn.close()
  }
}

// Get service for authorization
const getServiceAuthInfo = async (serviceId) => {
  const conn = await connect()
  try {
    const result = await conn.execute(`SELECT provider_id FROM services WHERE service_id = :1`, [serviceId])
    return result.rows.length > 0 ? result.rows[0][0] : null
  } finally {
    await conn.close()
  }
}

// Update service
const updateService = async (
  serviceId,
  title,
  description,
  price,
  durationMinutes,
  isAvailable,
  categoryId,
  location,
) => {
  const conn = await connect()
  try {
    await conn.execute(
      `UPDATE services 
       SET title = :1, description = :2, price = :3, duration_minutes = :4, 
           is_available = :5, category_id = :6, location = :7
       WHERE service_id = :8`,
      [title, description, price, durationMinutes, isAvailable ? 1 : 0, categoryId, location, serviceId],
      { autoCommit: true },
    )
  } finally {
    await conn.close()
  }
}

// Delete service
const deleteService = async (serviceId) => {
  const conn = await connect()
  try {
    await conn.execute(`DELETE FROM services WHERE service_id = :1`, [serviceId], { autoCommit: true })
  } finally {
    await conn.close()
  }
}

// Get services by provider
const getServicesByProviderId = async (providerId) => {
  const conn = await connect()
  try {
    const result = await conn.execute(
      `
      SELECT s.service_id, s.title, s.description, s.price, s.duration_minutes, 
             s.is_available, s.provider_id, s.category_id, s.created_at,
              s.location
      FROM services s
      JOIN categories c ON s.category_id = c.category_id
      WHERE s.provider_id = :1
      ORDER BY s.created_at DESC
    `,
      [providerId],
    )
    return result.rows
  } finally {
    await conn.close()
  }
}
const getProviderBySId = async (serviceId) => {
  const conn = await connect()
  try {
    const result = await conn.execute(
      `
      SELECT u.user_id, u.name , u.email, u.phone, u.role
      FROM users u
      JOIN services s ON u.user_id = s.provider_id
      WHERE s.service_id = :1
      ORDER BY s.created_at DESC
    `,
      [serviceId],
    )
    return result.rows
  } finally {
    await conn.close()
  }
}

// Update service availability
const updateServiceAvailability = async (serviceId, isAvailable) => {
  const conn = await connect()
  try {
    await conn.execute(
      `UPDATE services SET is_available = :1 WHERE service_id = :2`,
      [isAvailable ? 1 : 0, serviceId],
      { autoCommit: true },
    )
  } finally {
    await conn.close()
  }
}

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  getServiceAuthInfo,
  updateService,
  deleteService,
  getServicesByProviderId,
  getProviderBySId,
  updateServiceAvailability,
}
