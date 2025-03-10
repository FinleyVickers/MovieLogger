// API configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Default API error message
export const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again later.';

// Configure axios defaults
export const configureAxios = (axios, token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export default {
  API_URL,
  DEFAULT_ERROR_MESSAGE,
  configureAxios
}; 