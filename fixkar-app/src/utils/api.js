import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  },
  
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  },

  logout: async () => {
    // Implement logout logic here (e.g., clear tokens)
    return Promise.resolve()
  },
  
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/user');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  }
};

// Services API calls
export const servicesAPI = {
  getAllServices: async () => {
    try {
      const response = await api.get('/services');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  },
  
  getServiceById: async (id) => {
    try {
      const response = await api.get(`/services/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  },
  
  createService: async (serviceData) => {
    try {
      const response = await api.post('/services', serviceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  },
  
  updateService: async (id, serviceData) => {
    try {
      const response = await api.put(`/services/${id}`, serviceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  },
  
  deleteService: async (id) => {
    try {
      const response = await api.delete(`/services/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  },
  
  getProviderServices: async () => {
    try {
      const response = await api.get('/services/provider/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  },

};
// Filters API calls
export const filtersAPI = {
  getFilteredServices: async (filters) => {
    try {
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(filters)) {
        if (value !== "" && value !== null && value !== undefined) {
          queryParams.append(key, value);
        }
      }
      const response = await api.get(`/filters?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching filtered services:", error);
      throw error.response?.data || { message: 'Server error' };
    }
  },

  getFilterOptions: async () => {
    try {
      const response = await api.get('/filters/options');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  },
  
  getStatistics: async () => {
    try {
      const response = await api.get('/filters/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  }
};

// Locations API calls
export const locationsAPI = {
  getAllLocations: async () => {
    try {
      // First try to get locations from filter options
      const filterOptions = await filtersAPI.getFilterOptions();
      if (filterOptions && filterOptions.locations && filterOptions.locations.length > 0) {
        return filterOptions.locations;
      }
      
      // Fallback to direct API call if filter options don't have locations
      const response = await api.get('/locations');
      return response.data;
    } catch (error) {
      console.error("Error fetching locations:", error);
      
      // Fallback to hardcoded locations if API fails
      return [
        "Clifton", "Defence", "Gulshan-e-Iqbal", "Gulistan-e-Johar",
        "North Nazimabad", "Federal B Area", "Saddar", "Malir",
        "Korangi", "Landhi", "Orangi Town", "Nazimabad",
        "PECHS", "Bahadurabad", "Tariq Road", "Shahrah-e-Faisal",
        "Liaquatabad", "North Karachi", "Shah Faisal Colony",
        "Model Colony", "Kemari", "Lyari", "Baldia Town",
        "Bin Qasim Town", "Gadap Town"
      ];
    }
  }
};

// Bookings API calls
export const bookingsAPI = {
  getUserBookings: async () => {
    try {
      const response = await api.get('/bookings/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  },
  
  getBookingById: async (id) => {
    try {
      const response = await api.get(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  },
  
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  },
  
  updateBookingStatus: async (id, status) => {
    try {
      const response = await api.put(`/bookings/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  }
};

// Reviews API calls
export const reviewsAPI = {
  getServiceReviews: async (serviceId) => {
    try {
      const response = await api.get(`/reviews/service/${serviceId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  },
  
  createReview: async (reviewData) => {
    try {
      const response = await api.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  }
};

//contact api calls
export const contactAPI = {
  createMessage: async (MessageData) => {
    try{
    const response = await api.post('/contact', MessageData);
    return response.data;
  }
  catch(error){
    throw error.response?.data || { message: 'Server error' };
  }
}
};

// Complaints API calls
export const complaintsAPI = {
  getUserComplaints: async () => {
    try {
      const response = await api.get('/complaints/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  },
  
  createComplaint: async (complaintData) => {
    try {
      const response = await api.post('/complaints', complaintData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  }
};

// Categories API calls
export const categoriesAPI = {
  getAllCategories: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  }
};


const mockServices = [
  {
    service_id: 1,
    title: "Plumbing Services",
    provider_name: "Ahmed Plumbing",
    category_id: 1,
    category_name: "Plumbing",
    description: "Professional plumbing services for all your needs",
    price: 1500,
    location: "Gulshan-e-Iqbal",
    rating: 4.5,
    service_type: "Repair",
    experience: "5+ years",
    has_special_offer: true,
    payment_types: ["Cash", "Online Transfer"],
    languages: ["Urdu", "English"],
    provider_picture: "/placeholder.svg?height=60&width=60",
  },
  {
    service_id: 2,
    title: "Electrical Repairs",
    provider_name: "Karachi Electricians",
    category_id: 2,
    category_name: "Electrical",
    description: "Fast and reliable electrical repair services",
    price: 1200,
    location: "Defence",
    rating: 4.2,
    service_type: "Repair",
    experience: "3-5 years",
    has_special_offer: false,
    payment_types: ["Cash", "Card"],
    languages: ["Urdu", "English", "Sindhi"],
    provider_picture: "/placeholder.svg?height=60&width=60",
  },
  {
    service_id: 3,
    title: "AC Installation",
    provider_name: "Cool Services",
    category_id: 3,
    category_name: "HVAC",
    description: "Professional AC installation and maintenance",
    price: 3000,
    location: "Clifton",
    rating: 4.8,
    service_type: "Installation",
    experience: "5+ years",
    has_special_offer: true,
    payment_types: ["Cash", "Card", "Online Transfer"],
    languages: ["Urdu", "English"],
    provider_picture: "/placeholder.svg?height=60&width=60",
  },
  {
    service_id: 4,
    title: "House Cleaning",
    provider_name: "Clean Home Services",
    category_id: 4,
    category_name: "Cleaning",
    description: "Complete house cleaning services",
    price: 2500,
    location: "PECHS",
    rating: 4.0,
    service_type: "Maintenance",
    experience: "1-3 years",
    has_special_offer: false,
    payment_types: ["Cash"],
    languages: ["Urdu"],
    provider_picture: "/placeholder.svg?height=60&width=60",
  },
  {
    service_id: 5,
    title: "Carpentry Work",
    provider_name: "Master Carpenters",
    category_id: 5,
    category_name: "Carpentry",
    description: "Custom furniture and woodwork",
    price: 2000,
    location: "North Nazimabad",
    rating: 4.6,
    service_type: "Installation",
    experience: "5+ years",
    has_special_offer: true,
    payment_types: ["Cash", "Online Transfer"],
    languages: ["Urdu", "Punjabi"],
    provider_picture: "/placeholder.svg?height=60&width=60",
  },
]

const mockCategories = [
  { category_id: 1, name: "Plumbing" },
  { category_id: 2, name: "Electrical" },
  { category_id: 3, name: "HVAC" },
  { category_id: 4, name: "Cleaning" },
  { category_id: 5, name: "Carpentry" },
  { category_id: 6, name: "Painting" },
  { category_id: 7, name: "Gardening" },
  { category_id: 8, name: "Appliance Repair" },
]

// Use mock data if in development mode or API fails
const useMockData = process.env.REACT_APP_USE_MOCK_DATA === "true" || process.env.NODE_ENV === "development"

export default api;
export {mockServices, mockCategories, useMockData }
