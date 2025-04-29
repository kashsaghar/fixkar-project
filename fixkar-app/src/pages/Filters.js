"use client"

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { servicesAPI, categoriesAPI, mockServices, mockCategories, useMockData } from "../utils/api";

function Filters() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(location.search)

  // State for providers and loading
  const [providers, setProviders] = useState([])
  const [filteredProviders, setFilteredProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

        if (useMockData) {
          // Use mock data for development/testing
          providersData = mockServices
          categoriesData = mockCategories
          console.log("Using mock data for services and categories")
        } else {
          // Fetch real data from API with SQL queries
          // SQL Query: SELECT * FROM services JOIN providers ON services.provider_id = providers.provider_id
          const providersResponse = await servicesAPI.getAllServices()
          providersData = providersResponse

          // SQL Query: SELECT * FROM categories ORDER BY name ASC
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
  }, [filters, providers])

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target
    setFilters({
      ...filters,
      [name]: type === "checkbox" ? checked : value,
    })

    // Update URL query params
    const newParams = new URLSearchParams(location.search)
    if (value === "" || (type === "checkbox" && !checked)) {
      newParams.delete(name)
    } else {
      newParams.set(name, type === "checkbox" ? checked : value)
    }
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

  if (loading) {
    return (
      <section className="filters-page">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white mb-6">Service Providers</h1>
          <div className="loading">Loading...</div>
        </div>
      </section>
    )
  }

  return (
    <section className="filters-page">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Service Providers</h1>

        {error && <div className="bg-yellow-800 bg-opacity-20 text-yellow-200 p-3 rounded-lg mb-6">{error}</div>}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search for services or providers..."
              className="w-full p-4 pl-12 rounded-lg bg-opacity-20 bg-white text-white border border-gray-600 focus:outline-none focus:border-blue-500"
            />
            <span className="absolute left-4 top-4 text-gray-400">🔍</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Panel */}
          <div className="w-full md:w-1/4">
            <div className="bg-opacity-90 bg-[#4c5782] rounded-lg p-4 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <span className="mr-2">🔍</span> Filters
                </h2>
                <button onClick={resetFilters} className="text-sm text-blue-300 hover:text-blue-100">
                  Reset All
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-2">Category</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full p-2 rounded bg-opacity-20 bg-white text-white border border-gray-600"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.category_id} value={category.category_id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-2">Location</label>
                <select
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  className="w-full p-2 rounded bg-opacity-20 bg-white text-white border border-gray-600"
                >
                  <option value="">All Areas</option>
                  {karachiAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-2">Price Range (PKR)</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="Min"
                    className="w-1/2 p-2 rounded bg-opacity-20 bg-white text-white border border-gray-600"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="Max"
                    className="w-1/2 p-2 rounded bg-opacity-20 bg-white text-white border border-gray-600"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-2">Minimum Rating</label>
                <select
                  name="minRating"
                  value={filters.minRating}
                  onChange={handleFilterChange}
                  className="w-full p-2 rounded bg-opacity-20 bg-white text-white border border-gray-600"
                >
                  <option value="">Any Rating</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="1">1+ Star</option>
                </select>
              </div>

              {/* Service Type Filter */}
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-2">Service Type</label>
                <select
                  name="serviceType"
                  value={filters.serviceType}
                  onChange={handleFilterChange}
                  className="w-full p-2 rounded bg-opacity-20 bg-white text-white border border-gray-600"
                >
                  <option value="">All Types</option>
                  {serviceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience Level Filter */}
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-2">Experience Level</label>
                <select
                  name="experience"
                  value={filters.experience}
                  onChange={handleFilterChange}
                  className="w-full p-2 rounded bg-opacity-20 bg-white text-white border border-gray-600"
                >
                  <option value="">Any Experience</option>
                  {experienceLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              {/* Special Offers Filter */}
              <div className="mb-4">
                <label className="flex items-center text-white text-sm font-medium">
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
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-2">Payment Type</label>
                <select
                  name="paymentType"
                  value={filters.paymentType}
                  onChange={handleFilterChange}
                  className="w-full p-2 rounded bg-opacity-20 bg-white text-white border border-gray-600"
                >
                  <option value="">All Payment Types</option>
                  {paymentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language Filter */}
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-2">Language</label>
                <select
                  name="language"
                  value={filters.language}
                  onChange={handleFilterChange}
                  className="w-full p-2 rounded bg-opacity-20 bg-white text-white border border-gray-600"
                >
                  <option value="">All Languages</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="w-full md:w-3/4">
            <div className="bg-opacity-90 bg-[#4c5782] rounded-lg p-4 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">{filteredProviders.length} Results Found</h2>
                <div className="text-sm text-gray-300">
                  Showing {Math.min(filteredProviders.length, 10)} of {filteredProviders.length}
                </div>
              </div>

              {filteredProviders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white text-lg">No service providers match your filters.</p>
                  <button
                    onClick={resetFilters}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProviders.map((provider) => (
                    <div
                      key={provider.service_id}
                      className="bg-opacity-20 bg-white rounded-lg p-4 hover:bg-opacity-30 transition-all"
                      onClick={() => navigate(`/services/${provider.service_id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/4 mb-4 md:mb-0">
                          <div className="w-full h-32 bg-gray-700 rounded-lg overflow-hidden">
                            <img
                              src={provider.image_url || "/placeholder.svg?height=128&width=128"}
                              alt={provider.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="md:w-3/4 md:pl-4">
                          <div className="flex justify-between">
                            <h3 className="text-xl font-semibold text-white">{provider.title}</h3>
                            <div className="flex items-center">
                              {renderStars(provider.average_rating || provider.rating || 0)}
                              <span className="ml-1 text-white">
                                ({provider.average_rating || provider.rating || 0})
                              </span>
                            </div>
                          </div>

                          <p className="text-gray-300 text-sm mb-2">
                            {provider.provider_name} • {provider.category_name}
                          </p>

                          <p className="text-gray-300 mb-4 line-clamp-2">{provider.description}</p>

                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-opacity-20 bg-white text-white">
                              📍 {provider.location || "Location not specified"}
                            </span>

                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-opacity-20 bg-white text-white">
                              💰 PKR {provider.price}
                            </span>

                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-opacity-20 bg-white text-white">
                              ⏱️ {provider.duration_minutes || 60} mins
                            </span>

                            {provider.has_special_offer && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-900 text-green-200">
                                🏆 Special Offer
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Filters
