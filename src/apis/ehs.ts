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

export type EquipmentPayload = {
  name: string;
  equipmentId: string;
  category?: string;
  siteId?: string;
  location?: string;
  make?: string;
  capacity?: string;
  lastTestDate?: string | null;
  testDueDate?: string | null;
  testedByAgency?: string;
  reportCheckedBy?: string;
  remarks?: string;
  isActive?: boolean;
};

export const createEquipment = async (payload: EquipmentPayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/equipments',
    data: payload,
  });

export const updateEquipment = async (id: string, payload: Partial<EquipmentPayload>) =>
  apiRequest({
    method: 'PATCH',
    url: `ehs/equipments/${id}`,
    data: payload,
  });

export const listEquipments = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/equipments',
    params,
  });

export const fetchEquipment = async (id: string) =>
  apiRequest({
    method: 'GET',
    url: `ehs/equipments/${id}`,
  });

export type FirstAidPayload = {
  siteId?: string;
  month: string;
  incidentDate: string;
  incidentTime?: string;
  contractorId?: string;
  injuredPerson: string;
  inductionNumber?: string;
  injuryDetails: string;
  treatmentProvided: string;
  treatmentGivenBy: string;
  facInvestigation?: string;
  investigatedBy?: string;
  remarks?: string;
};

export const createFirstAidCase = async (payload: FirstAidPayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/first-aid',
    data: payload,
  });

export const updateFirstAidCase = async (id: string, payload: Partial<FirstAidPayload>) =>
  apiRequest({
    method: 'PATCH',
    url: `ehs/first-aid/${id}`,
    data: payload,
  });

export const listFirstAidCases = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/first-aid',
    params,
  });

export const fetchFirstAidCase = async (id: string) =>
  apiRequest({
    method: 'GET',
    url: `ehs/first-aid/${id}`,
  });

export type ToolBoxTalkAttendeePayload = {
  govIdType?: string;
  govIdNumber?: string;
  name: string;
  designation?: string;
  subContractorName?: string;
  remarks?: string;
  signature?: string;
};

export type ToolBoxTalkPayload = {
  formNo?: string;
  revisionNo?: string;
  siteId?: string;
  contractorId?: string;
  projectName?: string;
  projectLocation?: string;
  contractorName?: string;
  discussionPoint: string;
  talkDate: string;
  talkTime?: string;
  conductedBy?: string;
  projectInCharge?: string;
  attendees: ToolBoxTalkAttendeePayload[];
};

export const createToolBoxTalk = async (payload: ToolBoxTalkPayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/toolbox-talks',
    data: payload,
  });

export const updateToolBoxTalk = async (id: string, payload: Partial<ToolBoxTalkPayload>) =>
  apiRequest({
    method: 'PATCH',
    url: `ehs/toolbox-talks/${id}`,
    data: payload,
  });

export const listToolBoxTalks = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/toolbox-talks',
    params,
  });

export const fetchToolBoxTalk = async (id: string) =>
  apiRequest({
    method: 'GET',
    url: `ehs/toolbox-talks/${id}`,
  });

export type ExcavatorChecklistItemPayload = {
  description: string;
  status?: 'OK' | 'NOT OK' | 'NA';
  needRepairs?: boolean;
  remark?: string;
};

export type ExcavatorChecklistPayload = {
  equipmentId: string;
  siteId?: string;
  inspectionDate: string;
  dueDate?: string;
  items: ExcavatorChecklistItemPayload[];
  checkedBySiteEngineer?: {
    name?: string;
    designation?: string;
    signature?: string;
  };
  checkedBySafetyOfficer?: {
    name?: string;
    designation?: string;
    signature?: string;
  };
  projectInChargeSignature?: string;
};

export const createExcavatorChecklist = async (payload: ExcavatorChecklistPayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/excavator-checklists',
    data: payload,
  });

export const updateExcavatorChecklist = async (id: string, payload: Partial<ExcavatorChecklistPayload>) =>
  apiRequest({
    method: 'PATCH',
    url: `ehs/excavator-checklists/${id}`,
    data: payload,
  });

export const listExcavatorChecklists = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/excavator-checklists',
    params,
  });

export const fetchExcavatorChecklist = async (id: string) =>
  apiRequest({
    method: 'GET',
    url: `ehs/excavator-checklists/${id}`,
  });

export type WeldingChecklistItemPayload = {
  description: string;
  status?: 'OK' | 'NOT OK' | 'NA';
  comment?: string;
};

export type WeldingChecklistPayload = {
  projectName?: string;
  contractorName?: string;
  equipmentNumber: string;
  make?: string;
  siteId?: string;
  inspectionDate: string;
  dueDate?: string;
  checklistNumber?: string;
  frequency?: string;
  items: WeldingChecklistItemPayload[];
  accepted?: boolean;
  comments?: string;
  inspectedBySafety?: {
    name?: string;
    signature?: string;
    date?: string;
  };
  areaEngineer?: {
    name?: string;
    signature?: string;
    date?: string;
  };
  projectInCharge?: {
    name?: string;
    signature?: string;
    date?: string;
  };
};

export const createWeldingChecklist = async (payload: WeldingChecklistPayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/welding-checklists',
    data: payload,
  });

export const updateWeldingChecklist = async (id: string, payload: Partial<WeldingChecklistPayload>) =>
  apiRequest({
    method: 'PATCH',
    url: `ehs/welding-checklists/${id}`,
    data: payload,
  });

export const listWeldingChecklists = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/welding-checklists',
    params,
  });

export const fetchWeldingChecklist = async (id: string) =>
  apiRequest({
    method: 'GET',
    url: `ehs/welding-checklists/${id}`,
  });

export type JcbChecklistItemPayload = {
  description: string;
  status?: 'YES' | 'NO' | 'NA';
  remark?: string;
};

export type ChecklistSignaturePayload = {
  name?: string;
  designation?: string;
  signature?: string;
  signedAt?: string | null;
};

export type JcbChecklistPayload = {
  siteId?: string;
  site?: {
    name?: string;
    location?: string;
  };
  equipmentSerialNumber: string;
  makeModel: string;
  vehicleNumber?: string;
  inspectionDate: string;
  items: JcbChecklistItemPayload[];
  equipmentFitForUse?: 'YES' | 'NO' | 'NA';
  generalRemarks?: string;
  inspectedBy?: ChecklistSignaturePayload;
  reviewedBy?: ChecklistSignaturePayload;
  projectInCharge?: ChecklistSignaturePayload;
  attachments?: string[];
};

export const createJcbChecklist = async (payload: JcbChecklistPayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/jcb-checklists',
    data: payload,
  });

export const updateJcbChecklist = async (id: string, payload: Partial<JcbChecklistPayload>) =>
  apiRequest({
    method: 'PATCH',
    url: `ehs/jcb-checklists/${id}`,
    data: payload,
  });

export const listJcbChecklists = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/jcb-checklists',
    params,
  });

export const fetchJcbChecklist = async (id: string) =>
  apiRequest({
    method: 'GET',
    url: `ehs/jcb-checklists/${id}`,
  });
