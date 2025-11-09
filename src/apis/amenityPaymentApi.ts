import apiClient from './apiService';

// ===============================================
// TypeScript Interfaces
// ===============================================

export interface AmenityPaymentData {
  society: string;
  amenity: string;
  bookingDate: string; // YYYY-MM-DD format
  bookingStartTime: string; // HH:MM format
  bookingEndTime: string; // HH:MM format
  amount: number;
  paymentMethod?: 'UPI' | 'CARD' | 'CASH' | 'WALLET' | 'NET_BANKING' | 'OTHER';
  remarks?: string;
}

export interface AdminAmenityPaymentData extends AmenityPaymentData {
  user: string; // User ID (required for admin)
  paymentStatus?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  transactionId?: string;
}

export interface AmenityPayment {
  _id: string;
  society: {
    _id: string;
    societyName: string;
    societyCode: string;
  };
  amenity: {
    _id: string;
    name: string;
    startTime: string;
    endTime: string;
    isPaid: boolean;
    amount: number | null;
    qrCode: string | null;
  };
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  bookingDate: string;
  bookingStartTime: string;
  bookingEndTime: string;
  amount: number;
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  paymentMethod: string | null;
  transactionId: string | null;
  paymentGatewayResponse: object | null;
  qrCodeScanned: boolean;
  scannedAt: string | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  isDeleted: boolean;
}

export interface AmenityPaymentResponse {
  message: string;
  result: AmenityPayment;
}

export interface AmenityPaymentsListResponse {
  message: string;
  result: {
    payments: AmenityPayment[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface GetPaymentsParams {
  page?: number;
  limit?: number;
  society?: string;
  amenity?: string;
  user?: string;
  paymentStatus?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}

export interface UpdatePaymentStatusData {
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  transactionId?: string;
  paymentMethod?: 'UPI' | 'CARD' | 'CASH' | 'WALLET' | 'NET_BANKING' | 'OTHER';
  paymentGatewayResponse?: object;
  remarks?: string;
}

export interface UpdatePaymentData extends Partial<UpdatePaymentStatusData> {
  qrCodeScanned?: boolean;
}

export interface VerifyQRCodeData {
  qrCodeScanned: boolean;
}

export interface PaymentStatistics {
  totalBookings: number;
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;
  totalRevenue: number;
  successRate: string;
}

export interface PaymentStatisticsResponse {
  message: string;
  result: PaymentStatistics;
}

// ===============================================
// User API Functions
// ===============================================

/**
 * Create amenity booking and payment (User)
 * @param data - Payment data
 * @returns Promise with created payment
 */
export const createAmenityPayment = async (data: AmenityPaymentData): Promise<AmenityPayment> => {
  const response = await apiClient.post<AmenityPaymentResponse>('/amenity-payments', data);
  return response.data.result;
};

/**
 * Get user's payment history
 * @param params - Query parameters
 * @returns Promise with list of payments
 */
export const getUserPayments = async (
  params?: Omit<GetPaymentsParams, 'user'>
): Promise<AmenityPaymentsListResponse['result']> => {
  const response = await apiClient.get<AmenityPaymentsListResponse>('/amenity-payments', { params });
  return response.data.result;
};

/**
 * Get payment by ID (User)
 * @param id - Payment ID
 * @returns Promise with payment details
 */
export const getPaymentById = async (id: string): Promise<AmenityPayment> => {
  const response = await apiClient.get<AmenityPaymentResponse>(`/amenity-payments/${id}`);
  return response.data.result;
};

/**
 * Update payment status (User)
 * @param id - Payment ID
 * @param data - Payment status update data
 * @returns Promise with updated payment
 */
export const updatePaymentStatus = async (
  id: string,
  data: UpdatePaymentStatusData
): Promise<AmenityPayment> => {
  const response = await apiClient.put<AmenityPaymentResponse>(`/amenity-payments/${id}/status`, data);
  return response.data.result;
};

/**
 * Verify QR code scan (User)
 * @param id - Payment ID
 * @param data - QR verification data
 * @returns Promise with verification result
 */
export const verifyQRCode = async (id: string, data: VerifyQRCodeData): Promise<AmenityPayment> => {
  const response = await apiClient.post<AmenityPaymentResponse>(`/amenity-payments/${id}/verify-qr`, data);
  return response.data.result;
};

// ===============================================
// Admin API Functions
// ===============================================

/**
 * Create amenity booking and payment (Admin)
 * @param data - Admin payment data
 * @returns Promise with created payment
 */
export const adminCreateAmenityPayment = async (
  data: AdminAmenityPaymentData
): Promise<AmenityPayment> => {
  const response = await apiClient.post<AmenityPaymentResponse>('/amenity-payments', data);
  return response.data.result;
};

/**
 * Get all payments (Admin)
 * @param params - Query parameters
 * @returns Promise with list of all payments
 */
export const adminGetAllPayments = async (
  params?: GetPaymentsParams
): Promise<AmenityPaymentsListResponse['result']> => {
  const response = await apiClient.get<AmenityPaymentsListResponse>('/amenity-payments', { params });
  return response.data.result;
};

/**
 * Get payment by ID (Admin)
 * @param id - Payment ID
 * @returns Promise with payment details
 */
export const adminGetPaymentById = async (id: string): Promise<AmenityPayment> => {
  const response = await apiClient.get<AmenityPaymentResponse>(`/amenity-payments/${id}`);
  return response.data.result;
};

/**
 * Update payment (Admin)
 * @param id - Payment ID
 * @param data - Payment update data
 * @returns Promise with updated payment
 */
export const adminUpdatePayment = async (
  id: string,
  data: UpdatePaymentData
): Promise<AmenityPayment> => {
  const response = await apiClient.put<AmenityPaymentResponse>(`/amenity-payments/${id}`, data);
  return response.data.result;
};

/**
 * Delete payment (Admin)
 * @param id - Payment ID
 * @returns Promise with deletion confirmation
 */
export const adminDeletePayment = async (id: string): Promise<{ message: string; _id: string }> => {
  const response = await apiClient.delete<{
    message: string;
    result: { _id: string; message: string };
  }>(`/amenity-payments/${id}`);
  return response.data.result;
};

/**
 * Get payment statistics (Admin)
 * @param params - Query parameters for filtering
 * @returns Promise with payment statistics
 */
export const getPaymentStatistics = async (
  params?: Pick<GetPaymentsParams, 'society' | 'amenity' | 'startDate' | 'endDate'>
): Promise<PaymentStatistics> => {
  const response = await apiClient.get<PaymentStatisticsResponse>('/amenity-payments/statistics', {
    params,
  });
  return response.data.result;
};

// ===============================================
// Helper Functions
// ===============================================

/**
 * Get payments by society (Helper)
 * @param societyId - Society ID
 * @param params - Additional query parameters
 * @returns Promise with payments for the society
 */
export const getPaymentsBySociety = async (
  societyId: string,
  params?: Omit<GetPaymentsParams, 'society'>
): Promise<AmenityPayment[]> => {
  const response = await getUserPayments({ ...params, society: societyId });
  return response.payments;
};

/**
 * Get payments by amenity (Helper)
 * @param amenityId - Amenity ID
 * @param params - Additional query parameters
 * @returns Promise with payments for the amenity
 */
export const getPaymentsByAmenity = async (
  amenityId: string,
  params?: Omit<GetPaymentsParams, 'amenity'>
): Promise<AmenityPayment[]> => {
  const response = await getUserPayments({ ...params, amenity: amenityId });
  return response.payments;
};

/**
 * Get pending payments (Helper)
 * @param params - Additional query parameters
 * @returns Promise with pending payments
 */
export const getPendingPayments = async (
  params?: Omit<GetPaymentsParams, 'paymentStatus'>
): Promise<AmenityPayment[]> => {
  const response = await getUserPayments({ ...params, paymentStatus: 'PENDING' });
  return response.payments;
};

/**
 * Get successful payments (Helper)
 * @param params - Additional query parameters
 * @returns Promise with successful payments
 */
export const getSuccessfulPayments = async (
  params?: Omit<GetPaymentsParams, 'paymentStatus'>
): Promise<AmenityPayment[]> => {
  const response = await getUserPayments({ ...params, paymentStatus: 'SUCCESS' });
  return response.payments;
};

/**
 * Check if user has active booking for amenity (Helper)
 * @param amenityId - Amenity ID
 * @returns Promise with boolean indicating if user has active booking
 */
export const hasActiveBooking = async (amenityId: string): Promise<boolean> => {
  try {
    const response = await getUserPayments({
      amenity: amenityId,
      paymentStatus: 'SUCCESS',
      limit: 1,
    });
    
    // Check if there's a booking for today or future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return response.payments.some((payment) => {
      const bookingDate = new Date(payment.bookingDate);
      return bookingDate >= today;
    });
  } catch (error) {
    console.error('Error checking active booking:', error);
    return false;
  }
};

/**
 * Format booking time for display
 * @param startTime - Start time (HH:MM)
 * @param endTime - End time (HH:MM)
 * @returns Formatted time string
 */
export const formatBookingTime = (startTime: string, endTime: string): string => {
  return `${startTime} - ${endTime}`;
};

/**
 * Get payment status badge color
 * @param status - Payment status
 * @returns Color string for badge
 */
export const getPaymentStatusColor = (
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED'
): string => {
  const colors = {
    PENDING: 'orange',
    SUCCESS: 'green',
    FAILED: 'red',
    REFUNDED: 'blue',
  };
  return colors[status] || 'gray';
};

