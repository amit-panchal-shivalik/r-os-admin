import apiClient from './apiService';

// Generic API request function with overload signatures
export async function apiRequest<T = any>(url: string, config?: any): Promise<T>;
export async function apiRequest<T = any>(config: any): Promise<T>;
export async function apiRequest<T = any>(urlOrConfig: string | any, config?: any): Promise<T> {
    try {
        let requestConfig: any;
        
        // Check if first parameter is a string (URL) or config object
        if (typeof urlOrConfig === 'string') {
            // First parameter is URL, second is config
            requestConfig = {
                url: urlOrConfig,
                ...config,
            };
        } else {
            // First parameter is config object
            requestConfig = urlOrConfig;
        }
        
        const response = await apiClient.request<T>({
            ...requestConfig,
            responseType: requestConfig.responseType || 'json', // Default to 'json' if not specified
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.message || 'An error occurred during the API request');
    }
}
