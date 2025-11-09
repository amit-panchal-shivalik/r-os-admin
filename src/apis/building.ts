import { CreateBuildingPayload } from '@/types/BuildingTypes';
import { apiRequest } from './apiRequest';

// Create Building
export const createBuildingApi = async (data: CreateBuildingPayload): Promise<any> => {
    return await apiRequest<any>({
        method: 'POST',
        url: 'buildings',
        data: data,
    });
};

// Get All Buildings
export const getAllBuildingsApi = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
}): Promise<any> => {
    return await apiRequest<any>({
        method: 'GET',
        url: 'buildings',
        params: params,
    });
};

// Get Building By ID
export const getBuildingByIdApi = async (id: string): Promise<any> => {
    return await apiRequest<any>({
        method: 'GET',
        url: `buildings/${id}`,
    });
};