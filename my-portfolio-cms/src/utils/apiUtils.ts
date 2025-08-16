import axios from 'axios';

/**
 * Creates a configured instance of axios for making API requests.
 * This instance automatically includes the JWT token in the Authorization header
 * for all outgoing requests, which is crucial for authenticated endpoints.
 */
const api = axios.create({
  baseURL: '/api', // Base URL for all API requests
});

// Axios request interceptor
// This function runs before each request is sent.
api.interceptors.request.use(
  (config) => {
    // Retrieve the token from localStorage (or your preferred storage)
    const token = localStorage.getItem('token');

    // If a token exists, add it to the request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // Continue with the request
  },
  (error) => {
    // Handle any errors during request configuration
    return Promise.reject(error);
  }
);

export default api;
