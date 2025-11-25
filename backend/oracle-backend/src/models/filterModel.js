const connect = require("../config/db")
const oracledb = require("oracledb")

// Get filtered services
const getFilteredServices = async (filters) => {
  const conn = await connect()
  try {
    const { search, category, location, minPrice, maxPrice, minRating, sortBy } = filters

    let sql = `
      SELECT s.service_id, s.title, s.description, s.price, s.duration_minutes, 
             s.is_available, s.provider_id, s.category_id, s.created_at,
             u.name as provider_name, c.name as category_name, 
             s.location,
             s.service_type, s.image_url,
             COALESCE(
               (SELECT AVG(rating) FROM reviews r WHERE r.service_id = s.service_id),
               0
             ) as average_rating,
             COALESCE(
               (SELECT COUNT(*) FROM reviews r WHERE r.service_id = s.service_id),
               0
             ) as rating_count,
             CASE WHEN EXISTS (
               SELECT 1 FROM special_offers so 
               WHERE so.service_id = s.service_id 
               AND so.expiry_date >= SYSDATE
             ) THEN 1 ELSE 0 END as has_special_offer
      FROM services s
      JOIN users u ON s.provider_id = u.user_id
      JOIN categories c ON s.category_id = c.category_id
      WHERE s.is_available = 1
    `

    const bindParams = {}

    if (search) {
      sql += ` AND (
        LOWER(s.title) LIKE LOWER(:search) OR 
        LOWER(s.description) LIKE LOWER(:search) OR 
        LOWER(u.name) LIKE LOWER(:search)
      )`
      bindParams.search = `%${search}%`
    }

    if (category) {
      sql += ` AND s.category_id = :category`
      bindParams.category = Number(category)
    }

    if (location) {
      sql += ` AND LOWER(u.location) LIKE LOWER(:location)`
      bindParams.location = `%${location}%`
    }

    if (minPrice) {
      sql += ` AND s.price >= :minPrice`
      bindParams.minPrice = Number(minPrice)
    }

    if (maxPrice) {
      sql += ` AND s.price <= :maxPrice`
      bindParams.maxPrice = Number(maxPrice)
    }

    if (minRating) {
      sql += ` AND COALESCE(
        (SELECT AVG(rating) FROM reviews r WHERE r.service_id = s.service_id),
        0
      ) >= :minRating`
      bindParams.minRating = Number(minRating)
    }

    if (sortBy === "price-low") {
      sql += ` ORDER BY s.price ASC`
    } else if (sortBy === "price-high") {
      sql += ` ORDER BY s.price DESC`
    } else {
      sql += ` ORDER BY average_rating DESC, rating_count DESC`
    }

    const options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
    }

    const result = await conn.execute(sql, bindParams, options)
    return result.rows
  } finally {
    await conn.close()
  }
}

// Get filter options
const getFilterOptions = async () => {
  const conn = await connect()
  try {
    const categoriesResult = await conn.execute(`SELECT category_id, name FROM categories ORDER BY name`, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    })

    const locationsResult = await conn.execute(`SELECT DISTINCT location FROM users WHERE location IS NOT NULL`, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    })

    return {
      categories: categoriesResult.rows.map((row) => ({
        category_id: row.CATEGORY_ID,
        name: row.NAME,
      })),
      locations: locationsResult.rows.map((row) => row.LOCATION),
    }
  } finally {
    await conn.close()
  }
}

module.exports = {
  getFilteredServices,
  getFilterOptions,
}
