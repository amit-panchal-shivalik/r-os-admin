import { apiRequest } from "./apiRequest";
import {
  CreateOpportunityPayload,
  Opportunity,
  ClaimResponse,
} from "@/types/ApiTypes";

export const createOpportunity = (payload: CreateOpportunityPayload) => {
  return apiRequest<Opportunity>({
    method: "POST",
    url: "/api/v1/opportunities",
    data: payload,
  });
};

export const claimOpportunity = (opportunityId: string) => {
  return apiRequest<ClaimResponse>({
    method: "POST",
    url: `/api/v1/opportunities/${opportunityId}/claim`,
  });
};
