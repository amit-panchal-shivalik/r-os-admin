import { apiRequest } from './apiRequest';

export type SafetyInductionPayload = {
  formNo?: string;
  revisionNo?: string;
  siteId?: string;
  contractorId?: string;
  projectName: string;
  projectLocation: string;
  organizationName?: string;
  contractorName: string;
  projectInCharge?: string;
  inductionDate: string;
  timeFrom?: string;
  timeTo?: string;
  conductedByName: string;
  conductedByDesignation?: string;
  topicsCovered?: string[];
  attendees: Array<{
    name: string;
    age?: number;
    gender?: string;
    designation?: string;
    govIdType?: string;
    govIdNumber?: string;
    inductionNumber?: string;
    signature?: string;
  }>;
  notes?: string;
  attachments?: string[];
};

export const createSafetyInduction = async (payload: SafetyInductionPayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/safety-induction',
    data: payload,
  });

export const updateSafetyInduction = async (id: string, payload: Partial<SafetyInductionPayload>) =>
  apiRequest({
    method: 'PATCH',
    url: `ehs/safety-induction/${id}`,
    data: payload,
  });

export const listSafetyInductions = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/safety-induction',
    params,
  });

export const fetchSafetyInduction = async (id: string) =>
  apiRequest({
    method: 'GET',
    url: `ehs/safety-induction/${id}`,
  });

export const fetchWorkerProfile = async (params: { govIdNumber?: string; phoneNumber?: string }) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/workers/search',
    params,
  });

export type InductionTrackingPayload = {
  formNo?: string;
  revisionNo?: string;
  siteName?: string;
  companyName?: string;
  location?: string;
  siteId?: string;
  contractorId?: string;
  name: string;
  age?: number;
  gender?: string;
  contractorName?: string;
  designation?: string;
  skillLevel?: 'Skilled' | 'Unskilled';
  govIdType?: string;
  govIdNumber?: string;
  emergencyContactNumber?: string;
  inductionNumber?: string;
  firstReinductionDate?: string | null;
  secondReinductionDate?: string | null;
  thirdReinductionDate?: string | null;
  fourthReinductionDate?: string | null;
  remark?: string;
};

export const createInductionTrackingRecord = async (payload: InductionTrackingPayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/induction-tracking',
    data: payload,
  });

export const updateInductionTrackingRecord = async (id: string, payload: Partial<InductionTrackingPayload>) =>
  apiRequest({
    method: 'PATCH',
    url: `ehs/induction-tracking/${id}`,
    data: payload,
  });

export const listInductionTrackingRecords = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/induction-tracking',
    params,
  });

export type SitePayload = {
  name: string;
  location?: string;
  companyName?: string;
  code?: string;
  description?: string;
};

export const createSite = async (payload: SitePayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/sites',
    data: payload,
  });

export const listSites = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/sites',
    params,
  });

export type ContractorPayload = {
  name: string;
  companyName?: string;
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
};

export type ContractorResponse = ContractorPayload & {
  _id: string;
  partyProfileId?: string | null;
};

export const createContractor = async (payload: ContractorPayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/contractors',
    data: payload,
  });

export const listContractors = async (params?: Record<string, unknown>) =>
  apiRequest<{ result: ContractorResponse[] }>({
    method: 'GET',
    url: 'ehs/contractors',
    params,
  });

export type PartyProfileType = 'Contractor' | 'SubContractor' | 'Agency';

export type PartyProfilePayload = {
  name: string;
  displayName?: string;
  type: PartyProfileType;
  parentId?: string | null;
  linkedContractorId?: string | null;
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
};

export const listPartyProfiles = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/party-profiles',
    params,
  });

export const createPartyProfile = async (payload: PartyProfilePayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/party-profiles',
    data: payload,
  });

export const updatePartyProfile = async (id: string, payload: Partial<PartyProfilePayload>) =>
  apiRequest({
    method: 'PATCH',
    url: `ehs/party-profiles/${id}`,
    data: payload,
  });

export type ModulePermission = {
  module: string;
  actions: string[];
};

export type RolePermissionMatrix = {
  role: string;
  modulePermissions: ModulePermission[];
};

export type CurrentPermissionResponse = {
  roles: string[];
  modulePermissions: RolePermissionMatrix[];
};

export const fetchCurrentPermissions = async () =>
  apiRequest<CurrentPermissionResponse>({
    method: 'GET',
    url: 'permissions/me',
  });
