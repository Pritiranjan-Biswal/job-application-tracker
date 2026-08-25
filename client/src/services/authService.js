import api from './api';

export const authService = {
  // Sign up a new user account
  signup: async (userData) => {
    return await api.post('/auth/signup', userData);
  },

  // Log in existing user
  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },

  // Log out current session
  logout: async () => {
    return await api.post('/auth/logout');
  },

  // Get current logged-in user profile
  getMe: async () => {
    return await api.get('/auth/me');
  },

  // Update account password
  updatePassword: async (passwords) => {
    return await api.put('/auth/update-password', passwords);
  },
};

export default authService;
