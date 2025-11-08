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

export default getEmployeesApi;
