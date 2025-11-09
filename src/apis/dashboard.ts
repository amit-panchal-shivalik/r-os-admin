import apiClient from './apiService';

export const getDashboardStats = async (buildingId: string) => {
    const response = await apiClient.get(`/dashboard/stats?buildingId=${buildingId}`);
    return response.data;
};

export const getRecentActivities = async (buildingId: string, limit = 10) => {
    const response = await apiClient.get(`/dashboard/recent-activities?buildingId=${buildingId}&limit=${limit}`);
    return response.data;
};
