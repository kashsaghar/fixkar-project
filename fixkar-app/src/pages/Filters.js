"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { servicesAPI, categoriesAPI, mockServices, mockCategories, useMockData } from "../utils/api"
import {bookingsAPI} from "../utils/api" // Import bookingsAPI
import api from "../utils/api" // Import api for user fetching

function Filters() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(location.search)

  // State for providers and loading
  const [providers, setProviders] = useState([])
  const [filteredProviders, setFilteredProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [bookingInProgress, setBookingInProgress] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState("rating")
  const providersPerPage = 5

  // State for filter values
  const [filters, setFilters] = useState({
    search: queryParams.get("search") || "",
    category: queryParams.get("category") || "",
    location: queryParams.get("location") || "",
    minPrice: queryParams.get("minPrice") || "",
    maxPrice: queryParams.get("maxPrice") || "",
    minRating: queryParams.get("minRating") || "",
    serviceType: queryParams.get("serviceType") || "",
    experience: queryParams.get("experience") || "",
    specialOffers: queryParams.get("specialOffers") === "true",
    paymentType: queryParams.get("paymentType") || "",
    language: queryParams.get("language") || "",
  })

  // State for available filter options
  const [categories, setCategories] = useState([])
  const [activeFilters, setActiveFilters] = useState([])

  // Karachi areas for location filter
  const karachiAreas = [
    "Clifton",
    "Defence",
    "Gulshan-e-Iqbal",
    "Gulistan-e-Johar",
    "North Nazimabad",
    "Federal B Area",
    "Saddar",
    "Malir",
    "Korangi",
    "Landhi",
    "Orangi Town",
    "Nazimabad",
    "PECHS",
    "Bahadurabad",
    "Tariq Road",
    "Shahrah-e-Faisal",
    "Liaquatabad",
    "North Karachi",
    "Shah Faisal Colony",
    "Model Colony",
    "Kemari",
    "Lyari",
    "Baldia Town",
    "Bin Qasim Town",
    "Gadap Town",
  ]

  const serviceTypes = ["Repair", "Installation", "Maintenance", "Consultation", "Emergency"]
  const experienceLevels = ["Less than 1 year", "1-3 years", "3-5 years", "5+ years"]
  const paymentTypes = ["Cash", "Card", "Online Transfer", "Mobile Wallet"]
  const languages = ["Urdu", "English", "Sindhi", "Punjabi", "Pashto", "Balochi"]

  // Fetch providers and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        let providersData = []
        let categoriesData = []

        if (!useMockData) {
          // Use mock data for development/testing
          providersData = mockServices
          categoriesData = mockCategories
          console.log("Using mock data for services and categories")
        } else {
          // Fetch real data from API with SQL queries
          const providersResponse = await servicesAPI.getAllServices(filters)
          providersData = providersResponse

          const categoriesResponse = await categoriesAPI.getAllCategories()
          categoriesData = categoriesResponse
        }

        setProviders(providersData)
        setFilteredProviders(providersData)
        setCategories(categoriesData)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)

        // Fallback to mock data if API fails
        setProviders(mockServices)
        setFilteredProviders(mockServices)
        setCategories(mockCategories)

        setError("Note: Using sample data. Database connection failed.")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Apply filters whenever filter state changes
  useEffect(() => {
    applyFilters()
    updateActiveFilters()
  }, [filters, providers, sortBy])

  // Handle booking when "Book Now" is clicked
  const handleBookNow = async (serviceId) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/auth")
        return
      }

      setBookingInProgress(true)
      console.log("[v0] Creating booking with serviceId:", serviceId)

      let userId = null
      try {
        const userResponse = await api.get("/auth/user")
        userId = userResponse.data?.user_id || userResponse.data?.id
        console.log("[v0] User from API:", userResponse.data)
      } catch (apiErr) {
        console.error("[v0] Error fetching user from API:", apiErr)
        // Fallback: try to get user_id from localStorage with different possible key names
        const userInfo = JSON.parse(localStorage.getItem("user") || "{}")
        userId = userInfo?.user_id || userInfo?.id || userInfo?.userId
      }

      if (!userId) {
        setError("User information not found. Please log in again.")
        setBookingInProgress(false)
        return
      }

      const bookingData = {
        service_id: serviceId,
        user_id: userId,
        booking_date: new Date().toISOString(),
        status: "pending",
        notes: "",
      }

      console.log("[v0] Sending booking to API:", bookingData)
      const response = await bookingsAPI.createBooking(bookingData)
      console.log("[v0] Booking created successfully:", response)

      // Store the new booking ID to highlight it on the bookings page
      localStorage.setItem("newBookingId", response.booking_id)

      setBookingInProgress(false)
      alert("Booking created successfully!")
      navigate("/my-bookings")
    } catch (err) {
      console.error("[v0] Error creating booking:", err)
      setError(err.message || "An error occurred while creating your booking.")
      setBookingInProgress(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target
    setFilters({
      ...filters,
      [name]: type === "checkbox" ? checked : value,
    })
    setCurrentPage(1)

    // Update URL query params
    const newParams = new URLSearchParams(location.search)
    if (value === "" || (type === "checkbox" && !checked)) {
      newParams.delete(name)
    } else {
      newParams.set(name, type === "checkbox" ? checked : value)
    }
    navigate(`${location.pathname}?${newParams.toString()}`)
  }

  const updateActiveFilters = () => {
    const active = []

    if (filters.category) {
      const category = categories.find((c) => c.category_id.toString() === filters.category)
      if (category) {
        active.push({ name: "category", value: category.name })
      }
    }

    if (filters.location) {
      active.push({ name: "location", value: filters.location })
    }

    if (filters.minPrice) {
      active.push({ name: "minPrice", value: `Min PKR ${filters.minPrice}` })
    }

    if (filters.maxPrice) {
      active.push({ name: "maxPrice", value: `Max PKR ${filters.maxPrice}` })
    }

    if (filters.minRating) {
      active.push({ name: "minRating", value: `${filters.minRating}+ Stars` })
    }

    if (filters.serviceType) {
      active.push({ name: "serviceType", value: filters.serviceType })
    }

    if (filters.experience) {
      active.push({ name: "experience", value: filters.experience })
    }

    if (filters.specialOffers) {
      active.push({ name: "specialOffers", value: "Special Offers" })
    }

    if (filters.paymentType) {
      active.push({ name: "paymentType", value: filters.paymentType })
    }

    if (filters.language) {
      active.push({ name: "language", value: filters.language })
    }

    setActiveFilters(active)
  }

  const removeFilter = (filterName) => {
    setFilters({
      ...filters,
      [filterName]: filterName === "specialOffers" ? false : "",
    })

    // Update URL query params
    const newParams = new URLSearchParams(location.search)
    newParams.delete(filterName)
    navigate(`${location.pathname}?${newParams.toString()}`)
  }

  const applyFilters = () => {
    let results = [...providers]

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      results = results.filter(
        (provider) =>
          provider.title?.toLowerCase().includes(searchTerm) ||
          provider.description?.toLowerCase().includes(searchTerm) ||
          provider.provider_name?.toLowerCase().includes(searchTerm),
      )
    }

    // Apply category filter
    if (filters.category) {
      results = results.filter((provider) => provider.category_id?.toString() === filters.category)
    }

    // Apply location filter
    if (filters.location) {
      results = results.filter(
        (provider) => provider.location && provider.location.toLowerCase().includes(filters.location.toLowerCase()),
      )
    }

    // Apply price range filter
    if (filters.minPrice) {
      results = results.filter((provider) => provider.price >= Number.parseInt(filters.minPrice))
    }
    if (filters.maxPrice) {
      results = results.filter((provider) => provider.price <= Number.parseInt(filters.maxPrice))
    }

    // Apply rating filter
    if (filters.minRating) {
      results = results.filter(
        (provider) => (provider.average_rating || provider.rating) >= Number.parseInt(filters.minRating),
      )
    }

    // Apply service type filter
    if (filters.serviceType) {
      results = results.filter((provider) => provider.service_type === filters.serviceType)
    }

    // Apply experience filter
    if (filters.experience) {
      results = results.filter(
        (provider) => provider.experience_level === filters.experience || provider.experience === filters.experience,
      )
    }

    // Apply special offers filter
    if (filters.specialOffers) {
      results = results.filter((provider) => provider.has_special_offer)
    }

    // Apply payment type filter
    if (filters.paymentType) {
      results = results.filter(
        (provider) => provider.payment_types && provider.payment_types.includes(filters.paymentType),
      )
    }

    // Apply language filter
    if (filters.language) {
      results = results.filter((provider) => provider.languages && provider.languages.includes(filters.language))
    }

    // Apply sorting
    if (sortBy === "price-low") {
      results.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-high") {
      results.sort((a, b) => b.price - a.price)
    } else if (sortBy === "rating") {
      results.sort((a, b) => (b.average_rating || b.rating || 0) - (a.average_rating || a.rating || 0))
    }

    setFilteredProviders(results)
  }

  const resetFilters = () => {
    setFilters({
      search: "",
      category: "",
      location: "",
      minPrice: "",
      maxPrice: "",
      minRating: "",
      serviceType: "",
      experience: "",
      specialOffers: false,
      paymentType: "",
      language: "",
    })
    navigate(location.pathname)
    setCurrentPage(1)
  }

  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "star filled" : "star"}>
          ★
        </span>,
      )
    }
    return stars
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  // Pagination
  const indexOfLastProvider = currentPage * providersPerPage
  const indexOfFirstProvider = indexOfLastProvider - providersPerPage
  const currentProviders = filteredProviders.slice(indexOfFirstProvider, indexOfLastProvider)
  const totalPages = Math.ceil(filteredProviders.length / providersPerPage)

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const renderPagination = () => {
    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button key={i} className={`pagination-item ${currentPage === i ? "active" : ""}`} onClick={() => paginate(i)}>
          {i}
        </button>,
      )
    }

    return (
      <div className="pagination">
        <button
          className={`pagination-item ${currentPage === 1 ? "disabled" : ""}`}
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ←
        </button>
        {pages}
        <button
          className={`pagination-item ${currentPage === totalPages ? "disabled" : ""}`}
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          →
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <section className="filters-page">
        <div className="container mx-auto px-4 py-8">
          <h1>Find Service Providers</h1>
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="filters-page">
      <div className="container mx-auto px-4 py-8">
        <h1>Find Service Providers</h1>

        {error && <div className="error-alert">{error}</div>}

        {/* Search Bar */}
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search for services or providers..."
          />
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="filter-tags">
            {activeFilters.map((filter, index) => (
              <div key={index} className="filter-tag">
                {filter.value}
                <button onClick={() => removeFilter(filter.name)}>×</button>
              </div>
            ))}
            {activeFilters.length > 0 && (
              <button className="reset-filters" onClick={resetFilters}>
                Clear All
              </button>
            )}
          </div>
        )}

        {/* Mobile Filters Toggle */}
        <button className="filters-toggle" onClick={toggleFilters}>
          <span>🔍</span> {showFilters ? "Hide Filters" : "Show Filters"}
        </button>

        <div className="filters-container">
          {/* Filters Panel */}
          <div className={`filters-sidebar ${showFilters ? "active" : ""}`}>
            <div className="filters-header">
              <h2>
                <span className="mr-2">🔍</span> Filters
              </h2>
              <button onClick={resetFilters} className="reset-filters">
                Reset All
              </button>
            </div>

            {/* Category Filter */}
            <div className="filter-group">
              <label>Category</label>
              <select name="category" value={filters.category} onChange={handleFilterChange}>
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="filter-group">
              <label>Location</label>
              <select name="location" value={filters.location} onChange={handleFilterChange}>
                <option value="">All Areas</option>
                {karachiAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="filter-group">
              <label>Price Range (PKR)</label>
              <div className="price-range">
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="Min"
                />
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="filter-group">
              <label>Minimum Rating</label>
              <select name="minRating" value={filters.minRating} onChange={handleFilterChange}>
                <option value="">Any Rating</option>
                <option value="5">5 Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Star</option>
              </select>
            </div>

            {/* Service Type Filter */}
            <div className="filter-group">
              <label>Service Type</label>
              <select name="serviceType" value={filters.serviceType} onChange={handleFilterChange}>
                <option value="">All Types</option>
                {serviceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Level Filter */}
            <div className="filter-group">
              <label>Experience Level</label>
              <select name="experience" value={filters.experience} onChange={handleFilterChange}>
                <option value="">Any Experience</option>
                {experienceLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Special Offers Filter */}
            <div className="filter-group">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="specialOffers"
                  checked={filters.specialOffers}
                  onChange={handleFilterChange}
                  className="mr-2 h-4 w-4"
                />
                Special Offers Only
              </label>
            </div>

            {/* Payment Type Filter */}
            <div className="filter-group">
              <label>Payment Type</label>
              <select name="paymentType" value={filters.paymentType} onChange={handleFilterChange}>
                <option value="">All Payment Types</option>
                {paymentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div className="filter-group">
              <label>Language</label>
              <select name="language" value={filters.language} onChange={handleFilterChange}>
                <option value="">All Languages</option>
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Panel */}
          <div className="providers-grid">
            <div className="results-header">
              <h2>{filteredProviders.length} Results Found</h2>
              <div className="sort-dropdown">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="rating">Sort by: Top Rated</option>
                  <option value="price-low">Sort by: Price (Low to High)</option>
                  <option value="price-high">Sort by: Price (High to Low)</option>
                </select>
              </div>
            </div>

            {filteredProviders.length === 0 ? (
              <div className="no-results">
                <h3>No service providers match your filters</h3>
                <p>Try adjusting your filters or search criteria to find more options.</p>
                <button onClick={resetFilters}>Reset All Filters</button>
              </div>
            ) : (
              <>
                {currentProviders.map((provider) => (
                  <div
                    key={provider.service_id}
                    className="provider-card"
                    onClick={() => navigate(`/services/${provider.service_id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="provider-header">
                      <div className="provider-avatar">
                        <img src={provider.image_url || "/placeholder.svg?height=80&width=80"} alt={provider.title} />
                      </div>
                      <div className="provider-info">
                        <h3>{provider.title}</h3>
                        <p className="provider-name">{provider.provider_name}</p>
                        <div className="provider-rating">
                          {renderStars(provider.average_rating || provider.rating || 0)}
                          <span className="rating-value">
                            {provider.average_rating || provider.rating || 0} ({provider.rating_count || "New"})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="provider-details">
                      <p>{provider.description}</p>
                    </div>

                    <div className="provider-meta">
                      <span className="meta-item">
                        <span className="mr-1">📍</span> {provider.location || "Location not specified"}
                      </span>
                      <span className="meta-item">
                        <span className="mr-1">💰</span> PKR {provider.price}
                      </span>
                      <span className="meta-item">
                        <span className="mr-1">⏱️</span> {provider.duration_minutes || 60} mins
                      </span>
                      <span className="meta-item">
                        <span className="mr-1">🛠️</span> {provider.service_type || "Service"}
                      </span>
                      <span className="meta-item">
                        <span className="mr-1">👨‍💼</span> {provider.experience || "Experienced"}
                      </span>
                    </div>

                    {provider.has_special_offer && (
                      <div className="special-offer">
                        <span className="mr-1">🏆</span> Special Offer Available
                      </div>
                    )}

                    <div className="provider-actions">
                      <button
                        className="view-details"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/services/${provider.service_id}`)
                        }}
                      >
                        View Details
                      </button>
                      <button
                        className="book-now"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBookNow(provider.service_id)
                        }}
                        disabled={bookingInProgress}
                      >
                        {bookingInProgress ? "Booking..." : "Book Now"}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && renderPagination()}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Booking in progress overlay */}
      {bookingInProgress && (
        <div className="booking-overlay">
          <div className="booking-spinner">
            <div className="spinner"></div>
            <p>Creating your booking...</p>
          </div>
        </div>
      )}
    </section>
  )
}

export default Filters
