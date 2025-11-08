import { LoginPayload } from '@/types/LoginTypes';
import { apiRequest } from './apiRequest';

// API function to authenticate user
export const authenticateUserApi = async (data: LoginPayload): Promise<LoginPayload> => {
    return await apiRequest<LoginPayload>({
        method: 'POST',
        
        url: 'users/login',
        data: data,
    });
};

// API function to verify OTP
export const verifyOTPApi = async (data: any): Promise<LoginPayload> => {
    return await apiRequest<LoginPayload>({
        method: 'POST',
        url: 'users/verify-otp',
        data: data,
    });
};