import { apiRequest } from './apiRequest';

export interface HolidayItem {
  id: string;
  name: string;
  date: string; // ISO date string
  description?: string;
}

export interface GetHolidaysResponse {
  success: boolean;
  message?: string;
  result: HolidayItem[];
}

export const getHolidaysApi = async (): Promise<GetHolidaysResponse> => {
  return apiRequest<GetHolidaysResponse>({
    url: 'users/holiday-list',
    method: 'get',
  });
};

export interface AddHolidayPayload {
  name: string;
  date: string; // expected format: DD-MM-YYYY
  description?: string;
}

export interface AddHolidayResponse {
  success: boolean;
  message?: string;
  result?: any;
}

export const addHolidayApi = async (data: AddHolidayPayload): Promise<AddHolidayResponse> => {
  return apiRequest<AddHolidayResponse>({
    url: 'users/add-holiday',
    method: 'post',
    data,
  });
};

export default {
  getHolidaysApi,
};
