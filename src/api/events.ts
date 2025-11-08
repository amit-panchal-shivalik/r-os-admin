import apiClient from './client';

export const eventsAPI = {
  getAll: (communityId: string) => apiClient.get(`/events?communityId=${communityId}`),
  getById: (id: string) => apiClient.get(`/events/${id}`),
  create: (data: any) => apiClient.post('/events', data),
  update: (id: string, data: any) => apiClient.put(`/events/${id}`, data),
  delete: (id: string) => apiClient.delete(`/events/${id}`),
  
  // Registration
  register: (eventId: string) => apiClient.post(`/events/${eventId}/register`),
  getRegistrations: (eventId: string) => apiClient.get(`/events/${eventId}/registrations`),
  
  // Attendance
  markAttendance: (eventId: string, data: any) => apiClient.post(`/events/${eventId}/attendance`, data),
  getAttendance: (eventId: string) => apiClient.get(`/events/${eventId}/attendance`),
  
  // QR Code
  getQRCode: (eventId: string) => apiClient.get(`/events/${eventId}/qr-code`),
  verifyQRCode: (eventId: string, token: string) => apiClient.post(`/events/${eventId}/verify-qr`, { token }),
};
