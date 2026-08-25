import api from './api';

export const adminService = {
  // Get platform-wide overview statistics for Admin Dashboard
  getDashboardStats: async () => {
    return await api.get('/admin/dashboard');
  },

  // Get paginated list of users with search and filter
  getUsers: async (params = {}) => {
    return await api.get('/admin/users', { params });
  },

  // Get specific user details with their activity
  getUserDetails: async (id) => {
    return await api.get(`/admin/users/${id}`);
  },

  // Toggle user blocked / unblocked status
  toggleUserBlock: async (id) => {
    return await api.patch(`/admin/users/${id}/status`);
  },

  // Delete user and cascade remove applications
  deleteUser: async (id) => {
    return await api.delete(`/admin/users/${id}`);
  },

  // Get all applications across the platform
  getAllApplications: async (params = {}) => {
    return await api.get('/admin/applications', { params });
  },
};

export default adminService;
