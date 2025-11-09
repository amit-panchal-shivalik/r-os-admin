import { LoginPayload, BuildingAdminLoginPayload, VerifyOTPPayload, BuildingAdminVerifyOTPPayload } from '@/types/LoginTypes';
import { apiRequest } from './apiRequest';

// Super Admin - Send OTP
export const superAdminSendOTPApi = async (data: LoginPayload): Promise<any> => {
    return await apiRequest<any>({
        method: 'POST',
        url: 'auth/superadmin/send-otp',
        data: data,
    });
};

// Super Admin - Verify OTP
export const superAdminVerifyOTPApi = async (data: VerifyOTPPayload): Promise<any> => {
    return await apiRequest<any>({
        method: 'POST',
        url: 'auth/superadmin/verify-otp',
        data: data,
    });
};

// Building Admin - Send OTP
export const buildingAdminSendOTPApi = async (data: BuildingAdminLoginPayload): Promise<any> => {
    return await apiRequest<any>({
        method: 'POST',
        url: 'auth/buildingadmin/send-otp',
        data: data,
    });
};

// Building Admin - Verify OTP
export const buildingAdminVerifyOTPApi = async (data: BuildingAdminVerifyOTPPayload): Promise<any> => {
    return await apiRequest<any>({
        method: 'POST',
        url: 'auth/buildingadmin/verify-otp',
        data: data,
    });
};