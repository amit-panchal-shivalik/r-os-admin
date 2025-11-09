import apiClient from './apiService';

export const getEmployees = async (buildingId: string) => {
    const response = await apiClient.get(`/employees?buildingId=${buildingId}`);
    return response.data;
};

export const getEmployeeById = async (id: string) => {
    const response = await apiClient.get(`/employees/${id}`);
    return response.data;
};

export const createEmployee = async (data: any) => {
    const response = await apiClient.post('/employees', data);
    return response.data;
};

export const updateEmployee = async (id: string, data: any) => {
    const response = await apiClient.put(`/employees/${id}`, data);
    return response.data;
};

export const deleteEmployee = async (id: string) => {
    const response = await apiClient.delete(`/employees/${id}`);
    return response.data;
};
