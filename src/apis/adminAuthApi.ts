import apiClient from "./apiService";

export interface SendOtpRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface AdminData {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  roleKey: string;
  roleDetails: {
    id: string;
    key: string;
    name: string;
    level: number;
    scope: string;
  };
  society: {
    id: string;
    name: string;
  };
  permissions: string[];
  customPermissions: Record<string, any>;
  lastLoginAt: string;
}

export interface AuthResponse {
  message: string;
  result: {
    token: string;
    admin: AdminData;
    tokenExpiresIn: string;
  };
}

export interface SendOtpResponse {
  message: string;
  result: {
    email: string;
    expiresIn: string;
  };
}

/**
 * Send OTP to admin email
 */
export const sendOtp = async (email: string): Promise<SendOtpResponse> => {
  const response = await apiClient.post<SendOtpResponse>("/admin/send-otp", {
    email,
  });
  return response.data;
};

/**
 * Verify OTP and login
 */
export const verifyOtp = async (
  email: string,
  otp: string
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>("/admin/verify-otp", {
    email,
    otp,
  });

  // Store token and admin data in localStorage
  if (response.data.result?.token) {
    localStorage.setItem("auth_token", response.data.result.token);
    localStorage.setItem(
      "admin_data",
      JSON.stringify(response.data.result.admin)
    );
  }

  return response.data;
};

/**
 * Resend OTP
 */
export const resendOtp = async (email: string): Promise<SendOtpResponse> => {
  const response = await apiClient.post<SendOtpResponse>("/admin/resend-otp", {
    email,
  });
  return response.data;
};

/**
 * Get admin profile
 */
export const getAdminProfile = async (): Promise<AdminData> => {
  const response = await apiClient.get<{ result: AdminData }>("/admin/profile");
  return response.data.result;
};

/**
 * Logout admin
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post("/admin/logout");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Clear local storage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("admin_data");
    localStorage.removeItem("userInfo");
    localStorage.clear();
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("auth_token");
  return !!token;
};

/**
 * Get stored admin data
 */
export const getStoredAdminData = (): AdminData | null => {
  try {
    const data = localStorage.getItem("admin_data");
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Get auth token
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token");
};
