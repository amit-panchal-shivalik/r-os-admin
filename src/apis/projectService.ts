import { apiRequest } from "./apiRequest";
import {
  CreateProjectPayload,
  ProjectPublishResponse,
} from "@/types/ApiTypes";

export const publishProject = (payload: CreateProjectPayload) => {
  return apiRequest<ProjectPublishResponse>({
    method: "POST",
    url: "/api/v1/projects",
    data: payload,
  });
};
