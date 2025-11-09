import apiClient from './apiService';

// Generic API request function
export const apiRequest = async <T = any>(config: any): Promise<T> => {
    try {
        const response = await apiClient.request<T>({
            ...config,
            responseType: config.responseType || 'json', // Default to 'json' if not specified
        });
        return response.data;
    } catch (error: any) {
        // Prefer server-provided message when available (axios error shape)
        const respData = error?.response?.data || error?.data || null;
        const status = error?.response?.status || error?.status || null;
        const message = (respData && (respData.message || respData.error)) || error?.message || 'An error occurred during the API request';
        const e = new Error(message);
        // attach additional info for callers that want to inspect it
        (e as any).status = status;
        (e as any).data = respData;
        throw e;
    }
};
