import apiClient from './client';

export const marketplaceAPI = {
  getAll: (communityId: string) => apiClient.get(`/marketplace?communityId=${communityId}`),
  getById: (id: string) => apiClient.get(`/marketplace/${id}`),
  create: (data: any) => apiClient.post('/marketplace', data),
  update: (id: string, data: any) => apiClient.put(`/marketplace/${id}`, data),
  approve: (id: string) => apiClient.put(`/marketplace/${id}/approve`),
  reject: (id: string) => apiClient.put(`/marketplace/${id}/reject`),
  markAsSold: (id: string) => apiClient.put(`/marketplace/${id}/sold`),
  delete: (id: string) => apiClient.delete(`/marketplace/${id}`),
};
