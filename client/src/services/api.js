import axios from 'axios';

// Create Axios client with credentials for HTTP-only cookies
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // Crucial: enables sending & receiving HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for centralized error formatting
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    // If account was suspended/blocked, optionally trigger clean logout
    if (error.response?.status === 403 && error.response?.data?.message?.includes('suspended')) {
      window.location.href = '/login?suspended=true';
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
