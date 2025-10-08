import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/admin/login', { email, password });
    return response.data;
  },

  verifyToken: async () => {
    try {
      const response = await api.get('/admin/profile');
      return response.data.data;
    } catch (error) {
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem('adminToken');
  },
};