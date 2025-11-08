import apiClient from './apiService';

export const getCommitteeMembers = async (buildingId: string) => {
    const response = await apiClient.get(`/committee-members?buildingId=${buildingId}`);
    return response.data;
};

export const getCommitteeMemberById = async (id: string) => {
    const response = await apiClient.get(`/committee-members/${id}`);
    return response.data;
};

export const createCommitteeMember = async (data: any) => {
    const response = await apiClient.post('/committee-members', data);
    return response.data;
};

export const updateCommitteeMember = async (id: string, data: any) => {
    const response = await apiClient.put(`/committee-members/${id}`, data);
    return response.data;
};

export const deleteCommitteeMember = async (id: string) => {
    const response = await apiClient.delete(`/committee-members/${id}`);
    return response.data;
};
