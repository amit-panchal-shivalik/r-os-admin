import { CreateBlockPayload, UpdateBlockPayload } from '@/types/BlockTypes';
import { apiRequest } from './apiRequest';

// Create Block
export const createBlockApi = async (data: CreateBlockPayload): Promise<any> => {
    return await apiRequest<any>({
        method: 'POST',
        url: 'blocks',
        data: data,
    });
};

// Get Blocks by Society
export const getBlocksBySocietyApi = async (societyId: string, params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
}): Promise<any> => {
    return await apiRequest<any>({
        method: 'GET',
        url: `blocks/society/${societyId}`,
        params: params,
    });
};

// Update Block
export const updateBlockApi = async (id: string, data: UpdateBlockPayload): Promise<any> => {
    return await apiRequest<any>({
        method: 'PATCH',
        url: `blocks/${id}`,
        data: data,
    });
};

// Delete Block
export const deleteBlockApi = async (id: string): Promise<any> => {
    return await apiRequest<any>({
        method: 'DELETE',
        url: `blocks/${id}`,
    });
};