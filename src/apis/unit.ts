import { CreateUnitPayload, UpdateUnitStatusPayload } from '@/types/UnitTypes';
import { apiRequest } from './apiRequest';

// Create Unit
export const createUnitApi = async (data: CreateUnitPayload): Promise<any> => {
    return await apiRequest<any>({
        method: 'POST',
        url: 'units',
        data: data,
    });
};

// Get Units by Floor
export const getUnitsByFloorApi = async (floorId: string, params?: {
    page?: number;
    limit?: number;
    search?: string;
    unitStatus?: string;
}): Promise<any> => {
    return await apiRequest<any>({
        method: 'GET',
        url: `units/floor/${floorId}`,
        params: params,
    });
};

// Get Units by Block
export const getUnitsByBlockApi = async (blockId: string, params?: {
    page?: number;
    limit?: number;
    search?: string;
    unitStatus?: string;
}): Promise<any> => {
    return await apiRequest<any>({
        method: 'GET',
        url: `units/block/${blockId}`,
        params: params,
    });
};

// Update Unit Status
export const updateUnitStatusApi = async (id: string, data: UpdateUnitStatusPayload): Promise<any> => {
    return await apiRequest<any>({
        method: 'PATCH',
        url: `units/${id}/status`,
        data: data,
    });
};