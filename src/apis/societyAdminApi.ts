import { apiRequest } from './apiRequest';

export interface SocietyAdmin {
  _id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  roleId: {
    _id: string;
    key: string;
    displayName: string;
    permissions: string[];
  } | string;
  roleKey: string;
  role: string;
  societyId: string | null;
  societyName: string | null;
  societies?: Array<{
    societyId: string;
    societyName: string;
    assignedAt: string;
    _id: string;
  }>;
  customPermissions?: Record<string, any>;
  otpVerifiedAt?: string | null;
  lastLoginAt?: string | null;
  lastActivityAt?: string | null;
  loginAttempts?: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface CreateSocietyAdminPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  societyId: string;
}

export interface UpdateSocietyAdminPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
  societyId?: string;
  isActive?: boolean;
}

export interface GetSocietyAdminsParams {
  page?: number;
  limit?: number;
  search?: string;
  societyId?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetSocietyAdminsResponse {
  admins: SocietyAdmin[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface ApiResponse<T> {
  message: string;
  result: T;
}

/**
 * Get all society admins with pagination and filtering
 */
export const getSocietyAdmins = async (
  params?: GetSocietyAdminsParams
): Promise<GetSocietyAdminsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }

  const queryString = queryParams.toString();
  const url = `/admin/society-admins${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiRequest<ApiResponse<GetSocietyAdminsResponse>>(url, {
    method: 'GET',
  });
  
  return response.result;
};

/**
 * Get single society admin by ID
 */
export const getSocietyAdminById = async (id: string): Promise<SocietyAdmin> => {
  const response = await apiRequest<ApiResponse<SocietyAdmin>>(`/admin/society-admin/${id}`, {
    method: 'GET',
  });
  return response.result;
};

/**
 * Create new society admin
 */
export const createSocietyAdmin = async (
  data: CreateSocietyAdminPayload
): Promise<SocietyAdmin> => {
  const response = await apiRequest<ApiResponse<SocietyAdmin>>('/admin/society-admin', {
    method: 'POST',
    data,
  });
  return response.result;
};

/**
 * Update society admin
 */
export const updateSocietyAdmin = async (
  id: string,
  data: UpdateSocietyAdminPayload
): Promise<SocietyAdmin> => {
  const response = await apiRequest<ApiResponse<SocietyAdmin>>(`/admin/society-admin/${id}`, {
    method: 'PUT',
    data,
  });
  return response.result;
};

/**
 * Delete society admin (soft delete)
 */
export const deleteSocietyAdmin = async (id: string): Promise<{ _id: string; email: string; fullName: string }> => {
  const response = await apiRequest<ApiResponse<{ _id: string; email: string; fullName: string }>>(
    `/admin/society-admin/${id}`,
    {
      method: 'DELETE',
    }
  );
  return response.result;
};

