import api from './api';

export const adminService = {
  // Dashboard & Logs
  async getDashboardStats() {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  async getAdminLogs(page = 1, limit = 20) {
    const response = await api.get('/admin/logs', { params: { page, limit } });
    return response.data;
  },

  // Customers Management
  async getCustomers({ role = 'CUSTOMER', search = '', status = 'ALL', city = '', page = 1, limit = 10 } = {}) {
    const response = await api.get('/admin/users', {
      params: { role, search, status, city, page, limit }
    });
    return response.data;
  },

  async getCustomerById(id) {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  async updateCustomer(id, payload) {
    const response = await api.put(`/admin/users/${id}`, payload);
    return response.data;
  },

  async toggleUserStatus(userId, isActive) {
    const response = await api.put(`/admin/users/${userId}/status`, null, {
      params: { isActive }
    });
    return response.data;
  },

  async resetCustomerPassword(userId, newPassword) {
    const response = await api.put(`/admin/users/${userId}/reset-password`, { newPassword });
    return response.data;
  },

  async deleteCustomer(userId) {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Providers Management
  async getProviders({ search = '', status = 'ALL', city = '', service = '', page = 1, limit = 10 } = {}) {
    const response = await api.get('/admin/providers', {
      params: { search, status, city, service, page, limit }
    });
    return response.data;
  },

  async getProviderById(id) {
    const response = await api.get(`/admin/providers/${id}`);
    return response.data;
  },

  async updateProvider(id, payload) {
    const response = await api.put(`/admin/providers/${id}`, payload);
    return response.data;
  },

  async verifyProviderStatus(providerId, status) {
    const response = await api.put(`/admin/providers/${providerId}/verify`, { status });
    return response.data;
  },

  async deleteProvider(providerId) {
    const response = await api.delete(`/admin/providers/${providerId}`);
    return response.data;
  },

  // Analytics
  async getAnalytics() {
    const response = await api.get('/admin/analytics');
    return response.data;
  }
};
