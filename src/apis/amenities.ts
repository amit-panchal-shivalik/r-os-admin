import apiClient from './apiService';

// Amenities
export const getAmenities = async (buildingId: string) => {
    const response = await apiClient.get(`/amenities?buildingId=${buildingId}`);
    return response.data;
};

export const getAmenityById = async (id: string) => {
    const response = await apiClient.get(`/amenities/${id}`);
    return response.data;
};

export const createAmenity = async (data: any) => {
    const response = await apiClient.post('/amenities', data);
    return response.data;
};

export const updateAmenity = async (id: string, data: any) => {
    const response = await apiClient.put(`/amenities/${id}`, data);
    return response.data;
};

export const deleteAmenity = async (id: string) => {
    const response = await apiClient.delete(`/amenities/${id}`);
    return response.data;
};

// Amenity Slots
export const getAmenitySlots = async (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    const response = await apiClient.get(`/amenities/slots${queryString}`);
    return response.data;
};

export const getAmenitySlotById = async (id: string) => {
    const response = await apiClient.get(`/amenities/slots/${id}`);
    return response.data;
};

export const createAmenitySlot = async (data: any) => {
    const response = await apiClient.post('/amenities/slots', data);
    return response.data;
};

export const updateAmenitySlot = async (id: string, data: any) => {
    const response = await apiClient.put(`/amenities/slots/${id}`, data);
    return response.data;
};

export const deleteAmenitySlot = async (id: string) => {
    const response = await apiClient.delete(`/amenities/slots/${id}`);
    return response.data;
};

// Amenity Bookings
export const getAllBookings = async (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    const response = await apiClient.get(`/amenities/bookings/all${queryString}`);
    return response.data;
};

export const updateBookingStatus = async (id: string, data: any) => {
    const response = await apiClient.put(`/amenities/bookings/${id}/status`, data);
    return response.data;
};
