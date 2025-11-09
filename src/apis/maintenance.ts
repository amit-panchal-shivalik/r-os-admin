import apiClient from './apiService';

// Get all maintenance bills (admin view)
export const getMaintenanceBills = async (params: any) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/maintenance/bills?${queryString}`);
    return response.data;
};

// Generate bills for all units in a building
export const generateMaintenanceBills = async (data: {
    buildingId: string;
    month: number;
    year: number;
    amount: number;
}) => {
    const response = await apiClient.post('/maintenance/bills/generate', data);
    return response.data;
};
