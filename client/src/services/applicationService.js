import api from './api';

export const applicationService = {
  // Get all applications with search, filters, sort and pagination
  getApplications: async (params = {}) => {
    return await api.get('/applications', { params });
  },

  // Get application by ID with timeline & interviews
  getApplicationById: async (id) => {
    return await api.get(`/applications/${id}`);
  },

  // Create new application
  createApplication: async (applicationData) => {
    return await api.post('/applications', applicationData);
  },

  // Update application
  updateApplication: async (id, applicationData) => {
    return await api.put(`/applications/${id}`, applicationData);
  },

  // Delete application
  deleteApplication: async (id) => {
    return await api.delete(`/applications/${id}`);
  },

  // Add timeline milestone/note
  addTimelineEvent: async (id, eventData) => {
    return await api.post(`/applications/${id}/timeline`, eventData);
  },

  // Get dashboard statistics and aggregations
  getDashboardStats: async () => {
    return await api.get('/applications/stats/dashboard');
  },
};

export default applicationService;
