import apiClient from './client';

export const communitiesAPI = {
  getAll: () => apiClient.get('/communities'),
  getById: (id: string) => apiClient.get(`/communities/${id}`),
  join: (id: string) => apiClient.post(`/communities/${id}/join`),
  leave: (id: string) => apiClient.post(`/communities/${id}/leave`),
  
  // Join Requests Management
  getJoinRequests: (id: string) => apiClient.get(`/communities/${id}/join-requests`),
  approveJoinRequest: (communityId: string, requestId: string) => 
    apiClient.put(`/communities/${communityId}/join-requests/${requestId}/approve`),
  rejectJoinRequest: (communityId: string, requestId: string) => 
    apiClient.put(`/communities/${communityId}/join-requests/${requestId}/reject`),
};