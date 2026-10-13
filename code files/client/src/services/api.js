import axios from 'axios';
import { safeStorage } from '../utils/safeStorage';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api'),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = safeStorage.getItem('imovies_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on protected route, clean storage if needed
      if (safeStorage.getItem('imovies_token') && !window.location.pathname.includes('/login')) {
        // safeStorage.removeItem('imovies_token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
