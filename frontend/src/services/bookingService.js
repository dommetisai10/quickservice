import api from './api';

export const bookingService = {
  async getAvailableSlots(providerId, bookingDate) {
    const response = await api.get('/bookings/available-slots', {
      params: { providerId, bookingDate }
    });
    return response.data;
  },

  async createBooking(data) {
    const response = await api.post('/bookings', data);
    return response.data;
  },

  async getUserBookings(status = 'ALL') {
    try {
      const response = await api.get('/bookings', { params: { status } });
      return response.data;
    } catch (error) {
      console.warn("API /bookings failed:", error);
      return [];
    }
  },

  async getBookingDetails(bookingId) {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  },

  async acceptBooking(bookingId) {
    const response = await api.put(`/bookings/${bookingId}/accept`);
    return response.data;
  },

  async rejectBooking(bookingId) {
    const response = await api.put(`/bookings/${bookingId}/reject`);
    return response.data;
  },

  async startBooking(bookingId) {
    const response = await api.put(`/bookings/${bookingId}/start`);
    return response.data;
  },

  async completeBooking(bookingId) {
    const response = await api.put(`/bookings/${bookingId}/complete`);
    return response.data;
  },

  async cancelBooking(bookingId) {
    const response = await api.put(`/bookings/${bookingId}/cancel`);
    return response.data;
  }
};
