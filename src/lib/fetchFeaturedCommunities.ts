import api from '@/lib/api';

export const fetchFeaturedCommunities = async () => {
  const payload = {
    sort_by: 1,
    page_no: 1,
    record_per_page: 3,
  };
  const res = await api.post('/community-listing/add', payload);
  return res.data?.data || [];
};
