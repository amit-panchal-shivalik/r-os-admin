export interface TerritoryGeometry {
  type: "Polygon";
  coordinates: number[][][];
}

export interface TerritoryFeature {
  type: string;
  geometry: TerritoryGeometry;
  properties: Record<string, unknown>;
}

export interface TerritoryFeatureCollection {
  type: string;
  features: TerritoryFeature[];
}

export interface TerritorySnapshot {
  active_projects?: number;
  registered_professionals?: number;
  hot_leads?: number;
  local_pulses?: number;
}

export interface TerritoryOverview {
  territory_id?: string;
  name?: string;
  pin_code?: string;
  coordinates?: {
    lat?: number;
    lng?: number;
  };
  population?: number;
  area_sq_km?: number;
  snapshot?: TerritorySnapshot;
  statistics?: Record<string, unknown>;
}

export type ProfessionType = "cp_user" | "builder" | "architect";

export interface Professional {
  user_id?: string;
  full_name?: string;
  profession?: string;
  is_verified?: boolean;
  contact_info?: Record<string, unknown>;
}

export interface ProfessionalsResponse {
  professionals: Professional[];
}

export type ProjectStatus = "Under Construction" | "Ready" | "Possession Soon";

export interface ProjectSummary {
  project_id?: string;
  name?: string;
  status?: string;
  developer_name?: string;
  price_range?: string;
  configuration?: string;
  brochure_url?: string;
}

export interface ProjectsResponse {
  projects: ProjectSummary[];
}

export type PulseMediaType = "image" | "video";

export interface CreatePulsePayload {
  content: string;
  media_type: PulseMediaType;
  media_upload_key: string;
}

export interface PulseResponse {
  pulse_id?: string;
  territory_id?: string;
  content?: string;
  media_type?: PulseMediaType;
  media_upload_key?: string;
  created_by?: string;
  created_at?: string;
}

export interface PulseCommentPayload {
  comment_text: string;
}

export interface CommentResponse {
  comment_id?: string;
  pulse_id?: string;
  comment_text?: string;
  created_by?: string;
  created_at?: string;
}

export interface FollowResponse {
  status?: string;
  territory_id?: string;
}

export interface CreateOpportunityPayload {
  territory_id: string;
  type: string;
  title: string;
  description: string;
}

export interface Opportunity {
  opportunity_id?: string;
  territory_id?: string;
  type?: string;
  title?: string;
  description?: string;
  status?: string;
  created_by?: string;
  created_at?: string;
  claimed_by?: string;
  claimed_at?: string;
}

export interface ClaimResponse {
  status?: string;
  claimed_by_user_id?: string;
}

export interface CreateProjectPayload {
  territory_id: string;
  name: string;
  status: ProjectStatus;
  price_range: string;
  configuration: string;
  brochure_url: string;
  developer_name?: string;
  location?: {
    lat?: number;
    lng?: number;
  };
}

export interface ProjectPublishResponse {
  verification_status?: "pending" | "verified";
}

export interface ModerationItem {
  entity_id?: string;
  name?: string;
  type?: string;
  territory_id?: string;
  submitted_at?: string;
  status?: string;
}

export interface GovernanceModerationQueue {
  pending_projects: ModerationItem[];
  pending_professionals: ModerationItem[];
  pending_opportunities: ModerationItem[];
}

export type GovernanceEntityType = "project" | "professional" | "opportunity";

export interface VerifyEntityResponse {
  is_verified?: boolean;
}

export interface AdminTerritoryPayload {
  name: string;
  city: string;
  zone: string;
  pin_code: string;
  geometry: TerritoryGeometry;
}

export interface TerritoryDetail {
  territory_id?: string;
  name?: string;
  city?: string;
  zone?: string;
  pin_code?: string;
  geometry?: TerritoryGeometry;
  active_projects?: number;
  registered_professionals?: number;
  hot_leads?: number;
}
