import { apiRequest } from './apiRequest';

export const triggerSosAlert = async (data: any) => {
  return await apiRequest({
    method: 'POST',
    url: 'sos/trigger',
    data: data,
  });
};

export const deactivateSosAlert = async (id: string) => {
  return await apiRequest({
    method: 'PUT',
    url: `sos/${id}/deactivate`,
  });
};

export const getAllSosAlerts = async (params?: any) => {
  return await apiRequest({
    method: 'GET',
    url: 'sos/all',
    params: params,
  });
};
