import apiClient from './apiService';

export const createNotice = async (data: any) => {
    const response = await apiClient.post('/notices', data);
    return response.data;
};

export const getNotices = async (buildingId?: string) => {
    const params = buildingId ? { buildingId } : {};
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/notices?${queryString}`);
    return response.data;
};

export const getNoticeById = async (id: string) => {
    const response = await apiClient.get(`/notices/${id}`);
    return response.data;
};

export const updateNotice = async (id: string, data: any) => {
    const response = await apiClient.put(`/notices/${id}`, data);
    return response.data;
};

export const publishNotice = async (id: string) => {
    const response = await apiClient.put(`/notices/${id}/publish`);
    return response.data;
};

export const deleteNotice = async (id: string) => {
    const response = await apiClient.delete(`/notices/${id}`);
    return response.data;
};
