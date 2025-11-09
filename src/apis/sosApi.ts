import apiClient from "./apiService";

export interface SOSReport {
  _id: string;
  type: string;
  status: "ACTIVE" | "RESOLVED" | "CANCELLED" | "DELETED";
  createdAt: string;
  updatedAt: string;
  user: {
    _id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    unitId?: string;
  };
  society: {
    _id: string;
    name: string;
    address?: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    } | string;
  };
}

export interface SOSFilters {
  page?: number;
  limit?: number;
  societyId?: string;
  userId?: string;
  status?: string;
  type?: string;
  search?: string;
}

export interface SOSListResponse {
  sosReports: SOSReport[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Backend response wrapper
interface SOSApiResponse {
  message: string;
  result: SOSListResponse;
}

export interface SOSStats {
  total: number;
  active: number;
  resolved: number;
  cancelled: number;
  byType: Array<{
    type: string;
    count: number;
  }>;
}

interface SOSStatsApiResponse {
  message: string;
  result: SOSStats;
}

interface SOSSingleResponse {
  message: string;
  result: SOSReport;
}

export const getAllSOSReports = async (
  params?: SOSFilters
): Promise<SOSListResponse> => {
  try {
    console.log("=== FETCH SOS REPORTS API CALL ===");
    console.log("Endpoint: GET /sos");
    console.log("Request params:", params);

    const response = await apiClient.get<SOSApiResponse>("/sos", {
      params,
    });

    console.log("=== FETCH SOS REPORTS SUCCESS ===");
    console.log("Response status:", response.status);
    console.log("Response data:", response.data);

    return response.data.result; // Return the result object which contains sosReports and pagination
  } catch (error: any) {
    console.error("=== FETCH SOS REPORTS ERROR ===");
    console.error("Error:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

export const getSOSReportById = async (id: string): Promise<SOSReport> => {
  try {
    console.log("=== FETCH SOS REPORT BY ID API CALL ===");
    console.log("Endpoint: GET /sos/" + id);

    const response = await apiClient.get<SOSSingleResponse>(`/sos/${id}`);

    console.log("=== FETCH SOS REPORT SUCCESS ===");
    console.log("Response:", response.data);

    return response.data.result;
  } catch (error: any) {
    console.error("=== FETCH SOS REPORT ERROR ===");
    console.error("Error:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

export const getSOSStatistics = async (
  societyId?: string
): Promise<SOSStats> => {
  try {
    console.log("=== FETCH SOS STATISTICS API CALL ===");
    console.log("Endpoint: GET /sos/statistics");

    const params = societyId ? { societyId } : undefined;
    const response = await apiClient.get<SOSStatsApiResponse>(
      "/sos/statistics",
      { params }
    );

    console.log("=== FETCH SOS STATISTICS SUCCESS ===");
    console.log("Response:", response.data);

    return response.data.result;
  } catch (error: any) {
    console.error("=== FETCH SOS STATISTICS ERROR ===");
    console.error("Error:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

export const updateSOSStatus = async (
  id: string,
  status: string
): Promise<void> => {
  try {
    console.log("=== UPDATE SOS STATUS API CALL ===");
    console.log("Endpoint: PATCH /sos/" + id + "/status");
    console.log("Request data:", { status });

    await apiClient.patch(`/sos/${id}/status`, { status });

    console.log("=== UPDATE SOS STATUS SUCCESS ===");
  } catch (error: any) {
    console.error("=== UPDATE SOS STATUS ERROR ===");
    console.error("Error:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

export const deleteSOSReport = async (id: string): Promise<void> => {
  try {
    console.log("=== DELETE SOS REPORT API CALL ===");
    console.log("Endpoint: DELETE /sos/" + id);

    await apiClient.delete(`/sos/${id}`);

    console.log("=== DELETE SOS REPORT SUCCESS ===");
  } catch (error: any) {
    console.error("=== DELETE SOS REPORT ERROR ===");
    console.error("Error:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

