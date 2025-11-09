import { apiRequest } from "./apiRequest";
import { AdminTerritoryPayload, TerritoryDetail } from "@/types/ApiTypes";

export const createAdminTerritory = (payload: AdminTerritoryPayload) => {
  return apiRequest<TerritoryDetail>({
    method: "POST",
    url: "/api/v1/admin/gis/territories",
    data: payload,
  });
};

export const updateAdminTerritory = (
  territoryId: string,
  payload: AdminTerritoryPayload
) => {
  return apiRequest<TerritoryDetail>({
    method: "PATCH",
    url: `/api/v1/admin/gis/territories/${territoryId}`,
    data: payload,
  });
};
