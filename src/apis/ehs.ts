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
