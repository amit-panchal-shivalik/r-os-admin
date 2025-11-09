import api from '@/lib/api';

export const fetchCommunitiesPaginated = async (pageNo: number, recordPerPage: number) => {
  const payload = {
    sort_by: 1,
    page_no: pageNo,
    record_per_page: recordPerPage,
  };
  const res = await api.post('/community-listing/add', payload);
  return res.data?.data || [];
};
