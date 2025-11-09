import { apiRequest } from './apiRequest';

// Get pending members for a building
export const getPendingMembersApi = async (buildingId: string): Promise<any> => {
    return await apiRequest<any>({
        method: 'GET',
        url: `/members/building/${buildingId}/pending`,
    });
};

// Get all members for a building with optional filters
export const getAllMembersApi = async (
    buildingId: string,
    filters?: {
        status?: 'pending' | 'approved' | 'rejected';
        memberType?: 'Owner' | 'Tenant' | 'Family Member';
        search?: string;
    }
): Promise<any> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.memberType) params.append('memberType', filters.memberType);
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = queryString
        ? `/members/building/${buildingId}?${queryString}`
        : `/members/building/${buildingId}`;

    return await apiRequest<any>({
        method: 'GET',
        url,
    });
};

// Get specific member details
export const getMemberDetailsApi = async (memberId: string): Promise<any> => {
    return await apiRequest<any>({
        method: 'GET',
        url: `/members/${memberId}`,
    });
};

// Approve a member
export const approveMemberApi = async (memberId: string): Promise<any> => {
    return await apiRequest<any>({
        method: 'POST',
        url: `/members/${memberId}/approve`,
    });
};

// Reject a member
export const rejectMemberApi = async (
    memberId: string,
    reason?: string
): Promise<any> => {
    return await apiRequest<any>({
        method: 'POST',
        url: `/members/${memberId}/reject`,
        data: {
            reason: reason || 'No reason provided',
        },
    });
};

// Get all users for a building
export const getAllUsersApi = async (buildingId?: string): Promise<any> => {
    const url = buildingId ? `/members/users/all?buildingId=${buildingId}` : '/members/users/all';
    return await apiRequest<any>({
        method: 'GET',
        url,
    });
};

// Create or update member with unit allocation
export const createOrUpdateMemberApi = async (data: any): Promise<any> => {
    return await apiRequest<any>({
        method: 'POST',
        url: '/members',
        data,
    });
};

// Update member details
export const updateMemberApi = async (memberId: string, data: any): Promise<any> => {
    return await apiRequest<any>({
        method: 'PUT',
        url: `/members/${memberId}`,
        data,
    });
};
