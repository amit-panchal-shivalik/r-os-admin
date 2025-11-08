import { apiRequest } from './apiRequest';

// Building update payload type
export interface UpdateBuildingPayload {
    society?: {
        name?: string;
        logo?: string;
        ref?: string;
    };
    buildingName?: string;
    address?: string;
    territory?: string;
    city?: string;
    state?: string;
    pinCode?: string;
    totalBlocks?: number;
    totalUnits?: number;
    buildingType?: string;
    createdBy?: string;
}

export const updateBuildingApi = async (data: UpdateBuildingPayload): Promise<any> => {
    return await apiRequest<any>({
        method: 'PUT',
        url: 'building-details',
        data: data,
    });
};

