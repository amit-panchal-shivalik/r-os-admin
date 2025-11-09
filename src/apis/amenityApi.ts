import apiClient from './apiService';

// ===============================================
// TypeScript Interfaces
// ===============================================

export interface AmenityData {
  society: string;
  name: string;
  startTime: string; // HH:MM format (e.g., "06:00")
  endTime: string;   // HH:MM format (e.g., "22:00")
  isPaid: boolean;
  amount?: number | null;
}

export interface Amenity {
  _id: string;
  society: string;
  name: string;
  startTime: string;
  endTime: string;
  isPaid: boolean;
  amount: number | null;
  qrCode: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface AmenityResponse {
  message: string;
  result: Amenity;
}

export interface AmenitiesListResponse {
  message: string;
  result: {
    amenities: Amenity[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface GetAmenitiesParams {
  page?: number;
  limit?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  isPaid?: boolean;
  society?: string;
}

// ===============================================
// API Functions
// ===============================================

/**
 * Create a new amenity
 * @param data - Amenity data
 * @returns Promise with created amenity
 */
export const createAmenity = async (data: AmenityData): Promise<Amenity> => {
  const response = await apiClient.post<AmenityResponse>('/amenities', data);
  return response.data.result;
};

/**
 * Get all amenities with optional filters and pagination
 * @param params - Query parameters (page, limit, status, isPaid, society)
 * @returns Promise with list of amenities and pagination info
 */
export const getAllAmenities = async (params?: GetAmenitiesParams): Promise<AmenitiesListResponse['result']> => {
  const response = await apiClient.get<AmenitiesListResponse>('/amenities', { params });
  return response.data.result;
};

/**
 * Get amenities by society ID
 * @param societyId - Society ID to filter amenities
 * @param params - Additional query parameters
 * @returns Promise with list of amenities for the society
 */
export const getAmenitiesBySociety = async (
  societyId: string,
  params?: Omit<GetAmenitiesParams, 'society'>
): Promise<AmenitiesListResponse['result']> => {
  const response = await apiClient.get<AmenitiesListResponse>('/amenities', {
    params: { ...params, society: societyId },
  });
  return response.data.result;
};

/**
 * Get amenity by ID
 * @param id - Amenity ID
 * @returns Promise with amenity details
 */
export const getAmenityById = async (id: string): Promise<Amenity> => {
  const response = await apiClient.get<AmenityResponse>(`/amenities/${id}`);
  return response.data.result;
};

/**
 * Update an existing amenity
 * @param id - Amenity ID
 * @param data - Partial amenity data to update
 * @returns Promise with updated amenity
 */
export const updateAmenity = async (id: string, data: Partial<AmenityData>): Promise<Amenity> => {
  const response = await apiClient.put<AmenityResponse>(`/amenities/${id}`, data);
  return response.data.result;
};

/**
 * Delete an amenity (soft delete)
 * @param id - Amenity ID
 * @returns Promise with deletion confirmation
 */
export const deleteAmenity = async (id: string): Promise<{ message: string; _id: string; name: string }> => {
  const response = await apiClient.delete<{
    message: string;
    result: { _id: string; name: string; message: string };
  }>(`/amenities/${id}`);
  return response.data.result;
};

/**
 * Get active amenities for a society (helper function)
 * @param societyId - Society ID
 * @returns Promise with list of active amenities
 */
export const getActiveSocietyAmenities = async (societyId: string): Promise<Amenity[]> => {
  const response = await apiClient.get<AmenitiesListResponse>('/amenities', {
    params: {
      society: societyId,
      status: 'ACTIVE',
      limit: 100, // Get all active amenities
    },
  });
  return response.data.result.amenities;
};

/**
 * Check if amenity name exists for a society
 * @param societyId - Society ID
 * @param amenityName - Amenity name to check
 * @returns Promise with boolean indicating if name exists
 */
export const checkAmenityNameExists = async (societyId: string, amenityName: string): Promise<boolean> => {
  try {
    const response = await getAllAmenities({ society: societyId, limit: 100 });
    return response.amenities.some(
      (amenity) => amenity.name.toLowerCase() === amenityName.toLowerCase() && !amenity.isDeleted
    );
  } catch (error) {
    console.error('Error checking amenity name:', error);
    return false;
  }
};


