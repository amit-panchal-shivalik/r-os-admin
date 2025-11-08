import apiClient from './apiService';

// Maintenance Bills
export const getMaintenanceBills = async (buildingId: string) => {
    const response = await apiClient.get(`/maintenance/bills?buildingId=${buildingId}`);
    return response.data;
};

export const getMaintenanceBillById = async (id: string) => {
    const response = await apiClient.get(`/maintenance/bills/${id}`);
    return response.data;
};

export const createMaintenanceBill = async (data: any) => {
    const response = await apiClient.post('/maintenance/bills', data);
    return response.data;
};

export const updateMaintenanceBill = async (id: string, data: any) => {
    const response = await apiClient.put(`/maintenance/bills/${id}`, data);
    return response.data;
};

export const deleteMaintenanceBill = async (id: string) => {
    const response = await apiClient.delete(`/maintenance/bills/${id}`);
    return response.data;
};

export const publishMaintenanceBill = async (id: string, billStatus: string) => {
    const response = await apiClient.put(`/maintenance/bills/${id}/publish`, { billStatus });
    return response.data;
};

// Maintenance Types
export const getMaintenanceTypes = async (buildingId: string) => {
    const response = await apiClient.get(`/maintenance/types?buildingId=${buildingId}`);
    return response.data;
};

export const createMaintenanceType = async (data: any) => {
    const response = await apiClient.post('/maintenance/types', data);
    return response.data;
};
