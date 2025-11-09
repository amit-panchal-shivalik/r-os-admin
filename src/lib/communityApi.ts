import api from '@/lib/api';

export const fetchCommunityDetails = async (communityId: string) => {
  const res = await api.get(`/community/${communityId}`);
  return res.data?.data;
};

export const fetchCommunityAdminDetails = async (communityId: string, type: 'PULSE' | 'MARKET') => {
  const res = await api.get(`/community/admin-details/${communityId}`, { params: { type } });
  return res.data?.data;
};

export const fetchCommunityUsers = async (communityId: string) => {
  const res = await api.get(`/community/users/${communityId}`);
  return res.data?.data;
};
