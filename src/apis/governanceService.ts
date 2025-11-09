import { apiRequest } from "./apiRequest";
import {
  GovernanceModerationQueue,
  GovernanceEntityType,
  VerifyEntityResponse,
} from "@/types/ApiTypes";

export const fetchGovernanceQueue = (territoryId: string) => {
  return apiRequest<GovernanceModerationQueue>({
    method: "GET",
    url: `/api/v1/territories/${territoryId}/governance/moderation_queue`,
  });
};

export const verifyEntity = (
  entityType: GovernanceEntityType,
  entityId: string
) => {
  return apiRequest<VerifyEntityResponse>({
    method: "PATCH",
    url: `/api/v1/governance/verify/${entityType}/${entityId}`,
    data: {
      action: "approve",
    },
  });
};
