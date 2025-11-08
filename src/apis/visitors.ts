import apiClient from './apiService';

export const getVisitors = async (buildingId: string) => {
    const response = await apiClient.get(`/visitors?buildingId=${buildingId}`);
    return response.data;
};

export const getTodayVisitors = async (buildingId: string) => {
    const response = await apiClient.get(`/visitors/today?buildingId=${buildingId}`);
    return response.data;
};

export const getVisitorStats = async (buildingId: string) => {
    const response = await apiClient.get(`/visitors/stats?buildingId=${buildingId}`);
    return response.data;
};

export const getVisitorById = async (id: string) => {
    const response = await apiClient.get(`/visitors/${id}`);
    return response.data;
};

export const createVisitor = async (data: any) => {
    const response = await apiClient.post('/visitors', data);
    return response.data;
};

export const updateVisitor = async (id: string, data: any) => {
    const response = await apiClient.put(`/visitors/${id}`, data);
    return response.data;
};

export const deleteVisitor = async (id: string) => {
    const response = await apiClient.delete(`/visitors/${id}`);
    return response.data;
};
