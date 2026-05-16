const express = require("express")
const cors = require("cors")
const app = express()
require("dotenv").config()

// Import routes from the new structure
const serviceRoutes = require("./routes/serviceRoutes")
const authRoutes = require("./routes/authRoutes")
const bookingsRoutes = require("./routes/bookingRoutes")
const reviewRoutes = require("./routes/reviewRoutes")
const complaintRoutes = require("./routes/complaintRoutes")
const categoryRoutes = require("./routes/categoryRoutes")
const filtersRoutes = require("./routes/filterRoutes")
const contactRoutes = require("./routes/contactRoutes")
const locationsRoutes = require("./routes/locationRoutes")
const adminRoutes = require("./routes/adminRoutes")
const oracledb = require("oracledb")


// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use("/api/services", serviceRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/bookings", bookingsRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/complaints", complaintRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/filters", filtersRoutes)
app.use("/api/contact", contactRoutes)
app.use("/api/locations", locationsRoutes)
app.use("/api/admin", adminRoutes)


const initializeDatabase = async () => {
  try {
    await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
    })
    console.log("Oracle database pool initialized successfully")
  } catch (error) {
    console.error("Error initializing database pool:", error.message)
    process.exit(1)
  }
}
// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
