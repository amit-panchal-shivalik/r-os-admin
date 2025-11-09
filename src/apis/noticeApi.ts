import apiClient from "./apiService";

export interface Notice {
  _id: string;
  societyId: string;
  title?: string | null; // Optional title field
  text: string; // Backend uses 'text' for notice content
  category?: string | null; // Notice category
  image?: string | null; // Image URL or path
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface NoticeFilters {
  page?: number;
  limit?: number;
  societyId?: string;
  status?: string;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface NoticeListResponse {
  notices: Notice[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number; // Backend uses 'totalItems' not 'totalCount'
    itemsPerPage: number; // Backend uses 'itemsPerPage' not 'limit'
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Backend response wrapper
interface NoticeApiResponse {
  message: string;
  result: NoticeListResponse;
}

// Single notice response
interface NoticeCreateResponse {
  message: string;
  result: Notice;
}

export interface NoticeStats {
  total: number;
  active: number;
  inactive: number;
  draft: number;
}

export const getAllNotices = async (
  params?: NoticeFilters
): Promise<NoticeListResponse> => {
  try {
    const response = await apiClient.get<NoticeApiResponse>("/notices", {
      params,
    });
    return response.data.result; // Return the result object which contains notices and pagination
  } catch (error) {
    console.error("Error fetching notices:", error);
    throw error;
  }
};

export const getNoticeStats = async (): Promise<NoticeStats> => {
  try {
    const response = await apiClient.get("/notices/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching notice stats:", error);
    throw error;
  }
};

export const createNotice = async (
  noticeData: Partial<Notice>,
  image?: File
): Promise<Notice> => {
  try {
    console.log("=== CREATE NOTICE API CALL ===");
    console.log("Endpoint: POST /notices");
    console.log("Request data:", noticeData);

    const formData = new FormData();

    // Append only fields that backend expects
    if (noticeData.societyId)
      formData.append("societyId", noticeData.societyId);
    if (noticeData.title) formData.append("title", noticeData.title);
    if (noticeData.text) formData.append("text", noticeData.text);
    if (noticeData.category) formData.append("category", noticeData.category);
    if (noticeData.status) formData.append("status", noticeData.status);

    // Append image if provided
    if (image) {
      formData.append("image", image);
    }

    const response = await apiClient.post("/notices", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("=== CREATE NOTICE SUCCESS ===");
    console.log("Response status:", response.status);
    console.log("Response data:", response.data);
    return response.data.result; // Return the result object
  } catch (error: any) {
    console.error("=== CREATE NOTICE ERROR ===");
    console.error("Full error object:", error);
    console.error("Error response:", error.response);
    console.error("Error response data:", error.response?.data);
    console.error("Error response status:", error.response?.status);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Is network error?", !error.response && error.request);

    // Provide more specific error message
    if (!error.response && error.request) {
      throw new Error(
        "Network error: Unable to reach the server. Please check if the backend API is running."
      );
    } else if (error.response) {
      throw new Error(
        error.response.data?.message || `Server error: ${error.response.status}`
      );
    } else {
      throw error;
    }
  }
};

export const updateNotice = async (
  id: string,
  noticeData: Partial<Notice>,
  image?: File
): Promise<Notice> => {
  try {
    const formData = new FormData();

    // Append only fields that backend expects
    if (noticeData.societyId)
      formData.append("societyId", noticeData.societyId);
    if (noticeData.title) formData.append("title", noticeData.title);
    if (noticeData.text) formData.append("text", noticeData.text);
    if (noticeData.category) formData.append("category", noticeData.category);
    if (noticeData.status) formData.append("status", noticeData.status);

    // Append new image if provided
    if (image) {
      formData.append("image", image);
    }

    const response = await apiClient.put<NoticeCreateResponse>(
      `/notices/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.result; // Return the result object
  } catch (error) {
    console.error("Error updating notice:", error);
    throw error;
  }
};

export const deleteNotice = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/notices/${id}`);
  } catch (error) {
    console.error("Error deleting notice:", error);
    throw error;
  }
};

export const getNoticeById = async (id: string): Promise<Notice> => {
  try {
    const response = await apiClient.get<NoticeCreateResponse>(
      `/notices/${id}`
    );
    return response.data.result; // Return the result object
  } catch (error) {
    console.error("Error fetching notice:", error);
    throw error;
  }
};
