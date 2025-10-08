import api from './api';

export const roomService = {
  getAllRooms: async () => {
    const response = await api.get('/admin/rooms');
    return response.data;
  },

  getRoomById: async (id) => {
    const response = await api.get(`/admin/rooms/${id}`);
    return response.data;
  },

  createRoom: async (roomData) => {
    const response = await api.post('/admin/rooms', roomData);
    return response.data;
  },

  updateRoom: async (id, roomData) => {
    const response = await api.put(`/admin/rooms/${id}`, roomData);
    return response.data;
  },

  deleteRoom: async (id) => {
    const response = await api.delete(`/admin/rooms/${id}`);
    return response.data;
  },
};