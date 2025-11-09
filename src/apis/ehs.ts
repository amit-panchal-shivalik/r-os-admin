import { apiRequest } from './apiRequest';

export type ApiResponse<T> = {
  result?: T;
  message?: string;
  [key: string]: any;
};

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
  apiRequest<ApiResponse<CurrentPermissionResponse>>({
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

export type ReinforcementWeekStatuses = {
  week1?: string;
  week2?: string;
  week3?: string;
  week4?: string;
  week5?: string;
};

export type ReinforcementCuttingItemPayload = {
  description: string;
  weeks: ReinforcementWeekStatuses;
  remarks?: string;
};

export type ReinforcementCuttingChecklistPayload = {
  projectName?: string;
  equipmentId: string;
  contractorName?: string;
  frequency?: string;
  monthStart?: string;
  monthEnd?: string;
  siteId?: string;
  items: ReinforcementCuttingItemPayload[];
  checkedByMachineOperator?: {
    name?: string;
    signature?: string;
    date?: string;
  };
  checkedBySafetyOfficer?: {
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

export const createReinforcementCuttingChecklist = async (payload: ReinforcementCuttingChecklistPayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/reinforcement-cutting-checklists',
    data: payload,
  });

export const updateReinforcementCuttingChecklist = async (
  id: string,
  payload: Partial<ReinforcementCuttingChecklistPayload>
) =>
  apiRequest({
    method: 'PATCH',
    url: `ehs/reinforcement-cutting-checklists/${id}`,
    data: payload,
  });

export const listReinforcementCuttingChecklists = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/reinforcement-cutting-checklists',
    params,
  });

export const fetchReinforcementCuttingChecklist = async (id: string) =>
  apiRequest({
    method: 'GET',
    url: `ehs/reinforcement-cutting-checklists/${id}`,
  });

export type ReinforcementBendingWeekStatus = 'OK' | 'NOT OK' | 'NA';

export type ReinforcementBendingItemPayload = {
  description: string;
  weeks: {
    week1?: ReinforcementBendingWeekStatus;
    week2?: ReinforcementBendingWeekStatus;
    week3?: ReinforcementBendingWeekStatus;
    week4?: ReinforcementBendingWeekStatus;
    week5?: ReinforcementBendingWeekStatus;
  };
  remarks?: string;
};

export type ReinforcementBendingChecklistPayload = {
  projectName?: string;
  equipmentId: string;
  contractorName?: string;
  frequency?: string;
  monthlyStartFrom: string;
  monthlyStartTo?: string;
  siteId?: string;
  items: ReinforcementBendingItemPayload[];
  checkedByOperator?: {
    name?: string;
    signature?: string;
    date?: string;
  };
  checkedBySafetyOfficer?: {
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

export const createReinforcementBendingChecklist = async (payload: ReinforcementBendingChecklistPayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/reinforcement-bending-checklists',
    data: payload,
  });

export const updateReinforcementBendingChecklist = async (
  id: string,
  payload: Partial<ReinforcementBendingChecklistPayload>
) =>
  apiRequest({
    method: 'PATCH',
    url: `ehs/reinforcement-bending-checklists/${id}`,
    data: payload,
  });

export const listReinforcementBendingChecklists = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/reinforcement-bending-checklists',
    params,
  });

export const fetchReinforcementBendingChecklist = async (id: string) =>
  apiRequest({
    method: 'GET',
    url: `ehs/reinforcement-bending-checklists/${id}`,
  });

export type DailyObservationEntryPayload = {
  date: string;
  observation: string;
  correctiveAction?: string;
  safetyPersonSign?: string;
  agencyResponsibleSign?: string;
  remarks?: string;
};

export type DailyObservationPayload = {
  projectName: string;
  projectLocation?: string;
  contractorName?: string;
  frequency?: string;
  siteId?: string;
  observations: DailyObservationEntryPayload[];
  projectManagerSign?: {
    name?: string;
    signature?: string;
    date?: string;
  };
};

export const createDailyObservation = async (payload: DailyObservationPayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/daily-observations',
    data: payload,
  });

export const updateDailyObservation = async (id: string, payload: Partial<DailyObservationPayload>) =>
  apiRequest({
    method: 'PATCH',
    url: `ehs/daily-observations/${id}`,
    data: payload,
  });

export const listDailyObservations = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/daily-observations',
    params,
  });

export const fetchDailyObservation = async (id: string) =>
  apiRequest({
    method: 'GET',
    url: `ehs/daily-observations/${id}`,
  });

export type PPEEntryPayload = {
  date: string;
  blueHelmet?: number;
  yellowHelmetMale?: number;
  yellowHelmetFemale?: number;
  redHelmet?: number;
  blueJacket?: number;
  yellowJacket?: number;
  orangeJacket?: number;
  safetyShoes?: number;
  gumShoes?: number;
  safetyBelt?: number;
  cutResistanceGloves?: number;
  cottonGloves?: number;
  rubberGloves?: number;
  leatherGloves?: number;
  earPlug?: number;
  noseMask?: number;
  fallArrestorRope?: number;
  carabinerLock?: number;
  remarks?: string;
};

export type PPERegisterPayload = {
  contractorName: string;
  siteId?: string;
  entries: PPEEntryPayload[];
};

export const createPPERegister = async (payload: PPERegisterPayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/ppe-registers',
    data: payload,
  });

export const updatePPERegister = async (id: string, payload: Partial<PPERegisterPayload>) =>
  apiRequest({
    method: 'PATCH',
    url: `ehs/ppe-registers/${id}`,
    data: payload,
  });

export const listPPERegisters = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/ppe-registers',
    params,
  });

export const fetchPPERegister = async (id: string) =>
  apiRequest({
    method: 'GET',
    url: `ehs/ppe-registers/${id}`,
  });

export type TruckInspectionStatus = 'OK' | 'NOT_OK' | 'NA';

export type TruckInspectionCheckpointPayload = {
  description: string;
  statuses: Array<{
    value: TruckInspectionStatus;
    notes?: string;
  }>;
};

export type TruckInspectionPayload = {
  inspectionDate: string;
  vehicleNumber: string;
  driverName: string;
  contractorName?: string;
  subContractorName?: string;
  frequency?: string;
  siteId?: string;
  checkpoints: TruckInspectionCheckpointPayload[];
  remarks?: string;
  driverSignature?: {
    name?: string;
    signature?: string;
    date?: string;
  };
  safetyOfficerSignature?: {
    name?: string;
    signature?: string;
    date?: string;
  };
  projectInChargeSignature?: {
    name?: string;
    signature?: string;
    date?: string;
  };
};

export const createTruckInspection = async (payload: TruckInspectionPayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/truck-inspections',
    data: payload,
  });

export const updateTruckInspection = async (id: string, payload: Partial<TruckInspectionPayload>) =>
  apiRequest({
    method: 'PATCH',
    url: `ehs/truck-inspections/${id}`,
    data: payload,
  });

export const listTruckInspections = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/truck-inspections',
    params,
  });

export const fetchTruckInspection = async (id: string) =>
  apiRequest({
    method: 'GET',
    url: `ehs/truck-inspections/${id}`,
  });

export type SafetyStatisticMetricPayload = {
  order: number;
  description: string;
  lastMonth?: number;
  cumulative?: number;
  units?: string;
};

export type SafetyStatisticsBoardPayload = {
  projectName: string;
  clientName?: string;
  contractorName?: string;
  date: string;
  manpowerStrength?: number;
  siteId?: string;
  metrics: SafetyStatisticMetricPayload[];
  target?: string;
  safetySlogan?: string;
};

export const createSafetyStatisticsBoard = async (payload: SafetyStatisticsBoardPayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/safety-statistics-boards',
    data: payload,
  });

export const updateSafetyStatisticsBoard = async (id: string, payload: Partial<SafetyStatisticsBoardPayload>) =>
  apiRequest({
    method: 'PATCH',
    url: `ehs/safety-statistics-boards/${id}`,
    data: payload,
  });

export const listSafetyStatisticsBoards = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/safety-statistics-boards',
    params,
  });

export const fetchSafetyStatisticsBoard = async (id: string) =>
  apiRequest({
    method: 'GET',
    url: `ehs/safety-statistics-boards/${id}`,
  });

export type AccidentSeverityRating = 1 | 2 | 3 | 4;

export type AccidentSeverityCategoryPayload = {
  potential?: AccidentSeverityRating | null;
  actual?: AccidentSeverityRating | null;
};

export type AccidentInvestigationInjuredPersonPayload = {
  name: string;
  employer?: string;
  trade?: string;
  idNumber?: string;
  employeeNumber?: string;
  nationality?: string;
  age?: number | null;
  gender?: string;
};

export type AccidentInvestigationIncidentDetailsPayload = {
  company?: string;
  activity?: string;
  location?: string;
  dateOfIncident?: string | null;
  timeOfIncident?: string;
  supervisor?: string;
  engineer?: string;
  equipmentTools?: string;
  chemicalSubstances?: string;
  workPermitNumber?: string;
  ppeUsed?: string;
};

export type AccidentSeverityMatrixPayload = {
  people?: AccidentSeverityCategoryPayload;
  asset?: AccidentSeverityCategoryPayload;
  environment?: AccidentSeverityCategoryPayload;
  reputation?: AccidentSeverityCategoryPayload;
};

export type AccidentInvestigationReportPayload = {
  projectName: string;
  reportDate?: string;
  reportNumber?: string;
  incidentClassification: 'Accident' | 'Dangerous Occurrence';
  accidentClassifications?: string[];
  levelOfInvestigation?: string;
  severity?: AccidentSeverityMatrixPayload;
  injuredPersons?: AccidentInvestigationInjuredPersonPayload[];
  totalInjured?: number;
  attachments?: string;
  summaryOfIncident?: string;
  incidentDetails?: AccidentInvestigationIncidentDetailsPayload;
  immediateActionTaken?: string;
  siteId?: string;
};

export const createAccidentInvestigationReport = async (payload: AccidentInvestigationReportPayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/accident-investigations',
    data: payload,
  });

export const updateAccidentInvestigationReport = async (id: string, payload: Partial<AccidentInvestigationReportPayload>) =>
  apiRequest({
    method: 'PATCH',
    url: `ehs/accident-investigations/${id}`,
    data: payload,
  });

export const listAccidentInvestigationReports = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/accident-investigations',
    params,
  });

export const fetchAccidentInvestigationReport = async (id: string) =>
  apiRequest({
    method: 'GET',
    url: `ehs/accident-investigations/${id}`,
  });

export type PortableEquipmentInspectionEntryPayload = {
  equipmentType: string;
  idNumber?: string;
  locationOfUse?: string;
  physicalCondition?: string;
  cableCondition?: string;
  safeFitForUse?: string;
  inspectionDate?: string | null;
  checkedBy?: string;
  remarks?: string;
};

export type PortableEquipmentInspectionPayload = {
  month: string;
  frequency?: string;
  siteId?: string;
  checkpointsNote?: string;
  projectInCharge?: string;
  inspections: PortableEquipmentInspectionEntryPayload[];
};

export const createPortableEquipmentInspection = async (payload: PortableEquipmentInspectionPayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/portable-equipment-inspections',
    data: payload,
  });

export const updatePortableEquipmentInspection = async (
  id: string,
  payload: Partial<PortableEquipmentInspectionPayload>
) =>
  apiRequest({
    method: 'PATCH',
    url: `ehs/portable-equipment-inspections/${id}`,
    data: payload,
  });

export const listPortableEquipmentInspections = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/portable-equipment-inspections',
    params,
  });

export const fetchPortableEquipmentInspection = async (id: string) =>
  apiRequest({
    method: 'GET',
    url: `ehs/portable-equipment-inspections/${id}`,
  });

export type SafetyViolationDebitNotePayload = {
  noteNumber?: string;
  date: string;
  time?: string;
  amount: number;
  currency?: string;
  companyOrStaff: string;
  subContractor?: string;
  site?: string;
  location?: string;
  violationNote?: string;
  additionalNotes?: string;
  responsiblePerson?: string;
  safetyOfficer?: string;
  projectManager?: string;
  contractorRepresentative?: string;
  siteId?: string;
};

export const createSafetyViolationDebitNote = async (payload: SafetyViolationDebitNotePayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/safety-violation-debit-notes',
    data: payload,
  });

export const updateSafetyViolationDebitNote = async (
  id: string,
  payload: Partial<SafetyViolationDebitNotePayload>
) =>
  apiRequest({
    method: 'PATCH',
    url: `ehs/safety-violation-debit-notes/${id}`,
    data: payload,
  });

export const listSafetyViolationDebitNotes = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/safety-violation-debit-notes',
    params,
  });

export const fetchSafetyViolationDebitNote = async (id: string) =>
  apiRequest({
    method: 'GET',
    url: `ehs/safety-violation-debit-notes/${id}`,
  });

export type DashboardComplianceMetric = {
  key?: string;
  title?: string;
  value?: number;
  target?: number;
  color?: string;
  subtitle?: string;
  targetLabel?: string;
};

export type DashboardActionItem = {
  id?: string;
  title?: string;
  owner?: string;
  due?: string | null;
  severity?: string;
};

export type DashboardActivity = {
  activity?: string;
  owner?: string;
  date?: string | null;
  status?: string;
};

export type DashboardIncident = {
  ref?: string;
  date?: string | null;
  category?: string;
  status?: string;
};

export type DashboardScorecardItem = {
  key?: string;
  title?: string;
  value?: number;
  color?: string;
  description?: string;
};

export type DashboardMetaStat = {
  key: string;
  label: string;
  value: string;
  helper?: string;
  trend?: 'up' | 'down' | 'flat';
  changeText?: string;
};

export type DashboardSummaryPayload = {
  siteId?: string;
  lastUpdatedOn?: string;
  complianceMetrics?: DashboardComplianceMetric[];
  actionItems?: DashboardActionItem[];
  upcomingActivities?: DashboardActivity[];
  incidents?: DashboardIncident[];
  scorecard?: DashboardScorecardItem[];
  meta?: DashboardMetaStat[];
  notes?: string;
};

export type DashboardSummaryRecord = DashboardSummaryPayload & {
  _id?: string;
  siteSnapshot?: {
    id?: string;
    name?: string;
    location?: string;
  };
  lastUpdatedOn?: string;
  updatedAt?: string;
  createdAt?: string;
};

export const fetchDashboardSummary = async (params?: { siteId?: string }) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/dashboard-summary',
    params,
  });

export const upsertDashboardSummary = async (payload: DashboardSummaryPayload) =>
  apiRequest({
    method: 'PUT',
    url: 'ehs/dashboard-summary',
    data: payload,
  });

export type FireExtinguisherEntryPayload = {
  extinguisherId: string;
  location?: string;
  type?: string;
  capacity?: string;
  hydrotestDoneOn?: string | null;
  hydrotestDueOn?: string | null;
  refillingDate?: string | null;
  refillingDueDate?: string | null;
  inspectionDate?: string | null;
  checkedBy?: string;
  remarks?: string;
};

export type FireExtinguisherMonitoringPayload = {
  siteId?: string;
  lastUpdatedOn?: string;
  checkpointsNote?: string;
  projectIncharge?: string;
  extinguishers: FireExtinguisherEntryPayload[];
};

export type FireExtinguisherMonitoringRecord = FireExtinguisherMonitoringPayload & {
  _id: string;
  siteSnapshot?: {
    id?: string;
    name?: string;
    location?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export const createFireExtinguisherMonitoring = async (payload: FireExtinguisherMonitoringPayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/fire-extinguisher-monitoring',
    data: payload,
  });

export const updateFireExtinguisherMonitoring = async (id: string, payload: Partial<FireExtinguisherMonitoringPayload>) =>
  apiRequest({
    method: 'PATCH',
    url: `ehs/fire-extinguisher-monitoring/${id}`,
    data: payload,
  });

export const listFireExtinguisherMonitoring = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/fire-extinguisher-monitoring',
    params,
  });

export const fetchFireExtinguisherMonitoring = async (id: string) =>
  apiRequest({
    method: 'GET',
    url: `ehs/fire-extinguisher-monitoring/${id}`,
  });

export type FirstAidChecklistMonth = 'jan' | 'feb' | 'mar' | 'apr' | 'may' | 'jun' | 'jul' | 'aug' | 'sep' | 'oct' | 'nov' | 'dec';

export type FirstAidChecklistEntryPayload = {
  item: string;
  months: Partial<Record<FirstAidChecklistMonth, boolean>>;
};

export type FirstAidChecklistPayload = {
  siteId?: string;
  responsibility?: string;
  year?: number;
  checklistEntries: FirstAidChecklistEntryPayload[];
  checkedBy?: string;
  checkedOn?: string;
  projectIncharge?: string;
  notes?: string;
};

export type FirstAidChecklistRecord = FirstAidChecklistPayload & {
  _id: string;
  siteSnapshot?: {
    id?: string;
    name?: string;
    location?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export const createFirstAidChecklist = async (payload: FirstAidChecklistPayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/first-aid-checklists',
    data: payload,
  });

export const updateFirstAidChecklist = async (id: string, payload: Partial<FirstAidChecklistPayload>) =>
  apiRequest({
    method: 'PATCH',
    url: `ehs/first-aid-checklists/${id}`,
    data: payload,
  });

export const listFirstAidChecklists = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/first-aid-checklists',
    params,
  });

export const fetchFirstAidChecklist = async (id: string) =>
  apiRequest({
    method: 'GET',
    url: `ehs/first-aid-checklists/${id}`,
  });

export type MockDrillScheduleEntryPayload = {
  emergencyType: string;
  status?: string;
  months: Partial<Record<FirstAidChecklistMonth, boolean>>;
};

export type MockDrillSchedulePayload = {
  siteId?: string;
  year?: number;
  preparedBy?: string;
  checkedBy?: string;
  chargeSign?: string;
  projectInCharge?: string;
  notes?: string;
  entries: MockDrillScheduleEntryPayload[];
};

export type MockDrillScheduleRecord = MockDrillSchedulePayload & {
  _id: string;
  siteSnapshot?: {
    id?: string;
    name?: string;
    location?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export const createMockDrillSchedule = async (payload: MockDrillSchedulePayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/mock-drill-schedules',
    data: payload,
  });

export const updateMockDrillSchedule = async (id: string, payload: Partial<MockDrillSchedulePayload>) =>
  apiRequest({
    method: 'PATCH',
    url: `ehs/mock-drill-schedules/${id}`,
    data: payload,
  });

export const listMockDrillSchedules = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/mock-drill-schedules',
    params,
  });

export const fetchMockDrillSchedule = async (id: string) =>
  apiRequest({
    method: 'GET',
    url: `ehs/mock-drill-schedules/${id}`,
  });

export type MockDrillReportPayload = {
  siteId?: string;
  mockDrillNumber?: string;
  mockDrillDate: string;
  time?: string;
  typeOfEmergency?: string;
  location?: string;
  shift?: string;
  observers?: string[];
  observations?: string;
  usageOfExtinguishers?: string;
  disposalOfAsh?: string;
  headCount?: string;
  actionPlan?: string;
  preparedBy?: string;
  checkedBy?: string;
  chargeSign?: string;
  projectInCharge?: string;
  notes?: string;
};

export type MockDrillReportRecord = MockDrillReportPayload & {
  _id: string;
  siteSnapshot?: {
    id?: string;
    name?: string;
    location?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export const createMockDrillReport = async (payload: MockDrillReportPayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/mock-drill-reports',
    data: payload,
  });

export const updateMockDrillReport = async (id: string, payload: Partial<MockDrillReportPayload>) =>
  apiRequest({
    method: 'PATCH',
    url: `ehs/mock-drill-reports/${id}`,
    data: payload,
  });

export const listMockDrillReports = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/mock-drill-reports',
    params,
  });

export const fetchMockDrillReport = async (id: string) =>
  apiRequest({
    method: 'GET',
    url: `ehs/mock-drill-reports/${id}`,
  });

export type LadderInspectionEntryPayload = {
  ladderId: string;
  material?: string;
  location?: string;
  portable?: string;
  condition?: string;
  inspectionDate?: string | null;
  inspectedBy?: string;
  remarks?: string;
};

export type LadderInspectionPayload = {
  siteId?: string;
  frequency?: string;
  projectInCharge?: string;
  notes?: string;
  entries: LadderInspectionEntryPayload[];
};

export type LadderInspectionRecord = LadderInspectionPayload & {
  _id: string;
  siteSnapshot?: {
    id?: string;
    name?: string;
    location?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export const createLadderInspection = async (payload: LadderInspectionPayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/ladder-inspections',
    data: payload,
  });

export const updateLadderInspection = async (id: string, payload: Partial<LadderInspectionPayload>) =>
  apiRequest({
    method: 'PATCH',
    url: `ehs/ladder-inspections/${id}`,
    data: payload,
  });

export const listLadderInspections = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/ladder-inspections',
    params,
  });

export const fetchLadderInspection = async (id: string) =>
  apiRequest({
    method: 'GET',
    url: `ehs/ladder-inspections/${id}`,
  });

export type HeightSafetyPayload = {
  siteId?: string;
  date: string;
  contractorName?: string;
  personName?: string;
  inductionNumber?: string;
  department?: string;
  shift?: string;
  pulseCondition?: string;
  pulseActual?: string;
  fitsCondition?: string;
  fitsActual?: string;
  visionCondition?: string;
  visionActual?: string;
  fearCondition?: string;
  fearActual?: string;
  dizzinessCondition?: string;
  dizzinessActual?: string;
  awarenessCondition?: string;
  awarenessActual?: string;
  conclusion?: string;
  checkedBy?: string;
  projectInCharge?: string;
  notes?: string;
};

export type HeightSafetyRecord = HeightSafetyPayload & {
  _id: string;
  siteSnapshot?: {
    id?: string;
    name?: string;
    location?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export const createHeightSafety = async (payload: HeightSafetyPayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/height-safety',
    data: payload,
  });

export const updateHeightSafety = async (id: string, payload: Partial<HeightSafetyPayload>) =>
  apiRequest({
    method: 'PATCH',
    url: `ehs/height-safety/${id}`,
    data: payload,
  });

export const listHeightSafety = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/height-safety',
    params,
  });

export const fetchHeightSafety = async (id: string) =>
  apiRequest({
    method: 'GET',
    url: `ehs/height-safety/${id}`,
  });

export type ScaffoldInspectionStatus = 'YES' | 'NO' | 'NA';

export type ScaffoldInspectionCheckpointPayload = {
  key: string;
  status?: ScaffoldInspectionStatus;
};

export type ScaffoldInspectionChecklistPayload = {
  siteId?: string;
  inspectionDate: string;
  location?: string;
  frequency?: string;
  scaffoldTypes?: string[];
  checkpoints: ScaffoldInspectionCheckpointPayload[];
  remarks?: string;
  inspectedBy?: string;
  projectInCharge?: string;
  fitnessStatus?: 'Fit' | 'Unfit';
};

export type ScaffoldInspectionChecklistRecord = ScaffoldInspectionChecklistPayload & {
  _id: string;
  siteSnapshot?: {
    id?: string;
    name?: string;
    location?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export const createScaffoldInspectionChecklist = async (payload: ScaffoldInspectionChecklistPayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/scaffold-inspections',
    data: payload,
  });

export const updateScaffoldInspectionChecklist = async (
  id: string,
  payload: Partial<ScaffoldInspectionChecklistPayload>
) =>
  apiRequest({
    method: 'PATCH',
    url: `ehs/scaffold-inspections/${id}`,
    data: payload,
  });

export const listScaffoldInspectionChecklists = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/scaffold-inspections',
    params,
  });

export const fetchScaffoldInspectionChecklist = async (id: string) =>
  apiRequest({
    method: 'GET',
    url: `ehs/scaffold-inspections/${id}`,
  });

export type WorkPermitPayload = {
  siteId?: string;
  permitDate?: string;
  permitTypes?: string[];
  permitReceiverType?: string;
  siteName?: string;
  exactLocation?: string;
  natureOfWork?: string[];
  jobDescription?: string;
  toolsEquipment?: string;
  validityFrom?: string;
  validityTo?: string;
  validityDate?: string;
  validityShift?: string;
  responsiblePerson?: string;
  serviceAgency?: string;
  emergencyContact?: string;
  personsDeployed?: string;
  hazardConsiderations?: string[];
  hazardOther?: string;
  preparationChecks?: string[];
  preparationExtra?: string;
  ppeRequired?: string[];
  ppeOthers?: string;
  specificCaution?: string;
  projectInChargeName?: string;
  projectInChargeSign?: string;
  ehsPersonName?: string;
  ehsPersonSign?: string;
  permitIssuedByName?: string;
  permitIssuedBySign?: string;
  permitReceivedByName?: string;
  permitReceivedBySign?: string;
  certificationName?: string;
  certificationSign?: string;
  closureStatus?: string;
  closureReceiverName?: string;
  closureReceiverSign?: string;
  closureReceiverDateTime?: string;
  closureIssuerName?: string;
  closureIssuerSign?: string;
  closureIssuerDateTime?: string;
  finalInspectorName?: string;
  finalInspectorSign?: string;
  finalInspectorDateTime?: string;
  notes?: string;
};

export type WorkPermitRecord = WorkPermitPayload & {
  _id: string;
  siteSnapshot?: {
    id?: string;
    name?: string;
    location?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export const createWorkPermit = async (payload: WorkPermitPayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/work-permits',
    data: payload,
  });

export const updateWorkPermit = async (id: string, payload: Partial<WorkPermitPayload>) =>
  apiRequest({
    method: 'PATCH',
    url: `ehs/work-permits/${id}`,
    data: payload,
  });

export const listWorkPermits = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/work-permits',
    params,
  });

export const fetchWorkPermit = async (id: string) =>
  apiRequest({
    method: 'GET',
    url: `ehs/work-permits/${id}`,
  });

export type EhsCoreTeamMemberPayload = {
  name: string;
  designation?: string;
  department?: string;
  contactNumber?: string;
};

export type EhsCoreTeamPayload = {
  siteId?: string;
  lastReviewDate?: string;
  members: EhsCoreTeamMemberPayload[];
  preparedBy?: string;
  approvedBy?: string;
};

export type EhsCoreTeamRecord = EhsCoreTeamPayload & {
  _id: string;
  siteSnapshot?: {
    id?: string;
    name?: string;
    location?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export const createEhsCoreTeam = async (payload: EhsCoreTeamPayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/core-team',
    data: payload,
  });

export const updateEhsCoreTeam = async (id: string, payload: Partial<EhsCoreTeamPayload>) =>
  apiRequest({
    method: 'PATCH',
    url: `ehs/core-team/${id}`,
    data: payload,
  });

export const listEhsCoreTeams = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/core-team',
    params,
  });

export const fetchEhsCoreTeam = async (id: string) =>
  apiRequest({
    method: 'GET',
    url: `ehs/core-team/${id}`,
  });

export type CommitteeParticipantPayload = {
  name: string;
  designation?: string;
};

export type CommitteeAgendaPayload = {
  title: string;
  discussion?: string;
  responsible?: string;
  targetDate?: string;
};

export type EhsCommitteeMomPayload = {
  siteId?: string;
  nameOfMeeting?: string;
  meetingNumber?: string;
  meetingDate?: string;
  financialYear?: string;
  membersPresent: CommitteeParticipantPayload[];
  membersAbsent: CommitteeParticipantPayload[];
  agendaItems: CommitteeAgendaPayload[];
  preparedBy?: string;
  projectInChargeSign?: string;
};

export type EhsCommitteeMomRecord = EhsCommitteeMomPayload & {
  _id: string;
  siteSnapshot?: {
    id?: string;
    name?: string;
    location?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export const createEhsCommitteeMom = async (payload: EhsCommitteeMomPayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/committee-mom',
    data: payload,
  });

export const updateEhsCommitteeMom = async (id: string, payload: Partial<EhsCommitteeMomPayload>) =>
  apiRequest({
    method: 'PATCH',
    url: `ehs/committee-mom/${id}`,
    data: payload,
  });

export const listEhsCommitteeMoms = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/committee-mom',
    params,
  });

export const fetchEhsCommitteeMom = async (id: string) =>
  apiRequest({
    method: 'GET',
    url: `ehs/committee-mom/${id}`,
  });

export type NearMissActionPayload = {
  description: string;
  responsibility?: string;
  dueDate?: string;
  completedDate?: string;
};

export type NearMissReportPayload = {
  siteId?: string;
  reportNumber?: string;
  severityLevel?: string;
  department?: string;
  reportedTime?: string;
  reportedDate?: string;
  location?: string;
  description?: string;
  immediateAction?: string;
  reportedBy?: string;
  investigationManager?: string;
  investigationDate?: string;
  investigationTeam?: string;
  rootCause?: string;
  correctiveActions: NearMissActionPayload[];
  riskAssessmentUpdate?: string;
  additionalAreasInformed?: string;
  documentsUpdateRequired?: string;
  reviewComments?: string;
  reviewDate?: string;
  reviewerSignature?: string;
};

export type NearMissReportRecord = NearMissReportPayload & {
  _id: string;
  siteSnapshot?: {
    id?: string;
    name?: string;
    location?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export const createNearMissReport = async (payload: NearMissReportPayload) =>
  apiRequest({
    method: 'POST',
    url: 'ehs/near-miss-reports',
    data: payload,
  });

export const updateNearMissReport = async (id: string, payload: Partial<NearMissReportPayload>) =>
  apiRequest({
    method: 'PATCH',
    url: `ehs/near-miss-reports/${id}`,
    data: payload,
  });

export const listNearMissReports = async (params?: Record<string, unknown>) =>
  apiRequest({
    method: 'GET',
    url: 'ehs/near-miss-reports',
    params,
  });

export const fetchNearMissReport = async (id: string) =>
  apiRequest({
    method: 'GET',
    url: `ehs/near-miss-reports/${id}`,
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
