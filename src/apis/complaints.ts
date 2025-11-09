import apiClient from './apiService';

export const createComplaint = async (data: any) => {
    const response = await apiClient.post('/complaints', data);
    return response.data;
};

export const getComplaints = async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/complaints?${queryString}`);
    return response.data;
};

export const getComplaintById = async (id: string) => {
    const response = await apiClient.get(`/complaints/${id}`);
    return response.data;
};

export const updateComplaintStatus = async (id: string, data: any) => {
    const response = await apiClient.put(`/complaints/${id}/status`, data);
    return response.data;
};

export const addComplaintReply = async (id: string, data: any) => {
    const response = await apiClient.post(`/complaints/${id}/reply`, data);
    return response.data;
};

export const addComplaintFollowUp = async (id: string, data: any) => {
    const response = await apiClient.post(`/complaints/${id}/follow-up`, data);
    return response.data;
};

export const getComplaintStats = async (buildingId: string) => {
    const response = await apiClient.get(`/complaints/stats?buildingId=${buildingId}`);
    return response.data;
};

export const deleteComplaint = async (id: string) => {
    const response = await apiClient.delete(`/complaints/${id}`);
    return response.data;
};
