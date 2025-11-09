import apiClient from './apiService';

export const getParkingDashboard = async (buildingId: string) => {
    const response = await apiClient.get(`/parking/dashboard?buildingId=${buildingId}`);
    return response.data;
};

export const getParkingRequests = async (buildingId: string) => {
    const response = await apiClient.get(`/parking/requests?buildingId=${buildingId}`);
    return response.data;
};

export const createParkingRequest = async (data: any) => {
    const response = await apiClient.post('/parking/requests', data);
    return response.data;
};

export const approveParkingRequest = async (requestId: string, data: any) => {
    const response = await apiClient.put(`/parking/requests/${requestId}/approve`, data);
    return response.data;
};

export const rejectParkingRequest = async (requestId: string, data: any) => {
    const response = await apiClient.put(`/parking/requests/${requestId}/reject`, data);
    return response.data;
};
