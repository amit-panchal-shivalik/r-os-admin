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

export type AddHolidayGroupPayload = {
  name: string;
  holiday_id: string[];
};

export type AddHolidayGroupResponse = {
  success?: boolean;
  message?: string;
  result?: any;
};

export const addHolidayGroupApi = async (data: AddHolidayGroupPayload): Promise<AddHolidayGroupResponse> => {
  return apiRequest<AddHolidayGroupResponse>({
    url: 'users/add-holidaygroup',
    method: 'post',
    data,
  });
};

export interface HolidayGroupItem {
  _id: string;
  name: string;
  holiday_ids?: string[];
  holidays?: HolidayItem[];
  createdAt?: string;
}

export interface GetHolidayGroupsResponse {
  success?: boolean;
  message?: HolidayGroupItem[];
  result?: any;
}

export const getHolidayGroupsApi = async (): Promise<GetHolidayGroupsResponse> => {
  return apiRequest<GetHolidayGroupsResponse>({
    url: 'users/holidaygroup-list',
    method: 'get',
  });
};

export type EditHolidayGroupPayload = {
  id: string;
  name: string;
  holiday_id: string[];
};

export type EditHolidayGroupResponse = {
  success?: boolean;
  message?: string;
  result?: any;
};

export const editHolidayGroupApi = async (data: EditHolidayGroupPayload): Promise<EditHolidayGroupResponse> => {
  return apiRequest<EditHolidayGroupResponse>({
    url: 'users/edit-holidaygroup',
    method: 'post',
    data,
  });
};

export type DeleteHolidayGroupPayload = { id: string };
export type DeleteHolidayGroupResponse = { success?: boolean; message?: string; result?: any };

export const deleteHolidayGroupApi = async (data: DeleteHolidayGroupPayload): Promise<DeleteHolidayGroupResponse> => {
  return apiRequest<DeleteHolidayGroupResponse>({
    url: 'users/delete-holidaygroup',
    method: 'post',
    data,
  });
};

export type DeleteHolidayPayload = {
  id: string;
};

export type DeleteHolidayResponse = {
  success: boolean;
  message?: string;
  result?: any;
};

export const deleteHolidayApi = async (data: DeleteHolidayPayload): Promise<DeleteHolidayResponse> => {
  return apiRequest<DeleteHolidayResponse>({
    url: 'users/delete-holiday',
    method: 'post',
    data,
  });
};

/* Assignments APIs */
export type GetHolidayGroupAssignmentsResponse = {
  success?: boolean;
  message?: any[];
  result?: any;
};

export const getHolidayGroupAssignmentsApi = async (): Promise<GetHolidayGroupAssignmentsResponse> => {
  return apiRequest<GetHolidayGroupAssignmentsResponse>({
    url: 'users/holidaygroupassignment-list',
    method: 'get',
  });
};

export type AssignHolidayGroupPayload = {
  holiday_group_id: string;
  branch_id: string;
};

export type AssignHolidayGroupResponse = {
  success?: boolean;
  message?: string;
  result?: any;
};

export const assignHolidayGroupApi = async (data: AssignHolidayGroupPayload): Promise<AssignHolidayGroupResponse> => {
  return apiRequest<AssignHolidayGroupResponse>({
    url: 'users/assign-holidaygroup',
    method: 'post',
    data,
  });
};

export type DeleteAssignHolidayGroupPayload = { id: string };
export type DeleteAssignHolidayGroupResponse = { success?: boolean; message?: string; result?: any };

export const deleteAssignHolidayGroupApi = async (data: DeleteAssignHolidayGroupPayload): Promise<DeleteAssignHolidayGroupResponse> => {
  return apiRequest<DeleteAssignHolidayGroupResponse>({
    url: 'users/delete-assign-holidaygroup',
    method: 'post',
    data,
  });
};

export type EditHolidayPayload = {
  id: string;
  name: string;
  date: string;
  description?: string;
};

export type EditHolidayResponse = {
  success: boolean;
  message?: string;
  result?: any;
};

export const editHolidayApi = async (data: EditHolidayPayload): Promise<EditHolidayResponse> => {
  return apiRequest<EditHolidayResponse>({
    url: 'users/edit-holiday',
    method: 'post',
    data,
  });
};

export default {
  getHolidaysApi,
};
