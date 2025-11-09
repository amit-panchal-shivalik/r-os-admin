import { apiRequest } from "./apiRequest";

export interface MeResponse {
  user_id?: string;
  mobile_number?: string;
  roles?: string[];
}

export const fetchCurrentUser = () => {
  return apiRequest<MeResponse>({
    method: "GET",
    url: "/api/v1/users/me",
  });
};
