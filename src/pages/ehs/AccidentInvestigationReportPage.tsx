import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Group,
  Modal,
  NumberInput,
  ScrollArea,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Select,
  type SegmentedControlItem,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconAlertCircle, IconEye, IconPencil, IconPlus, IconPrinter, IconRefresh, IconTrash } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import dayjs from 'dayjs';
import EhsPageLayout from '@/components/ehs/EhsPageLayout';
import { usePermissions } from '@/hooks/usePermissions';
import { useSites } from '@/hooks/useSites';
import { useAccidentInvestigationReports, AccidentInvestigationReportRecord } from '@/hooks/useAccidentInvestigationReports';
import { AccidentInvestigationReportPayload, AccidentSeverityRating } from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';
import logo from '@/assets/ehs/Logo.jpeg';

const ACCIDENT_CLASSIFICATION_OPTIONS = [
  { value: 'Fatality', label: 'Fatality' },
  { value: 'P/TD', label: 'P/TD' },
  { value: 'LTA', label: 'LTA' },
  { value: 'LTI', label: 'LTI' },
  { value: 'RWC', label: 'RWC' },
  { value: 'MTC', label: 'MTC' },
  { value: 'FAC', label: 'FAC' },
  { value: 'Not Applicable', label: 'Not Applicable' },
] as const;

const INCIDENT_CLASSIFICATION_OPTIONS: SegmentedControlItem[] = [
  { value: 'Accident', label: 'Accident' },
  { value: 'Dangerous Occurrence', label: 'Dangerous Occurrence' },
];

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

type SeverityRow = {
  level: AccidentSeverityRating;
  people: string;
  asset: string;
  environment: string;
  reputation: string;
};

const SEVERITY_ROWS: SeverityRow[] = [
  {
    level: 1,
    people: 'Minor health effect / injury',
    asset: 'Minor damage',
    environment: 'Minor effect',
    reputation: 'Limited impact',
  },
  {
    level: 2,
    people: 'Major health effect / Injury including LTI',
    asset: 'Localised damage',
    environment: 'Localised effect',
    reputation: 'Considerable impact',
  },
  {
    level: 3,
    people: 'PTD / Multiple FTA',
    asset: 'Major damage',
    environment: 'Major effect',
    reputation: 'National / international impact',
  },
  {
    level: 4,
    people: 'Not Applicable',
    asset: 'Not Applicable',
    environment: 'Not Applicable',
    reputation: 'Not Applicable',
  },
];

type SeverityCategoryFormValue = {
  potential: AccidentSeverityRating | null;
  actual: AccidentSeverityRating | null;
};

type SeverityFormValues = {
  people: SeverityCategoryFormValue;
  asset: SeverityCategoryFormValue;
  environment: SeverityCategoryFormValue;
  reputation: SeverityCategoryFormValue;
};

type SeverityCategoryKey = keyof SeverityFormValues;
type SeverityFieldPath = `severity.${SeverityCategoryKey}.${'potential' | 'actual'}`;

type InjuredPersonFormValue = {
  name: string;
  employer: string;
  trade: string;
  idNumber: string;
  employeeNumber: string;
  nationality: string;
  age: number | null;
  gender: string;
};

type IncidentDetailsFormValue = {
  company: string;
  activity: string;
  location: string;
  dateOfIncident: Date | null;
  timeOfIncident: string;
  supervisor: string;
  engineer: string;
  equipmentTools: string;
  chemicalSubstances: string;
  workPermitNumber: string;
  ppeUsed: string;
};

type AccidentInvestigationFormValues = {
  projectName: string;
  reportDate: Date | null;
  reportNumber: string;
  incidentClassification: 'Accident' | 'Dangerous Occurrence';
  accidentClassifications: string[];
  levelOfInvestigation: string;
  severity: SeverityFormValues;
  injuredPersons: InjuredPersonFormValue[];
  totalInjured: number | null;
  attachments: string;
  summaryOfIncident: string;
  incidentDetails: IncidentDetailsFormValue;
  immediateActionTaken: string;
  siteId?: string;
};

const escapeHtml = (value?: string | number | null) => {
  if (value === undefined || value === null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const formatDateValue = (value?: string | Date | null) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return dayjs(date).format('DD.MM.YYYY');
};

const buildReportHtml = (record: AccidentInvestigationReportRecord, standalone = false) => {
  const severity = record.severity ?? {};
  const classificationRow = (label: string, checked: boolean) => `
    <span style="display:inline-flex;align-items:center;margin-right:18px;gap:6px;">
      <span style="width:14px;height:14px;border:1px solid #000;display:inline-flex;align-items:center;justify-content:center;">
        ${checked ? '<span style="font-size:12px;color:#000;">&#10003;</span>' : ''}
      </span>
      <span>${escapeHtml(label)}</span>
    </span>`;

  const isSelected = (category: SeverityCategoryKey, type: 'potential' | 'actual', level: AccidentSeverityRating) => {
    const categoryValues = severity?.[category];
    if (!categoryValues) return false;
    const value = categoryValues[type];
    if (value === null || value === undefined) return false;
    return Number(value) === level;
  };

  const severityRowsHtml = SEVERITY_ROWS.map(
    (row) => `
      <tr>
        <td style="border:1px solid #000;padding:8px;text-align:center;font-weight:600;background:#f3f3f3;">${row.level}</td>
        ${(['people', 'asset', 'environment', 'reputation'] as const)
          .map((category) => {
            const potentialSelected = isSelected(category, 'potential', row.level);
            const actualSelected = isSelected(category, 'actual', row.level);
            const baseStyle = 'border:1px solid #000;padding:8px;vertical-align:top;font-size:12px;line-height:1.3;background:#fff;';
            const selectedStyle = 'background:#fff6cc;font-weight:600;';
            return `
              <td style="${baseStyle}${potentialSelected ? selectedStyle : ''}">
                <span style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                  <span>${escapeHtml(row[category])}</span>
                  ${potentialSelected ? '<span style="font-size:12px;">&#10003;</span>' : ''}
                </span>
              </td>
              <td style="${baseStyle}${actualSelected ? selectedStyle : ''};text-align:center;">
                ${actualSelected ? '&#10003;' : ''}
              </td>`;
          })
          .join('')}
      </tr>`
  ).join('');

  const injuredPersons = Array.isArray(record.injuredPersons) ? record.injuredPersons : [];
  const injuredRows = (injuredPersons.length ? injuredPersons : Array.from({ length: 4 }).map(() => ({} as any))).map((person: any, index) => {
    const cell = 'border:1px solid #000;padding:6px;font-size:11px;background:#fff;min-height:28px;';
    return `
      <tr>
        <td style="${cell}text-align:center;">${index + 1}</td>
        <td style="${cell}">${escapeHtml(person?.name)}</td>
        <td style="${cell}">${escapeHtml(person?.employer)}</td>
        <td style="${cell}">${escapeHtml(person?.trade)}</td>
        <td style="${cell}">${escapeHtml(person?.idNumber)}</td>
        <td style="${cell}">${escapeHtml(person?.employeeNumber)}</td>
        <td style="${cell}">${escapeHtml(person?.nationality)}</td>
        <td style="${cell}">${escapeHtml(person?.age)}</td>
        <td style="${cell}">${escapeHtml(person?.gender)}</td>
      </tr>`;
  });

  const html = `
    <div style="font-family:Arial,sans-serif;background:#fff;color:#000;padding:24px;">
      <div style="border:2px solid #000;padding:20px;">
        <div style="display:grid;grid-template-columns:1.5fr 2fr 1.1fr;gap:18px;align-items:stretch;margin-bottom:16px;">
          <div style="background:#fff;border-radius:4px;border:1px solid #000;display:flex;align-items:center;justify-content:center;padding:16px;">
            <img src="${logo}" alt="Shivalik" style="max-width:140px;max-height:64px;object-fit:contain;" />
          </div>
          <div style="border:1px solid #000;background:#f3f3f3;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;letter-spacing:1px;text-transform:uppercase;text-align:center;padding:12px;">
            Accident Investigation Report
          </div>
          <div style="border:1px solid #000;background:#f3f3f3;padding:12px;font-size:12px;line-height:1.5;">
            <div>Format No.: EHS-F-15</div>
            <div>Rev. No.: 00</div>
            <div>Rev. Date:</div>
          </div>
        </div>

        <table style="width:100%;border-collapse:collapse;margin-bottom:12px;font-size:12px;">
          <tbody>
            <tr>
              <td style="border:1px solid #000;padding:8px;width:25%;background:#f7f7f7;font-weight:600;">Project Name:</td>
              <td style="border:1px solid #000;padding:8px;">${escapeHtml(record.projectName)}</td>
              <td style="border:1px solid #000;padding:8px;width:20%;background:#f7f7f7;font-weight:600;">Report Date:</td>
              <td style="border:1px solid #000;padding:8px;width:20%;">${formatDateValue(record.reportDate)}</td>
            </tr>
            <tr>
              <td style="border:1px solid #000;padding:8px;background:#f7f7f7;font-weight:600;">Report No.:</td>
              <td style="border:1px solid #000;padding:8px;">${escapeHtml(record.reportNumber)}</td>
              <td style="border:1px solid #000;padding:8px;background:#f7f7f7;font-weight:600;">Level of investigation:</td>
              <td style="border:1px solid #000;padding:8px;">${escapeHtml(record.levelOfInvestigation)}</td>
            </tr>
          </tbody>
        </table>

        <table style="width:100%;border-collapse:collapse;margin-bottom:12px;font-size:12px;">
          <tbody>
            <tr>
              <td style="border:1px solid #000;padding:8px;width:30%;background:#f7f7f7;font-weight:600;">1. Incident Classification:</td>
              <td style="border:1px solid #000;padding:8px;">
                ${classificationRow('Accident', (record.incidentClassification ?? 'Accident').toLowerCase() === 'accident')}
                ${classificationRow('Dangerous Occurrence', (record.incidentClassification ?? '').toLowerCase() === 'dangerous occurrence')}
              </td>
            </tr>
            <tr>
              <td style="border:1px solid #000;padding:8px;background:#f7f7f7;font-weight:600;">Accident Classification:</td>
              <td style="border:1px solid #000;padding:8px;">
                ${ACCIDENT_CLASSIFICATION_OPTIONS.map((option) =>
                  classificationRow(option.label, Array.isArray(record.accidentClassifications) && record.accidentClassifications.includes(option.value))
                ).join('')}
              </td>
            </tr>
          </tbody>
        </table>

        <div style="font-weight:600;text-transform:uppercase;margin:18px 0 8px;">2. Severity Classification:</div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:12px;font-size:11.5px;">
          <thead>
            <tr>
              <th rowspan="2" style="border:1px solid #000;padding:8px;background:#f3f3f3;">Rate</th>
              <th colspan="2" style="border:1px solid #000;padding:8px;background:#f3f3f3;">People</th>
              <th colspan="2" style="border:1px solid #000;padding:8px;background:#f3f3f3;">Asset</th>
              <th colspan="2" style="border:1px solid #000;padding:8px;background:#f3f3f3;">Environment</th>
              <th colspan="2" style="border:1px solid #000;padding:8px;background:#f3f3f3;">Reputation</th>
            </tr>
            <tr>
              <th style="border:1px solid #000;padding:6px;background:#f3f3f3;">Pot.</th>
              <th style="border:1px solid #000;padding:6px;background:#f3f3f3;">Act.</th>
              <th style="border:1px solid #000;padding:6px;background:#f3f3f3;">Pot.</th>
              <th style="border:1px solid #000;padding:6px;background:#f3f3f3;">Act.</th>
              <th style="border:1px solid #000;padding:6px;background:#f3f3f3;">Pot.</th>
              <th style="border:1px solid #000;padding:6px;background:#f3f3f3;">Act.</th>
              <th style="border:1px solid #000;padding:6px;background:#f3f3f3;">Pot.</th>
              <th style="border:1px solid #000;padding:6px;background:#f3f3f3;">Act.</th>
            </tr>
          </thead>
          <tbody>${severityRowsHtml}</tbody>
        </table>

        <div style="font-weight:600;text-transform:uppercase;margin:18px 0 8px;">3. Injured Person(s) ID:</div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:12px;font-size:11.5px;">
          <thead>
            <tr>
              <th style="border:1px solid #000;padding:6px;background:#f3f3f3;">No.</th>
              <th style="border:1px solid #000;padding:6px;background:#f3f3f3;">Name</th>
              <th style="border:1px solid #000;padding:6px;background:#f3f3f3;">Employer</th>
              <th style="border:1px solid #000;padding:6px;background:#f3f3f3;">Trade</th>
              <th style="border:1px solid #000;padding:6px;background:#f3f3f3;">ID No.</th>
              <th style="border:1px solid #000;padding:6px;background:#f3f3f3;">Employee No.</th>
              <th style="border:1px solid #000;padding:6px;background:#f3f3f3;">Nationality</th>
              <th style="border:1px solid #000;padding:6px;background:#f3f3f3;">Age</th>
              <th style="border:1px solid #000;padding:6px;background:#f3f3f3;">Gender</th>
            </tr>
          </thead>
          <tbody>${injuredRows.join('')}</tbody>
        </table>

        <table style="width:100%;border-collapse:collapse;margin-bottom:12px;font-size:12px;">
          <tbody>
            <tr>
              <td style="border:1px solid #000;padding:8px;width:35%;background:#f7f7f7;font-weight:600;">Total Number of Injured persons:</td>
              <td style="border:1px solid #000;padding:8px;">${escapeHtml(record.totalInjured ?? injuredPersons.length)}</td>
              <td style="border:1px solid #000;padding:8px;width:20%;background:#f7f7f7;font-weight:600;">Any attachment:</td>
              <td style="border:1px solid #000;padding:8px;">${escapeHtml(record.attachments)}</td>
            </tr>
          </tbody>
        </table>

        <div style="font-weight:600;text-transform:uppercase;margin:18px 0 8px;">4. Summary of incident:</div>
        <div style="border:1px solid #000;padding:12px;font-size:12px;min-height:80px;background:#fff;">${escapeHtml(record.summaryOfIncident)}</div>

        <div style="font-weight:600;text-transform:uppercase;margin:18px 0 8px;">5. Details of incident:</div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:12px;font-size:12px;">
          <tbody>
            <tr>
              <td style="border:1px solid #000;padding:8px;width:18%;background:#f7f7f7;font-weight:600;">Company:</td>
              <td style="border:1px solid #000;padding:8px;">${escapeHtml(record.incidentDetails?.company)}</td>
              <td style="border:1px solid #000;padding:8px;width:18%;background:#f7f7f7;font-weight:600;">Activity:</td>
              <td style="border:1px solid #000;padding:8px;">${escapeHtml(record.incidentDetails?.activity)}</td>
            </tr>
            <tr>
              <td style="border:1px solid #000;padding:8px;background:#f7f7f7;font-weight:600;">Location:</td>
              <td style="border:1px solid #000;padding:8px;">${escapeHtml(record.incidentDetails?.location)}</td>
              <td style="border:1px solid #000;padding:8px;background:#f7f7f7;font-weight:600;">Date of Incident:</td>
              <td style="border:1px solid #000;padding:8px;">${formatDateValue(record.incidentDetails?.dateOfIncident)}</td>
            </tr>
            <tr>
              <td style="border:1px solid #000;padding:8px;background:#f7f7f7;font-weight:600;">Time of Incident:</td>
              <td style="border:1px solid #000;padding:8px;">${escapeHtml(record.incidentDetails?.timeOfIncident)}</td>
              <td style="border:1px solid #000;padding:8px;background:#f7f7f7;font-weight:600;">Supervisor:</td>
              <td style="border:1px solid #000;padding:8px;">${escapeHtml(record.incidentDetails?.supervisor)}</td>
            </tr>
            <tr>
              <td style="border:1px solid #000;padding:8px;background:#f7f7f7;font-weight:600;">Engineer:</td>
              <td style="border:1px solid #000;padding:8px;">${escapeHtml(record.incidentDetails?.engineer)}</td>
              <td style="border:1px solid #000;padding:8px;background:#f7f7f7;font-weight:600;">Equipment/Tools:</td>
              <td style="border:1px solid #000;padding:8px;">${escapeHtml(record.incidentDetails?.equipmentTools)}</td>
            </tr>
            <tr>
              <td style="border:1px solid #000;padding:8px;background:#f7f7f7;font-weight:600;">Chemical/Substances:</td>
              <td style="border:1px solid #000;padding:8px;">${escapeHtml(record.incidentDetails?.chemicalSubstances)}</td>
              <td style="border:1px solid #000;padding:8px;background:#f7f7f7;font-weight:600;">Work permit No.:</td>
              <td style="border:1px solid #000;padding:8px;">${escapeHtml(record.incidentDetails?.workPermitNumber)}</td>
            </tr>
            <tr>
              <td style="border:1px solid #000;padding:8px;background:#f7f7f7;font-weight:600;">PPEs used:</td>
              <td style="border:1px solid #000;padding:8px;" colspan="3">${escapeHtml(record.incidentDetails?.ppeUsed)}</td>
            </tr>
          </tbody>
        </table>

        <div style="font-weight:600;text-transform:uppercase;margin:18px 0 8px;">6. Immediate action taken:</div>
        <div style="border:1px solid #000;padding:12px;font-size:12px;min-height:80px;background:#fff;">${escapeHtml(record.immediateActionTaken)}</div>
      </div>
    </div>`;

  if (standalone) {
    return `
      <html>
        <head>
          <title>Accident Investigation Report</title>
          <meta charset="utf-8" />
        </head>
        <body style="margin:0;background:#ffffff;">${html}</body>
      </html>`;
  }

  return html;
};

const createSeverityCategory = (): SeverityCategoryFormValue => ({ potential: null, actual: null });
const createIncidentDetails = (): IncidentDetailsFormValue => ({
  company: '',
  activity: '',
  location: '',
  dateOfIncident: null,
  timeOfIncident: '',
  supervisor: '',
  engineer: '',
  equipmentTools: '',
  chemicalSubstances: '',
  workPermitNumber: '',
  ppeUsed: '',
});
const createInjuredPerson = (): InjuredPersonFormValue => ({
  name: '',
  employer: '',
  trade: '',
  idNumber: '',
  employeeNumber: '',
  nationality: '',
  age: null,
  gender: '',
});

const getDefaultValues = (): AccidentInvestigationFormValues => ({
  projectName: '',
  reportDate: new Date(),
  reportNumber: '',
  incidentClassification: 'Accident',
  accidentClassifications: [],
  levelOfInvestigation: '',
  severity: {
    people: createSeverityCategory(),
    asset: createSeverityCategory(),
    environment: createSeverityCategory(),
    reputation: createSeverityCategory(),
  },
  injuredPersons: [createInjuredPerson()],
  totalInjured: 0,
  attachments: '',
  summaryOfIncident: '',
  incidentDetails: createIncidentDetails(),
  immediateActionTaken: '',
  siteId: undefined,
});

const formatDisplayDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dayjs(date).format('DD MMM YYYY');
};

const AccidentInvestigationReportPage = () => {
  const { can, loading: permissionsLoading, roles } = usePermissions();
  const { sites, loading: sitesLoading } = useSites();
  const { records, loading, fetchReports, createReport, updateReport } = useAccidentInvestigationReports({ limit: 50 });

  const [selectedRecord, setSelectedRecord] = useState<AccidentInvestigationReportRecord | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);

  const isSuperAdmin = roles.includes('SuperAdmin');
  const canView = isSuperAdmin || can('AccidentInvestigationReport', 'view') || roles.length === 0;
  const canCreate = isSuperAdmin || can('AccidentInvestigationReport', 'add') || roles.length === 0;
  const canEdit = isSuperAdmin || can('AccidentInvestigationReport', 'edit');

  const isMobile = useMediaQuery('(max-width: 62em)');

  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AccidentInvestigationFormValues>({ defaultValues: getDefaultValues() });

  const { fields, append, remove, replace } = useFieldArray({ control, name: 'injuredPersons' });
  const severityValues = watch('severity');
  const watchedSiteId = watch('siteId');

  useEffect(() => {
    if (!permissionsLoading && canView) {
      fetchReports().catch(() => undefined);
    }
  }, [permissionsLoading, canView, fetchReports]);

  useEffect(() => {
    if (!watchedSiteId) return;
    const selectedSite = sites.find((site) => site._id === watchedSiteId);
    if (selectedSite && !watch('projectName')) {
      setValue('projectName', selectedSite.name ?? '', { shouldDirty: false });
    }
  }, [watchedSiteId, sites, setValue, watch]);

  const siteOptions = useMemo(
    () =>
      sites.map((site) => ({
        value: site._id,
        label: site.name,
        description: site.location ?? '',
      })),
    [sites]
  );

  const handleSeveritySelect = (category: SeverityCategoryKey, type: 'potential' | 'actual', level: AccidentSeverityRating) => {
    const current = severityValues?.[category]?.[type] ?? null;
    const path = `severity.${category}.${type}` as SeverityFieldPath;
    setValue(path, current === level ? null : level, { shouldDirty: true });
  };

  const handleResetForm = useCallback(() => {
    const defaults = getDefaultValues();
    reset(defaults);
    replace(defaults.injuredPersons);
    setEditingId(null);
  }, [reset, replace]);

  const handleStartNew = () => {
    if (!canCreate && !isSuperAdmin) {
      showMessage('You do not have permission to create accident investigation reports', 'error');
      return;
    }
    setSelectedRecord(null);
    handleResetForm();
    setFormModalOpen(true);
  };

  const handleEdit = (record: AccidentInvestigationReportRecord) => {
    if (!canEdit && !isSuperAdmin) {
      showMessage('You do not have permission to edit accident investigation reports', 'error');
      return;
    }
    setEditingId(record._id);
    setSelectedRecord(record);
    setFormModalOpen(true);
    reset({
      projectName: record.projectName ?? '',
      reportDate: record.reportDate ? new Date(record.reportDate) : null,
      reportNumber: record.reportNumber ?? '',
      incidentClassification: (record.incidentClassification as 'Accident' | 'Dangerous Occurrence') ?? 'Accident',
      accidentClassifications: Array.isArray(record.accidentClassifications) ? record.accidentClassifications : [],
      levelOfInvestigation: record.levelOfInvestigation ?? '',
      severity: {
        people: { potential: record.severity?.people?.potential ?? null, actual: record.severity?.people?.actual ?? null },
        asset: { potential: record.severity?.asset?.potential ?? null, actual: record.severity?.asset?.actual ?? null },
        environment: {
          potential: record.severity?.environment?.potential ?? null,
          actual: record.severity?.environment?.actual ?? null,
        },
        reputation: { potential: record.severity?.reputation?.potential ?? null, actual: record.severity?.reputation?.actual ?? null },
      },
      injuredPersons: (record.injuredPersons && record.injuredPersons.length ? record.injuredPersons : [createInjuredPerson()]).map((person) => ({
        name: person?.name ?? '',
        employer: person?.employer ?? '',
        trade: person?.trade ?? '',
        idNumber: person?.idNumber ?? '',
        employeeNumber: person?.employeeNumber ?? '',
        nationality: person?.nationality ?? '',
        age: typeof person?.age === 'number' ? person.age : Number.isFinite(Number(person?.age)) ? Number(person?.age) : null,
        gender: person?.gender ?? '',
      })),
      totalInjured: typeof record.totalInjured === 'number' ? record.totalInjured : record.injuredPersons?.length ?? 0,
      attachments: record.attachments ?? '',
      summaryOfIncident: record.summaryOfIncident ?? '',
      incidentDetails: {
        company: record.incidentDetails?.company ?? '',
        activity: record.incidentDetails?.activity ?? '',
        location: record.incidentDetails?.location ?? '',
        dateOfIncident: record.incidentDetails?.dateOfIncident ? new Date(record.incidentDetails.dateOfIncident) : null,
        timeOfIncident: record.incidentDetails?.timeOfIncident ?? '',
        supervisor: record.incidentDetails?.supervisor ?? '',
        engineer: record.incidentDetails?.engineer ?? '',
        equipmentTools: record.incidentDetails?.equipmentTools ?? '',
        chemicalSubstances: record.incidentDetails?.chemicalSubstances ?? '',
        workPermitNumber: record.incidentDetails?.workPermitNumber ?? '',
        ppeUsed: record.incidentDetails?.ppeUsed ?? '',
      },
      immediateActionTaken: record.immediateActionTaken ?? '',
      siteId: record.site?.id ?? undefined,
    });
    replace(
      (record.injuredPersons && record.injuredPersons.length ? record.injuredPersons : [createInjuredPerson()]).map((person) => ({
        name: person?.name ?? '',
        employer: person?.employer ?? '',
        trade: person?.trade ?? '',
        idNumber: person?.idNumber ?? '',
        employeeNumber: person?.employeeNumber ?? '',
        nationality: person?.nationality ?? '',
        age: typeof person?.age === 'number' ? person.age : Number.isFinite(Number(person?.age)) ? Number(person?.age) : null,
        gender: person?.gender ?? '',
      }))
    );
  };

  const handleView = (record: AccidentInvestigationReportRecord) => {
    setSelectedRecord(record);
  };

  const handlePrint = useCallback(
    (record?: AccidentInvestigationReportRecord | null) => {
      const target = record || selectedRecord;
      if (!target) {
        showMessage('Select a report to print', 'info');
        return;
      }
      const html = buildReportHtml(target, true);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    },
    [selectedRecord]
  );

  const onSubmit = async (values: AccidentInvestigationFormValues) => {
    const isEditing = Boolean(editingId);
    if (isEditing && !canEdit && !isSuperAdmin) {
      showMessage('You do not have permission to edit accident investigation reports', 'error');
      return;
    }
    if (!isEditing && !canCreate && !isSuperAdmin) {
      showMessage('You do not have permission to create accident investigation reports', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload: AccidentInvestigationReportPayload = {
        projectName: values.projectName,
        reportDate: values.reportDate ? values.reportDate.toISOString() : undefined,
        reportNumber: values.reportNumber,
        incidentClassification: values.incidentClassification,
        accidentClassifications: values.accidentClassifications,
        levelOfInvestigation: values.levelOfInvestigation,
        severity: {
          people: {
            potential: values.severity.people.potential ?? undefined,
            actual: values.severity.people.actual ?? undefined,
          },
          asset: {
            potential: values.severity.asset.potential ?? undefined,
            actual: values.severity.asset.actual ?? undefined,
          },
          environment: {
            potential: values.severity.environment.potential ?? undefined,
            actual: values.severity.environment.actual ?? undefined,
          },
          reputation: {
            potential: values.severity.reputation.potential ?? undefined,
            actual: values.severity.reputation.actual ?? undefined,
          },
        },
        injuredPersons: values.injuredPersons.map((person) => ({
          name: person.name,
          employer: person.employer || undefined,
          trade: person.trade || undefined,
          idNumber: person.idNumber || undefined,
          employeeNumber: person.employeeNumber || undefined,
          nationality: person.nationality || undefined,
          age: person.age ?? undefined,
          gender: person.gender || undefined,
        })),
        totalInjured: values.totalInjured ?? undefined,
        attachments: values.attachments || undefined,
        summaryOfIncident: values.summaryOfIncident || undefined,
        incidentDetails: {
          company: values.incidentDetails.company || undefined,
          activity: values.incidentDetails.activity || undefined,
          location: values.incidentDetails.location || undefined,
          dateOfIncident: values.incidentDetails.dateOfIncident ? values.incidentDetails.dateOfIncident.toISOString() : undefined,
          timeOfIncident: values.incidentDetails.timeOfIncident || undefined,
          supervisor: values.incidentDetails.supervisor || undefined,
          engineer: values.incidentDetails.engineer || undefined,
          equipmentTools: values.incidentDetails.equipmentTools || undefined,
          chemicalSubstances: values.incidentDetails.chemicalSubstances || undefined,
          workPermitNumber: values.incidentDetails.workPermitNumber || undefined,
          ppeUsed: values.incidentDetails.ppeUsed || undefined,
        },
        immediateActionTaken: values.immediateActionTaken || undefined,
        siteId: values.siteId || undefined,
      };

      if (editingId) {
        await updateReport(editingId, payload);
      } else {
        await createReport(payload);
      }

      await fetchReports();
      setFormModalOpen(false);
      setSelectedRecord(null);
      handleResetForm();
    } catch (error: any) {
      showMessage(error?.message ?? 'Unable to save accident investigation report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const previewHtml = selectedRecord ? buildReportHtml(selectedRecord) : '';

  return (
    <EhsPageLayout
      title="Accident Investigation Report"
      description="Document incidents, severity assessment, and immediate actions for reporting and analysis."
      actions={
        <Group>
          <Button variant="light" color="gray" leftSection={<IconRefresh size={16} />} onClick={() => fetchReports()} loading={loading}>
            Refresh
          </Button>
          {(canCreate || isSuperAdmin) && (
            <Button leftSection={<IconPlus size={16} />} onClick={handleStartNew}>
              New Investigation Report
            </Button>
          )}
        </Group>
      }
    >
      {permissionsLoading ? (
        <Group justify="center" py="xl">
          <Text c="dimmed">Loading permissions...</Text>
        </Group>
      ) : !canView ? (
        <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />} title="Access restricted">
          You do not have permission to view accident investigation reports.
        </Alert>
      ) : (
        <Stack gap="lg">
          <Card withBorder radius="md" padding="lg" shadow="sm">
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <div>
                  <Text size="sm" c="dimmed">
                    Records available: {records.length}
                  </Text>
                  {sitesLoading ? (
                    <Text size="xs" c="dimmed">
                      Loading site directory...
                    </Text>
                  ) : null}
                </div>
              </Group>
              <Divider variant="dashed" />
              <ScrollArea>
                <Table striped highlightOnHover withColumnBorders horizontalSpacing="md" verticalSpacing="xs">
                  <thead>
                    <tr>
                      <th>Report No.</th>
                      <th>Project Name</th>
                      <th>Report Date</th>
                      <th>Classification</th>
                      <th>Level of Investigation</th>
                      <th style={{ width: 120 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length ? (
                      records.map((record) => (
                        <tr key={record._id}>
                          <td>{record.reportNumber || '—'}</td>
                          <td>{record.projectName || '—'}</td>
                          <td>{formatDisplayDate(record.reportDate)}</td>
                          <td>
                            <Badge color={(record.incidentClassification ?? 'Accident').toLowerCase() === 'accident' ? 'red' : 'orange'}>
                              {record.incidentClassification || 'Accident'}
                            </Badge>
                          </td>
                          <td>{record.levelOfInvestigation || '—'}</td>
                          <td>
                            <Group gap="xs">
                              <ActionIcon variant="subtle" color="blue" onClick={() => handleView(record)}>
                                <IconEye size={16} />
                              </ActionIcon>
                              {(canEdit || isSuperAdmin) && (
                                <ActionIcon variant="subtle" color="yellow" onClick={() => handleEdit(record)}>
                                  <IconPencil size={16} />
                                </ActionIcon>
                              )}
                              <ActionIcon variant="subtle" color="gray" onClick={() => handlePrint(record)}>
                                <IconPrinter size={16} />
                              </ActionIcon>
                            </Group>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6}>
                          <Text size="sm" c="dimmed" ta="center">
                            No accident investigation reports recorded yet.
                          </Text>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </ScrollArea>
            </Stack>
          </Card>

          {selectedRecord ? (
            <Card withBorder radius="md" padding="lg" shadow="sm">
              <Group justify="space-between" align="center" mb="md">
                <Text fw={600}>Print Preview</Text>
                <Group gap="sm">
                  <Button variant="light" color="gray" leftSection={<IconPrinter size={16} />} onClick={() => handlePrint(selectedRecord)}>
                    Print
                  </Button>
                  <Button variant="default" onClick={() => setSelectedRecord(null)}>
                    Close Preview
                  </Button>
                </Group>
              </Group>
              <Box style={{ border: '1px solid #d0d0d0', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </Box>
            </Card>
          ) : null}
        </Stack>
      )}

      <Modal
        opened={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          handleResetForm();
        }}
        size={isMobile ? '100%' : '90%'}
        fullScreen={isMobile}
        radius="md"
        title={editingId ? 'Edit Accident Investigation Report' : 'Create Accident Investigation Report'}
        overlayProps={{ blur: 3 }}
        styles={{
          body: { padding: isMobile ? 0 : undefined },
          content: { maxWidth: isMobile ? '100%' : '90vw' },
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea offsetScrollbars h={isMobile ? 'calc(100vh - 140px)' : '70vh'} px={isMobile ? 'md' : 0}>
            <Stack gap="lg" py="xs">
              {editingId ? (
                <Alert color="yellow" variant="light" icon={<IconPencil size={16} />}
                  title="Editing existing record">
                  You are editing an existing report. Saving will update the selected record.
                </Alert>
              ) : null}

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Stack gap="md">
                  <Text fw={600}>Report details</Text>
                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    <TextInput
                      label="Project name"
                      placeholder="Enter project name"
                      {...register('projectName', { required: 'Project name is required' })}
                      error={errors.projectName?.message}
                    />
                    <Controller
                      control={control}
                      name="reportDate"
                      rules={{ required: 'Report date is required' }}
                      render={({ field }) => (
                        <DateInput
                          label="Report date"
                          value={field.value}
                          onChange={field.onChange}
                          valueFormat="DD MMM YYYY"
                          error={errors.reportDate?.message}
                        />
                      )}
                    />
                    <TextInput label="Report number" placeholder="Reference number" {...register('reportNumber')} />
                    <TextInput label="Level of investigation" placeholder="Level" {...register('levelOfInvestigation')} />
                    <Controller
                      control={control}
                      name="siteId"
                      render={({ field }) => (
                        <Select
                          label="Site"
                          placeholder={sitesLoading ? 'Loading sites...' : 'Select site (optional)'}
                          data={siteOptions}
                          value={field.value ?? null}
                          searchable
                          clearable
                          nothingFoundMessage="No site found"
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </SimpleGrid>
                </Stack>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Stack gap="md">
                  <Text fw={600}>Classification</Text>
                  <Controller
                    control={control}
                    name="incidentClassification"
                    render={({ field }) => (
                      <SegmentedControl {...field} data={INCIDENT_CLASSIFICATION_OPTIONS} radius="sm" color="orange" fullWidth />
                    )}
                  />
                  <Controller
                    control={control}
                    name="accidentClassifications"
                    render={({ field }) => (
                      <Checkbox.Group label="Accident classification" value={field.value} onChange={field.onChange}>
                        <Group gap="md">
                          {ACCIDENT_CLASSIFICATION_OPTIONS.map((option) => (
                            <Checkbox key={option.value} value={option.value} label={option.label} />
                          ))}
                        </Group>
                      </Checkbox.Group>
                    )}
                  />
                </Stack>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Stack gap="md">
                  <Text fw={600}>Severity matrix</Text>
                  <ScrollArea>
                    <Table withColumnBorders horizontalSpacing="sm" verticalSpacing="xs">
                      <thead>
                        <tr>
                          <th rowSpan={2}>Rate</th>
                          <th colSpan={2}>People</th>
                          <th colSpan={2}>Asset</th>
                          <th colSpan={2}>Environment</th>
                          <th colSpan={2}>Reputation</th>
                        </tr>
                        <tr>
                          <th>Pot.</th>
                          <th>Act.</th>
                          <th>Pot.</th>
                          <th>Act.</th>
                          <th>Pot.</th>
                          <th>Act.</th>
                          <th>Pot.</th>
                          <th>Act.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {SEVERITY_ROWS.map((row) => (
                          <tr key={row.level}>
                            <td style={{ textAlign: 'center', fontWeight: 600 }}>{row.level}</td>
                            {(['people', 'asset', 'environment', 'reputation'] as const).map((category) => {
                              const potentialSelected = severityValues?.[category]?.potential === row.level;
                              const actualSelected = severityValues?.[category]?.actual === row.level;
                              const baseStyle = { padding: '10px 8px', cursor: 'pointer' };
                              return (
                                <Fragment key={`${category}-${row.level}`}>
                                  <td
                                    style={{
                                      ...baseStyle,
                                      backgroundColor: potentialSelected ? '#fff6cc' : '#ffffff',
                                      borderLeft: '1px solid #d9d9d9',
                                    }}
                                    onClick={() => handleSeveritySelect(category, 'potential', row.level)}
                                  >
                                    <Text size="xs" fw={potentialSelected ? 700 : 400} lh={1.25}>
                                      {row[category]}
                                    </Text>
                                  </td>
                                  <td
                                    style={{
                                      ...baseStyle,
                                      backgroundColor: actualSelected ? '#fff6cc' : '#ffffff',
                                      borderLeft: '1px solid #d9d9d9',
                                      textAlign: 'center',
                                    }}
                                    onClick={() => handleSeveritySelect(category, 'actual', row.level)}
                                  >
                                    {actualSelected ? '✔' : ''}
                                  </td>
                                </Fragment>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </ScrollArea>
                </Stack>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Stack gap="md">
                  <Group justify="space-between" align="center">
                    <Text fw={600}>Injured person(s)</Text>
                    <Button variant="subtle" leftSection={<IconPlus size={14} />} onClick={() => append(createInjuredPerson())}>
                      Add person
                    </Button>
                  </Group>
                  <Stack gap="md">
                    {fields.map((field, index) => (
                      <Card key={field.id} withBorder radius="md" padding="md" shadow="xs">
                        <Group justify="space-between" align="center" mb="sm">
                          <Text fw={600}>Person #{index + 1}</Text>
                          <ActionIcon variant="subtle" color="red" onClick={() => remove(index)} disabled={fields.length === 1}>
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
                          <TextInput label="Name" placeholder="Name" {...register(`injuredPersons.${index}.name` as const)} />
                          <TextInput label="Employer" placeholder="Employer" {...register(`injuredPersons.${index}.employer` as const)} />
                          <TextInput label="Trade" placeholder="Trade" {...register(`injuredPersons.${index}.trade` as const)} />
                          <TextInput label="ID number" placeholder="ID number" {...register(`injuredPersons.${index}.idNumber` as const)} />
                          <TextInput label="Employee number" placeholder="Employee number" {...register(`injuredPersons.${index}.employeeNumber` as const)} />
                          <TextInput label="Nationality" placeholder="Nationality" {...register(`injuredPersons.${index}.nationality` as const)} />
                          <Controller
                            control={control}
                            name={`injuredPersons.${index}.age` as const}
                            render={({ field }) => (
                              <NumberInput {...field} label="Age" min={0} max={120} hideControls allowNegative={false} />
                            )}
                          />
                          <Controller
                            control={control}
                            name={`injuredPersons.${index}.gender` as const}
                            render={({ field }) => (
                              <Select data={GENDER_OPTIONS} label="Gender" placeholder="Select" value={field.value || null} onChange={field.onChange} clearable />
                            )}
                          />
                        </SimpleGrid>
                      </Card>
                    ))}
                  </Stack>
                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    <Controller
                      control={control}
                      name="totalInjured"
                      render={({ field }) => (
                        <NumberInput
                          label="Total injured"
                          value={field.value ?? 0}
                          min={0}
                          allowNegative={false}
                          onChange={(val) => field.onChange(Number(val) || 0)}
                        />
                      )}
                    />
                    <TextInput label="Attachments" placeholder="Attachment references" {...register('attachments')} />
                  </SimpleGrid>
                </Stack>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Stack gap="md">
                  <Text fw={600}>Details of incident</Text>
                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    <TextInput label="Company" placeholder="Company" {...register('incidentDetails.company')} />
                    <TextInput label="Activity" placeholder="Activity" {...register('incidentDetails.activity')} />
                    <TextInput label="Location" placeholder="Location" {...register('incidentDetails.location')} />
                    <Controller
                      control={control}
                      name="incidentDetails.dateOfIncident"
                      render={({ field }) => (
                        <DateInput label="Date of incident" value={field.value} onChange={field.onChange} valueFormat="DD MMM YYYY" />
                      )}
                    />
                    <TextInput label="Time of incident" placeholder="HH:MM" {...register('incidentDetails.timeOfIncident')} />
                    <TextInput label="Supervisor" placeholder="Supervisor" {...register('incidentDetails.supervisor')} />
                    <TextInput label="Engineer" placeholder="Engineer" {...register('incidentDetails.engineer')} />
                    <TextInput label="Equipment / Tools" placeholder="Equipment used" {...register('incidentDetails.equipmentTools')} />
                    <TextInput label="Chemical / Substances" placeholder="Chemicals" {...register('incidentDetails.chemicalSubstances')} />
                    <TextInput label="Work permit number" placeholder="Work permit" {...register('incidentDetails.workPermitNumber')} />
                    <TextInput label="PPEs used" placeholder="PPEs" {...register('incidentDetails.ppeUsed')} />
                  </SimpleGrid>
                </Stack>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Stack gap="md">
                  <Textarea
                    label="Summary of incident"
                    placeholder="Describe what happened"
                    minRows={3}
                    autosize
                    {...register('summaryOfIncident')}
                  />
                  <Textarea
                    label="Immediate action taken"
                    placeholder="List immediate actions"
                    minRows={3}
                    autosize
                    {...register('immediateActionTaken')}
                  />
                </Stack>
              </Card>

              <Group justify="flex-end" mt="sm" pb={isMobile ? 'md' : 0}>
                <Button
                  variant="default"
                  onClick={() => {
                    setFormModalOpen(false);
                    handleResetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={submitting}>
                  {editingId ? 'Update report' : 'Save report'}
                </Button>
              </Group>
            </Stack>
          </ScrollArea>
        </form>
      </Modal>
    </EhsPageLayout>
  );
};

export default AccidentInvestigationReportPage;

