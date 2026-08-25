import api from './api';

export const resumeService = {
  // Fetch current resume metadata
  getResume: async () => {
    return await api.get('/resumes');
  },

  // Upload resume file (PDF / DOC) via multipart/form-data
  uploadResume: async (formData) => {
    return await api.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete resume
  deleteResume: async () => {
    return await api.delete('/resumes');
  },
};

export default resumeService;
