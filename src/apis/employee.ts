import { apiRequest } from './apiRequest';

export type EmployeeItem = {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  phone?: string;
  branch?: string | { name?: string };
  department?: string | { name?: string };
  dob?: string;
  dateOfBirth?: string;
  isActive?: boolean;
  [key: string]: unknown;
};

export type GetEmployeesPayload = {
  id: string;
};

export type GetEmployeesResponse = {
  message: EmployeeItem[];
  result: Record<string, unknown>;
};

export const getEmployeesApi = async (data: GetEmployeesPayload): Promise<GetEmployeesResponse> => {
  return apiRequest<GetEmployeesResponse>({
    method: 'POST',
    url: 'users/employee-list',
    data,
  });
};

export type ListItem = {
  _id?: string;
  name?: string;
  [key: string]: unknown;
};

export type GetListResponse = {
  message: ListItem[];
  result: Record<string, unknown>;
};

export const getDepartmentsApi = async (): Promise<GetListResponse> => {
  return apiRequest<GetListResponse>({
    method: 'POST',
    url: 'users/department-list',
    data: {},
  });
};

export const getBranchesApi = async (): Promise<GetListResponse> => {
  return apiRequest<GetListResponse>({
    method: 'POST',
    url: 'users/branch-list',
    data: {},
  });
};

export default getEmployeesApi;

export type AddEmployeePayload = {
  name: string;
  email: string;
  phone: string;
  role: string;
  department_id: string;
  branch_id: string;
  manager_id?: string;
};

export type AddEmployeeResponse = {
  success: boolean;
  message?: string;
  result?: any;
};

export const addEmployeeApi = async (data: AddEmployeePayload): Promise<AddEmployeeResponse> => {
  return apiRequest<AddEmployeeResponse>({
    method: 'POST',
    url: 'users/add-employee',
    data,
  });
};
