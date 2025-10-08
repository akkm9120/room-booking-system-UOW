import api from './api';

export const userService = {
  getAllUsers: async () => {
    const response = await api.get('/admin/visitors');
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/admin/visitors/${id}`);
    return response.data;
  },

  activateUser: async (id) => {
    const response = await api.patch(`/admin/visitors/${id}/activate`);
    return response.data;
  },

  deactivateUser: async (id) => {
    const response = await api.patch(`/admin/visitors/${id}/deactivate`);
    return response.data;
  },

  getUserStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },
};