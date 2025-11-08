import { CreateFloorsPayload } from '@/types/FloorTypes';
import { apiRequest } from './apiRequest';

// Create Floors (Bulk)
export const createFloorsApi = async (data: CreateFloorsPayload): Promise<any> => {
    return await apiRequest<any>({
        method: 'POST',
        url: 'floors',
        data: data,
    });
};

// Get Floors by Block
export const getFloorsByBlockApi = async (blockId: string, params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
}): Promise<any> => {
    return await apiRequest<any>({
        method: 'GET',
        url: `floors/${blockId}`,
        params: params,
    });
};