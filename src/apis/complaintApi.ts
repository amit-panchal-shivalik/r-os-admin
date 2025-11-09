import apiClient from './apiService';
import {
  Complaint,
  ComplaintFormData,
  ComplaintUpdateData,
  ComplaintListParams,
  ComplaintListResponse,
  ComplaintResponse,
  ComplaintStatsResponse,
  ComplaintStats,
} from '../types/ComplaintTypes';

/**
 * Generate unique complaint ID
 */
export const generateComplaintId = async (): Promise<{ complaintId: string }> => {
  const response = await apiClient.post<any>('/complaints/generate-id');
  return response.data.result || response.data.data;
};

/**
 * Create a new complaint
 */
export const createComplaint = async (
  data: ComplaintFormData,
  image?: File
): Promise<Complaint> => {
  const formData = new FormData();

  // Append basic fields
  formData.append('society', data.society);
  formData.append('type', data.type);
  formData.append('title', data.title);
  formData.append('description', data.description);

  if (data.priority) {
    formData.append('priority', data.priority);
  }

  if (data.status) {
    formData.append('status', data.status);
  }

  // Append image if provided
  if (image) {
    formData.append('image', image);
  }

  const response = await apiClient.post<ComplaintResponse>('/complaints', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.result;
};

/**
 * Get all complaints with filters and pagination
 */
export const getAllComplaints = async (
  params?: ComplaintListParams
): Promise<ComplaintListResponse['result']> => {
  const response = await apiClient.get<ComplaintListResponse>('/complaints', { params });
  return response.data.result;
};

/**
 * Get complaint by ID
 */
export const getComplaintById = async (id: string): Promise<Complaint> => {
  const response = await apiClient.get<ComplaintResponse>(`/complaints/${id}`);
  return response.data.result;
};

/**
 * Get complaint by complaint ID (CMP-XXX)
 */
export const getComplaintByComplaintId = async (complaintId: string): Promise<Complaint> => {
  const response = await apiClient.get<ComplaintResponse>(`/complaints/code/${complaintId}`);
  return response.data.result;
};

/**
 * Update complaint
 */
export const updateComplaint = async (
  id: string,
  data: ComplaintUpdateData,
  image?: File
): Promise<Complaint> => {
  const formData = new FormData();

  // Append only provided fields
  Object.keys(data).forEach((key) => {
    const value = (data as any)[key];
    if (value !== undefined && value !== null && key !== 'image') {
      formData.append(key, value.toString());
    }
  });

  // Append new image if provided
  if (image) {
    formData.append('image', image);
  }

  const response = await apiClient.put<ComplaintResponse>(`/complaints/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.result;
};

/**
 * Update complaint status
 */
export const updateComplaintStatus = async (
  id: string,
  status: string,
  resolutionNotes?: string
): Promise<Complaint> => {
  const response = await apiClient.patch<ComplaintResponse>(`/complaints/${id}/status`, {
    status,
    resolutionNotes,
  });

  return response.data.result;
};

/**
 * Delete complaint (soft delete)
 */
export const deleteComplaint = async (id: string): Promise<void> => {
  await apiClient.delete(`/complaints/${id}`);
};

/**
 * Get complaint statistics
 */
export const getComplaintStats = async (societyId?: string): Promise<ComplaintStats> => {
  const params = societyId ? { society: societyId } : {};
  const response = await apiClient.get<ComplaintStatsResponse>('/complaints/stats', { params });
  return response.data.result;
};

