import api from './api';

export const roomService = {
  getAllRooms: async () => {
    const response = await api.get('/admin/rooms');
    return response.data; // Returns { success: true, data: [...], pagination: {...} }
  },

  getRoomById: async (id) => {
    const response = await api.get(`/admin/rooms/${id}`);
    return response.data; // Returns { success: true, data: {...} }
  },

  createRoom: async (roomData) => {
    // Transform frontend form data to match API expectations
    const apiData = {
      room_number: roomData.room_number,
      room_name: roomData.room_name,
      description: roomData.description || '',
      capacity: parseInt(roomData.capacity),
      location: roomData.location,
      building: roomData.building,
      floor: roomData.floor,
      room_type: roomData.room_type,
      amenities: roomData.amenities || [],
      hourly_rate: parseFloat(roomData.hourly_rate) || 0,
      is_available: roomData.is_available ? 1 : 0,
      requires_approval: roomData.requires_approval ? 1 : 0,
      image_url: roomData.image_url || null
    };
    
    const response = await api.post('/admin/rooms', apiData);
    return response.data;
  },

  updateRoom: async (id, roomData) => {
    // Transform frontend form data to match API expectations
    const apiData = {
      room_number: roomData.room_number,
      room_name: roomData.room_name,
      description: roomData.description || '',
      capacity: parseInt(roomData.capacity),
      location: roomData.location,
      building: roomData.building,
      floor: roomData.floor,
      room_type: roomData.room_type,
      amenities: roomData.amenities || [],
      hourly_rate: parseFloat(roomData.hourly_rate) || 0,
      is_available: roomData.is_available ? 1 : 0,
      requires_approval: roomData.requires_approval ? 1 : 0,
      image_url: roomData.image_url || null
    };
    
    const response = await api.put(`/admin/rooms/${id}`, apiData);
    return response.data;
  },

  deleteRoom: async (id) => {
    const response = await api.delete(`/admin/rooms/${id}`);
    return response.data; // Returns { success: true, message: "Room deleted successfully" }
  },
};