import api from './api';

export const bookingService = {
  getAllBookings: async () => {
    const response = await api.get('/admin/bookings');
    return response.data;
  },

  getBookingById: async (id) => {
    const response = await api.get(`/admin/bookings/${id}`);
    return response.data;
  },

  approveBooking: async (id) => {
    const response = await api.patch(`/admin/bookings/${id}/approve`);
    return response.data;
  },

  rejectBooking: async (id, reason) => {
    const response = await api.patch(`/admin/bookings/${id}/reject`, { reason });
    return response.data;
  },

  getBookingStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },
};