import { LoginPayload } from '@/types/LoginTypes';
import { apiRequest } from './apiRequest';
// Fake/demo API implementations for auth (simulate network latency)

// API function to authenticate user (returns demo data)
export const authenticateUserApi = async (data: LoginPayload): Promise<LoginPayload> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const demo = {
                accessToken: 'demo-token-abc123',
                user: {
                    id: '1',
                    name: 'Demo User',
                    phone: (data as any)?.phone || '0000000000',
                    role: 'admin',
                },
                expiresIn: 3600,
            } as unknown as LoginPayload;
            resolve(demo);
        }, 500);
    });
};

// API function to verify OTP (accepts '123456' as valid demo OTP)
export const verifyOTPApi = async (data: any): Promise<LoginPayload> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (data?.otp === '123456') {
                const demo = {
                    id: '1',
                    accessToken: 'demo-verified-token-xyz',
                    result: {
                        id: '1',
                        name: 'Demo User',
                        phone: (data as any)?.phone || '0000000000',
                        role: 'admin',
                    },
                    verified: true,
                    expiresIn: 3600,
                } as unknown as LoginPayload;
                resolve(demo);
            } else {
                reject(new Error('Invalid OTP (demo). Use OTP "123456" to succeed.'));
            }
        }, 500);
    });
};