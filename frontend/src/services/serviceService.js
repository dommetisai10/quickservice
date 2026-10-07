import api from './api';

export const serviceService = {
  async getAllServices(search = '', activeOnly = true) {
    try {
      const response = await api.get('/services', {
        params: { search, activeOnly }
      });
      return response.data;
    } catch (error) {
      console.warn("API call /services failed, returning mock defaults if offline:", error);
      return [];
    }
  },

  async getServiceById(id) {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  async createService(data) {
    const response = await api.post('/services', data);
    return response.data;
  },

  async updateService(id, data) {
    const response = await api.put(`/services/${id}`, data);
    return response.data;
  },

  async deleteService(id) {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  }
};
