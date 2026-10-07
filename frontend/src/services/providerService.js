import api from './api';

export const providerService = {
  async getAllProviders(filters = {}) {
    try {
      const response = await api.get('/providers', { params: filters });
      return response.data;
    } catch (error) {
      console.warn("API call /providers failed:", error);
      return [];
    }
  },

  async getProviderById(id) {
    const response = await api.get(`/providers/${id}`);
    return response.data;
  },

  async updateProviderProfile(id, data) {
    const response = await api.put(`/providers/${id}`, data);
    return response.data;
  },

  async verifyProvider(id, status, notes = '') {
    const response = await api.put(`/providers/${id}/verify`, { status, notes });
    return response.data;
  }
};
