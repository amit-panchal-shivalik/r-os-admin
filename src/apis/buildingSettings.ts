import apiClient from './apiService';

// Blocks
export const createBlock = async (data: any) => {
    const response = await apiClient.post('/building-settings/blocks', data);
    return response.data;
};

export const getBlocks = async (buildingId: string) => {
    const response = await apiClient.get(`/building-settings/blocks?buildingId=${buildingId}`);
    return response.data;
};

export const getBlockById = async (id: string) => {
    const response = await apiClient.get(`/building-settings/blocks/${id}`);
    return response.data;
};

export const updateBlock = async (id: string, data: any) => {
    const response = await apiClient.put(`/building-settings/blocks/${id}`, data);
    return response.data;
};

export const deleteBlock = async (id: string) => {
    const response = await apiClient.delete(`/building-settings/blocks/${id}`);
    return response.data;
};

// Floors
export const createFloor = async (data: any) => {
    const response = await apiClient.post('/building-settings/floors', data);
    return response.data;
};

export const createMultipleFloors = async (data: any) => {
    const response = await apiClient.post('/building-settings/floors/bulk', data);
    return response.data;
};

export const getFloors = async (blockId?: string) => {
    const url = blockId ? `/building-settings/floors?blockId=${blockId}` : '/building-settings/floors';
    const response = await apiClient.get(url);
    return response.data;
};

export const getFloorById = async (id: string) => {
    const response = await apiClient.get(`/building-settings/floors/${id}`);
    return response.data;
};

export const updateFloor = async (id: string, data: any) => {
    const response = await apiClient.put(`/building-settings/floors/${id}`, data);
    return response.data;
};

export const deleteFloor = async (id: string) => {
    const response = await apiClient.delete(`/building-settings/floors/${id}`);
    return response.data;
};

// Units
export const createUnit = async (data: any) => {
    const response = await apiClient.post('/building-settings/units', data);
    return response.data;
};

export const getUnits = async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/building-settings/units?${queryString}`);
    return response.data;
};

export const getUnitById = async (id: string) => {
    const response = await apiClient.get(`/building-settings/units/${id}`);
    return response.data;
};

export const updateUnit = async (id: string, data: any) => {
    const response = await apiClient.put(`/building-settings/units/${id}`, data);
    return response.data;
};

export const deleteUnit = async (id: string) => {
    const response = await apiClient.delete(`/building-settings/units/${id}`);
    return response.data;
};

// Parking Areas
export const createParkingArea = async (data: any) => {
    const response = await apiClient.post('/building-settings/parking-areas', data);
    return response.data;
};

export const getParkingAreas = async (buildingId: string) => {
    const response = await apiClient.get(`/building-settings/parking-areas?buildingId=${buildingId}`);
    return response.data;
};

export const updateParkingArea = async (id: string, data: any) => {
    const response = await apiClient.put(`/building-settings/parking-areas/${id}`, data);
    return response.data;
};

export const deleteParkingArea = async (id: string) => {
    const response = await apiClient.delete(`/building-settings/parking-areas/${id}`);
    return response.data;
};

// Parking Spots
export const createParkingSpot = async (data: any) => {
    const response = await apiClient.post('/building-settings/parking-spots', data);
    return response.data;
};

export const getParkingSpots = async (params?: any) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/building-settings/parking-spots?${queryString}`);
    return response.data;
};
