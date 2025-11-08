import apiClient from './client';

export const adminAPI = {
  // Territory Management
  getTerritories: () => apiClient.get('/admin/territories'),
  createTerritory: (data: any) => apiClient.post('/admin/territories', data),
  
  // Community Management
  createCommunity: (data: any) => apiClient.post('/admin/communities', data),
  updateCommunity: (id: string, data: any) => apiClient.put(`/admin/communities/${id}`, data),
  deleteCommunity: (id: string) => apiClient.delete(`/admin/communities/${id}`),
  
  // Analytics
  getAnalytics: () => apiClient.get('/admin/analytics'),
};
