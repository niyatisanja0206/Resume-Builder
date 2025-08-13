// This file centralizes API error handling for the application
import axios, { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

/**
 * Helper function to handle API errors consistently throughout the app
 * @param error The error object from the API call
 * @param defaultMessage A default message to display if no specific error message is available
 * @returns A formatted error message for user display
 */
export const handleApiError = (error: unknown, defaultMessage: string = 'An error occurred'): string => {
  // Handle Axios errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    // Get response error message if available
    if (axiosError.response?.data) {
      const data = axiosError.response.data as ApiErrorResponse;
      if (data.message) return data.message;
      if (data.error) return data.error;
    }
    if (axiosError.response?.data) {
      const data = axiosError.response.data as ApiErrorResponse;
      if (data.message) return data.message;
      if (data.error) return data.error;
    }
    
    // Check for specific error types
    if (axiosError.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }
    
    if (axiosError.message.includes('Network Error')) {
      return 'Network error. Please check your internet connection.';
    }
    
    // Return HTTP status based messages as fallback
    if (axiosError.response) {
      switch (axiosError.response.status) {
        case 400: return 'Invalid request. Please check your input.';
        case 401: return 'You need to log in again.';
        case 403: return 'You do not have permission to perform this action.';
        case 404: return 'The requested resource was not found.';
        case 500: return 'Server error. Please try again later.';
        default: return `Error ${axiosError.response.status}: ${axiosError.message}`;
      }
    }
    
    return axiosError.message;
  }
  
  // Handle regular Error objects
  if (error instanceof Error) {
    return error.message;
  }
  
  // Fallback for unknown error types
  return defaultMessage;
};

/**
 * Configure global axios defaults for the application
 */
export const configureAxios = () => {
  // Set reasonable timeouts
  axios.defaults.timeout = 15000; // 15 seconds
  
  // Add request interceptor for auth tokens
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['x-auth-token'] = token;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Add response interceptor for error handling and token refresh
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // Handle timeout errors with retry logic
      if (error.code === 'ECONNABORTED' && !originalRequest._retry) {
        originalRequest._retry = true;
        return axios(originalRequest);
      }
      
      // If 401 Unauthorized and we have a token, it might be expired
      if (error.response?.status === 401 && localStorage.getItem('token') && !originalRequest._retry) {
        // This is where you could implement token refresh logic
        // For now, just redirect to login
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }
  );
};

// Export common API functions that can be used throughout the app
export const apiClient = {
  get: async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
    try {
      const response = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      console.error(`GET ${url} error:`, error);
      throw error;
    }
  },
  
  post: async <T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T> => {
    try {
      const response = await axios.post(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`POST ${url} error:`, error);
      throw error;
    }
  },
  
  put: async <T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T> => {
    try {
      const response = await axios.put(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`PUT ${url} error:`, error);
      throw error;
    }
  },
  
  delete: async <T>(url: string, config?: Record<string, unknown>): Promise<T> => {
    try {
      const response = await axios.delete(url, config);
      return response.data;
    } catch (error) {
      console.error(`DELETE ${url} error:`, error);
      throw error;
    }
  }
};
