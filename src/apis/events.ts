import apiClient from './apiService';

// Events
export const getEvents = async (buildingId: string) => {
    const response = await apiClient.get(`/events?buildingId=${buildingId}`);
    return response.data;
};

export const getEventById = async (id: string) => {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
};

export const createEvent = async (data: any) => {
    const response = await apiClient.post('/events', data);
    return response.data;
};

export const updateEvent = async (id: string, data: any) => {
    const response = await apiClient.put(`/events/${id}`, data);
    return response.data;
};

export const deleteEvent = async (id: string) => {
    const response = await apiClient.delete(`/events/${id}`);
    return response.data;
};

export const publishEvent = async (id: string, eventStatus: string) => {
    const response = await apiClient.put(`/events/${id}/publish`, { eventStatus });
    return response.data;
};

// Event Registrations
export const getEventRegistrations = async (eventId?: string) => {
    const queryString = eventId ? `?eventId=${eventId}` : '';
    const response = await apiClient.get(`/events/registrations${queryString}`);
    return response.data;
};

// Event Analytics
export const getEventAnalytics = async (buildingId: string) => {
    const response = await apiClient.get(`/events/analytics?buildingId=${buildingId}`);
    return response.data;
};
