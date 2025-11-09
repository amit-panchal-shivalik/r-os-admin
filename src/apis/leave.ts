import { apiRequest } from './apiRequest';

export type AddLeaveTypePayload = {
  name: string;
  applyOnHoliday: boolean;
  applyOnPastDays: boolean;
  applyBeforeDays?: number;
  isActive: boolean;
};

export type LeaveTypeItem = {
  _id: string;
  name: string;
  applyOnHoliday: boolean;
  applyOnPastDays: boolean;
  applyBeforeDays?: number;
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
  applyBeforeDays?: number;
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

export type LeaveGroupLeaveType = {
  leave_type_id: string | number;
  paid_leaves: number;
};

export type AddLeaveGroupPayload = {
  name: string;
  leave_types: LeaveGroupLeaveType[];
  allocation_type: 'Yearly' | 'Monthly' | string;
  year_end_policy:
    | 'PayoutManual'
    | 'PayoutAuto'
    | 'CarryForwardManual'
    | 'CarryForwardAuto'
    | 'Reset'
    | string;
};

export type AddLeaveGroupResponse = {
  message: Record<string, unknown>;
  result: Record<string, unknown>;
};

export const addLeaveGroupApi = async (data: AddLeaveGroupPayload): Promise<AddLeaveGroupResponse> => {
  console.log('Adding leave group with data:', data);
  return apiRequest<AddLeaveGroupResponse>({
    method: 'POST',
    url: 'users/add-leavegroup',
    data,
  });
};

export type LeaveGroupLeaveTypeItem = {
  leave_type_id: {
    _id: string;
    name: string;
  } | string | number;
  paid_leaves: number;
  _id?: string;
};

export type LeaveGroupItem = {
  _id: string;
  name: string;
  leave_types: LeaveGroupLeaveTypeItem[];
  allocation_type: string;
  year_end_policy: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type GetLeaveGroupsResponse = {
  message: LeaveGroupItem[];
  result: Record<string, unknown>;
};

export const getLeaveGroupsApi = async (): Promise<GetLeaveGroupsResponse> => {
  return apiRequest<GetLeaveGroupsResponse>({
    method: 'GET',
    url: 'users/leavegroup-list',
  });
};

export type EditLeaveGroupPayload = {
  id: string;
  name: string;
  leave_types: LeaveGroupLeaveType[];
  allocation_type: 'Yearly' | 'Monthly' | string;
  year_end_policy:
    | 'PayoutManual'
    | 'PayoutAuto'
    | 'CarryForwardManual'
    | 'CarryForwardAuto'
    | 'Reset'
    | string;
  isActive?: boolean;
};

export type EditLeaveGroupResponse = {
  message: Record<string, unknown>;
  result: Record<string, unknown>;
};

export const editLeaveGroupApi = async (data: EditLeaveGroupPayload): Promise<EditLeaveGroupResponse> => {
  return apiRequest<EditLeaveGroupResponse>({
    method: 'POST',
    url: 'users/edit-leavegroup',
    data,
  });
};

export type DeleteLeaveGroupPayload = {
  id: string;
};

export type DeleteLeaveGroupResponse = {
  message: Record<string, unknown>;
  result: Record<string, unknown>;
};

export const deleteLeaveGroupApi = async (data: DeleteLeaveGroupPayload): Promise<DeleteLeaveGroupResponse> => {
  return apiRequest<DeleteLeaveGroupResponse>({
    method: 'POST',
    url: 'users/delete-leavegroup',
    data,
  });
};

export type AddLeaveAssignmentPayload = {
  branch_id?: string;
  department_id?: string;
  leave_group_id: string;
  year: string | number;
};

export type AddLeaveAssignmentResponse = {
  message: Record<string, unknown> | string;
  result: Record<string, unknown>;
};

export const addLeaveAssignmentApi = async (data: AddLeaveAssignmentPayload): Promise<AddLeaveAssignmentResponse> => {
  return apiRequest<AddLeaveAssignmentResponse>({
    method: 'POST',
    url: 'users/add-leaveassignment',
    data,
  });
};

export type GetLeaveAssignmentsPayload = {
  // optional filters could be added here
};

export type LeaveAssignmentItem = {
  _id: string;
  branch_id?: string;
  department_id?: string;
  leave_group_id?: string;
  year?: string | number;
  createdAt?: string;
  updatedAt?: string;
};

export type GetLeaveAssignmentsResponse = {
  message: LeaveAssignmentItem[];
  result: Record<string, unknown>;
};

export const getLeaveAssignmentsApi = async (data?: GetLeaveAssignmentsPayload): Promise<GetLeaveAssignmentsResponse> => {
  return apiRequest<GetLeaveAssignmentsResponse>({
    method: 'POST',
    url: 'users/leaveassignment-list',
    data: data || {},
  });
};

export type DeleteLeaveAssignmentPayload = { id: string };
export type DeleteLeaveAssignmentResponse = { message: Record<string, unknown> | string; result: Record<string, unknown> };

export const deleteLeaveAssignmentApi = async (data: DeleteLeaveAssignmentPayload): Promise<DeleteLeaveAssignmentResponse> => {
  return apiRequest<DeleteLeaveAssignmentResponse>({
    method: 'POST',
    url: 'users/delete-leaveassignment',
    data,
  });
};

export type GetEmployeeLeaveBalancePayload = {
  branch_id: string;
  department_id: string;
  year: string | number;
};

export type EmployeeLeaveBalanceItem = Record<string, any>;

export type GetEmployeeLeaveBalanceResponse = {
  message: EmployeeLeaveBalanceItem[];
  result?: Record<string, unknown>;
};

export const getEmployeeLeaveBalanceApi = async (data: GetEmployeeLeaveBalancePayload): Promise<GetEmployeeLeaveBalanceResponse> => {
  return apiRequest<GetEmployeeLeaveBalanceResponse>({
    method: 'POST',
    url: 'users/employee-leave-balance',
    data,
  });
};

export type GetManagerLeaveRequestsPayload = {
  id: string; // manager id
  status?: 'Pending' | 'Approved' | 'Rejected' | string;
};

export type ManagerLeaveRequestItem = Record<string, any>;

export type GetManagerLeaveRequestsResponse = {
  message: ManagerLeaveRequestItem[];
  result?: Record<string, unknown>;
};

export const getManagerLeaveRequestsApi = async (data: GetManagerLeaveRequestsPayload): Promise<GetManagerLeaveRequestsResponse> => {
  return apiRequest<GetManagerLeaveRequestsResponse>({
    method: 'POST',
    url: 'users/manager-leave-requests',
    data,
  });
};

export type ApproveLeavePayload = {
  request_id: string;
};

export type ApproveLeaveResponse = {
  message: Record<string, unknown> | string;
  result?: Record<string, unknown>;
};

export const approveLeaveApi = async (data: ApproveLeavePayload): Promise<ApproveLeaveResponse> => {
  return apiRequest<ApproveLeaveResponse>({
    method: 'POST',
    url: 'users/approve-leave',
    data,
  });
};

export type RejectLeavePayload = {
  request_id: string;
  rejection_reason: string;
};

export type RejectLeaveResponse = {
  message: Record<string, unknown> | string;
  result?: Record<string, unknown>;
};

export const rejectLeaveApi = async (data: RejectLeavePayload): Promise<RejectLeaveResponse> => {
  return apiRequest<RejectLeaveResponse>({
    method: 'POST',
    url: 'users/reject-leave',
    data,
  });
};
