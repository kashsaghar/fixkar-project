const express = require("express")
const router = express.Router()
const connect = require("../db")
const oracledb = require("oracledb")

// GET filtered services
router.get("/", async (req, res) => {
  let conn
  try {
    console.log("Filter request received with query params:", req.query)
    
    const {
      search,
      category,
      location,
      minPrice,
      maxPrice,
      minRating,
      sortBy,
    } = req.query

    let sql = `
      SELECT s.service_id, s.title, s.description, s.price, s.duration_minutes, 
             s.is_available, s.provider_id, s.category_id, s.created_at,
             u.name as provider_name, c.name as category_name, 
             u.location,
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

    // Create a proper bind object with named parameters
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
      // Ensure category is treated as a number
      bindParams.category = Number(category)
    }

    if (location) {
      sql += ` AND LOWER(u.location) LIKE LOWER(:location)`
      bindParams.location = `%${location}%`
    }

    if (minPrice) {
      sql += ` AND s.price >= :minPrice`
      // Ensure minPrice is treated as a number
      bindParams.minPrice = Number(minPrice)
    }

    if (maxPrice) {
      sql += ` AND s.price <= :maxPrice`
      // Ensure maxPrice is treated as a number
      bindParams.maxPrice = Number(maxPrice)
    }

    if (minRating) {
      sql += ` AND COALESCE(
        (SELECT AVG(rating) FROM reviews r WHERE r.service_id = s.service_id),
        0
      ) >= :minRating`
      // Ensure minRating is treated as a number
      bindParams.minRating = Number(minRating)
    }

    if (sortBy === "price-low") {
      sql += ` ORDER BY s.price ASC`
    } else if (sortBy === "price-high") {
      sql += ` ORDER BY s.price DESC`
    } else {
      sql += ` ORDER BY average_rating DESC, rating_count DESC`
    }

    console.log('Final SQL:', sql)
    console.log('Bind parameters:', bindParams)

    conn = await connect()
    
    // Test the database connection
    console.log("Database connection established")

    const options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true
    }

    const result = await conn.execute(sql, bindParams, options)
    console.log(`Query executed successfully. Returned ${result.rows.length} rows.`)

    const services = result.rows.map((row) => ({
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
      has_special_offer: row.HAS_SPECIAL_OFFER === 1
    }))

    console.log("Sending response with services data")
    res.json(services)
  } catch (err) {
    console.error("Error in filters route:", err)
    console.error("Error details:", err.message)
    if (err.stack) console.error("Stack trace:", err.stack)
    
    // Send a more detailed error response
    res.status(500).json({ 
      error: err.message,
      code: err.code || 'UNKNOWN',
      details: err.toString()
    })
  } finally {
    if (conn) {
      try {
        await conn.close()
        console.log("Database connection closed")
      } catch (err) {
        console.error("Error closing database connection:", err.message)
      }
    }
  }
})

// GET available filter options (for dropdowns)
router.get("/options", async (req, res) => {
  let conn
  try {
    conn = await connect()

    const categoriesResult = await conn.execute(
      `SELECT category_id, name FROM categories ORDER BY name`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    )

    const locationsResult = await conn.execute(
      `SELECT DISTINCT location FROM users WHERE location IS NOT NULL`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    )

    const filterOptions = {
      categories: categoriesResult.rows.map((row) => ({
        category_id: row.CATEGORY_ID,
        name: row.NAME,
      })),
      locations: locationsResult.rows.map((row) => row.LOCATION),
    }

    res.json(filterOptions)
  } catch (err) {
    console.error("Error fetching filter options:", err.message)
    res.status(500).json({ error: err.message })
  } finally {
    if (conn) {
      try {
        await conn.close()
      } catch (err) {
        console.error("Error closing database connection:", err.message)
      }
    }
  }
})

module.exports = router