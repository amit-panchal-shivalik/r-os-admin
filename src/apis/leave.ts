import { apiRequest } from './apiRequest';

export type AddLeaveTypePayload = {
  name: string;
  applyOnHoliday: boolean;
  applyOnPastDays: boolean;
  isActive: boolean;
};

export type LeaveTypeItem = {
  _id: string;
  name: string;
  applyOnHoliday: boolean;
  applyOnPastDays: boolean;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type GetLeaveTypesResponse = {
  message: LeaveTypeItem[];
  result: Record<string, unknown>;
};

export const getLeaveTypesApi = async (): Promise<GetLeaveTypesResponse> => {
  return apiRequest<GetLeaveTypesResponse>({
    method: 'GET',
    url: 'users/leavetype-list',
  });
};

export type AddLeaveTypeResponse = {
  message: LeaveTypeItem | Record<string, unknown>;
  result: Record<string, unknown>;
};

export const addLeaveTypeApi = async (data: AddLeaveTypePayload): Promise<AddLeaveTypeResponse> => {
  return apiRequest<AddLeaveTypeResponse>({
    method: 'POST',
    url: 'users/add-leavetype',
    data,
  });
};

export type DeleteLeaveTypePayload = {
  id: string;
};

export type DeleteLeaveTypeResponse = {
  message: Record<string, unknown>;
  result: Record<string, unknown>;
};

export const deleteLeaveTypeApi = async (data: DeleteLeaveTypePayload): Promise<DeleteLeaveTypeResponse> => {
  return apiRequest<DeleteLeaveTypeResponse>({
    method: 'POST',
    url: 'users/delete-leavetype',
    data,
  });
};

export type EditLeaveTypePayload = {
  id: string;
  name: string;
  applyOnHoliday: boolean;
  applyOnPastDays: boolean;
  isActive: boolean;
};

export type EditLeaveTypeResponse = {
  message: Record<string, unknown>;
  result: Record<string, unknown>;
};

export const editLeaveTypeApi = async (data: EditLeaveTypePayload): Promise<EditLeaveTypeResponse> => {
  return apiRequest<EditLeaveTypeResponse>({
    method: 'POST',
    url: 'users/edit-leavetype',
    data,
  });
};
