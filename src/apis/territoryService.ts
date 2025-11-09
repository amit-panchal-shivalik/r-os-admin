import { apiRequest } from "./apiRequest";
import {
  TerritoryFeatureCollection,
  TerritoryOverview,
  ProfessionalsResponse,
  ProjectsResponse,
  CreatePulsePayload,
  PulseResponse,
  PulseCommentPayload,
  CommentResponse,
  FollowResponse,
  ProfessionType,
  ProjectStatus,
} from "@/types/ApiTypes";

/** Map & overview */
export const fetchTerritoryMapData = () => {
  return apiRequest<TerritoryFeatureCollection>({
    method: "GET",
    url: "/api/v1/territories/map_data",
  });
};

export const fetchTerritoryOverview = (territoryId: string) => {
  return apiRequest<TerritoryOverview>({
    method: "GET",
    url: `/api/v1/territories/${territoryId}/overview`,
  });
};

// Territory news by place (name or pin)
export interface TerritoryNewsItem {
  id: string;
  title: string;
  summary: string;
  type?: string;
  time?: string;
}

export interface TerritoryNewsResponse {
  news: TerritoryNewsItem[];
}

export const fetchTerritoryNews = (place: string) => {
  return apiRequest<TerritoryNewsResponse>({
    method: "GET",
    url: `/api/v1/maps/news?place=${data?.place || "gota"}`,
    params: { place },
  });
};

/** Professionals & projects */
export const fetchTerritoryProfessionals = (
  territoryId: string,
  professionType?: ProfessionType
) => {
  return apiRequest<ProfessionalsResponse>({
    method: "GET",
    url: `/api/v1/territories/${territoryId}/professionals`,
    params: professionType ? { profession_type: professionType } : undefined,
  });
};

export const fetchTerritoryProjects = (
  territoryId: string,
  status?: ProjectStatus
) => {
  return apiRequest<ProjectsResponse>({
    method: "GET",
    url: `/api/v1/territories/${territoryId}/projects`,
    params: status ? { status } : undefined,
  });
};

/** Pulses */
export const publishTerritoryPulse = (
  territoryId: string,
  payload: CreatePulsePayload
) => {
  return apiRequest<PulseResponse>({
    method: "POST",
    url: `/api/v1/territories/${territoryId}/pulses`,
    data: payload,
  });
};

export const addPulseComment = (
  pulseId: string,
  payload: PulseCommentPayload
) => {
  return apiRequest<CommentResponse>({
    method: "POST",
    url: `/api/v1/pulses/${pulseId}/comment`,
    data: payload,
  });
};

/** Follow / unfollow */
export const followTerritory = (territoryId: string) => {
  return apiRequest<FollowResponse>({
    method: "POST",
    url: `/api/v1/territories/${territoryId}/follow`,
  });
};

export const unfollowTerritory = (territoryId: string) => {
  return apiRequest<FollowResponse>({
    method: "DELETE",
    url: `/api/v1/territories/${territoryId}/follow`,
  });
};
