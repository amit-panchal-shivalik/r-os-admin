import apiClient from './client';

export const directoryAPI = {
  getMembers: (communityId: string) => apiClient.get(`/directory/${communityId}`),
  blockMember: (communityId: string, userId: string) => apiClient.put(`/directory/${communityId}/block/${userId}`),
  unblockMember: (communityId: string, userId: string) => apiClient.put(`/directory/${communityId}/unblock/${userId}`),
};
