import api from './api';

export const interviewService = {
  // Get all interviews with optional status or timeframe filter
  getInterviews: async (params = {}) => {
    return await api.get('/interviews', { params });
  },

  // Get upcoming interviews for dashboard alert
  getUpcomingInterviews: async () => {
    return await api.get('/interviews/upcoming');
  },

  // Schedule new interview
  createInterview: async (interviewData) => {
    return await api.post('/interviews', interviewData);
  },

  // Update interview details/status
  updateInterview: async (id, interviewData) => {
    return await api.put(`/interviews/${id}`, interviewData);
  },

  // Delete an interview
  deleteInterview: async (id) => {
    return await api.delete(`/interviews/${id}`);
  },
};

export default interviewService;
