import apiClient from './client';

export const pulsesAPI = {
  getAll: (communityId: string) => apiClient.get(`/pulses?communityId=${communityId}`),
  create: (data: any) => apiClient.post('/pulses', data),
  approve: (id: string) => apiClient.put(`/pulses/${id}/approve`),
  reject: (id: string) => apiClient.put(`/pulses/${id}/reject`),
  delete: (id: string) => apiClient.delete(`/pulses/${id}`),
};
