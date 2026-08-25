import api from './api';

export const userService = {
  // Get current user profile details
  getProfile: async () => {
    return await api.get('/users/profile');
  },

  // Update profile info (skills, bio, preferred role/location, links)
  updateProfile: async (profileData) => {
    return await api.put('/users/profile', profileData);
  },
};

export default userService;
