import api from './api';

export const authService = {
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async registerCustomer(data) {
    const response = await api.post('/auth/register/customer', data);
    return response.data;
  },

  async registerProvider(data) {
    const response = await api.post('/auth/register/provider', data);
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
