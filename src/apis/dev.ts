/**
 * Development Tools API
 * For Super Admin only - Development mode only
 */

import { apiRequest } from './apiRequest';

/**
 * Get database statistics
 */
export const getDatabaseStats = async (): Promise<any> => {
    return await apiRequest<any>({
        method: 'GET',
        url: '/dev/db-stats',
    });
};

/**
 * Clean entire database (DANGEROUS)
 * Removes all data from all collections
 */
export const cleanDatabase = async (): Promise<any> => {
    return await apiRequest<any>({
        method: 'DELETE',
        url: '/dev/clean-database',
    });
};
