import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Group,
  Loader,
  Modal,
  Radio,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconAlertCircle, IconEye, IconPencil, IconPlus, IconPrinter, IconRefresh } from '@tabler/icons-react';
import dayjs from 'dayjs';
import EhsPageLayout from '@/components/ehs/EhsPageLayout';
import { usePermissions } from '@/hooks/usePermissions';
import { useSites } from '@/hooks/useSites';
import { useWorkPermits } from '@/hooks/useWorkPermits';
import { WorkPermitPayload } from '@/apis/ehs';
import logo from '@/assets/ehs/Logo.jpeg';
import { showMessage } from '@/utils/Constant';

const PERMIT_TYPES = [
  { value: 'general', label: 'General Permit' },
  { value: 'hotWork', label: 'Hot Work Permit' },
  { value: 'heightWork', label: 'Height Work' },
  { value: 'excavation', label: 'Excavation' },
  { value: 'confinedSpace', label: 'Confined Space' },
  { value: 'electrical', label: 'Electrical' },
];

const PERMIT_RECEIVER_OPTIONS = [
  { value: 'employee', label: 'Employee/Maint.' },
  { value: 'contractor', label: 'Contractor/Outside Agency' },
];

const NATURE_OF_WORK_OPTIONS = [
  { value: 'civil', label: 'CIVIL' },
  { value: 'mech', label: 'MECH' },
  { value: 'elect', label: 'ELECT' },
  { value: 'plumbing', label: 'PLUMBING' },
  { value: 'others', label: 'OTHERS' },
];

const HAZARD_OPTIONS = [
  { value: 'fire', label: 'Fire' },
  { value: 'fallFromHeight', label: 'Fall from Height' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'pressure', label: 'Pressure' },
  { value: 'hotSurface', label: 'Hot Surface' },
  { value: 'dust', label: 'Dust' },
  { value: 'noise', label: 'Noise' },
  { value: 'toolInjury', label: 'Tool Injury' },
  { value: 'mechanical', label: 'Mechanical' },
  { value: 'slippage', label: 'Slippage' },
  { value: 'others', label: 'Others' },
];

const PREPARATION_CHECKS = [
  { value: 'fireExtinguisher', label: 'Fire Extinguisher Available' },
  { value: 'hydrantLine', label: 'Hydrant Line Available' },
  { value: 'fireBlanket', label: 'Fire Blanket Available' },
  { value: 'ventilation', label: 'Adequate Ventilation' },
  { value: 'barricades', label: 'Barricades required' },
  { value: 'signs', label: 'Signs required' },
  { value: 'explosiveAtmosphere', label: 'Check area for explosive atmosphere' },
  { value: 'isolationPower', label: 'Isolation of elect. Power' },
  { value: 'heightCompliance', label: 'Work at height compliance' },
  { value: 'lighting', label: 'Adequate Lighting available' },
  { value: 'firstAid', label: 'First Aid box available' },
  { value: 'ppeCompliance', label: 'PPE Compliance' },
  { value: 'postFireWatch', label: 'Post job work fire watch' },
];

const PPE_OPTIONS = [
  { value: 'safetyShoes', label: 'Safety Shoes' },
  { value: 'safetyGoggles', label: 'Safety Goggles' },
  { value: 'gloves', label: 'Gloves' },
  { value: 'safetyBelt', label: 'Safety Belt' },
  { value: 'earPlug', label: 'Ear Plug/Muff' },
  { value: 'helmet', label: 'Helmet' },
  { value: 'dustMask', label: 'Dust Mask' },
  { value: 'cartridgeMask', label: 'Cartridge Gas Mask' },
  { value: 'others', label: 'Others' },
];

const CLOSURE_STATUS = [
  { value: 'continued', label: 'Permit is closed - Job to be continued' },
  { value: 'completed', label: 'Permit is closed - Job is completed' },
];

type WorkPermitFormValues = {
  siteId?: string;
  permitDate: Date | null;
  permitTypes: string[];
  permitReceiverType: string;
  siteName: string;
  exactLocation: string;
  natureOfWork: string[];
  jobDescription: string;
  toolsEquipment: string;
  validityFrom: string;
  validityTo: string;
  validityDate: Date | null;
  validityShift: string;
  responsiblePerson: string;
  serviceAgency: string;
  emergencyContact: string;
  personsDeployed: string;
  hazardConsiderations: string[];
  hazardOther: string;
  preparationChecks: string[];
  preparationExtra: string;
  ppeRequired: string[];
  ppeOthers: string;
  specificCaution: string;
  projectInChargeName: string;
  projectInChargeSign: string;
  ehsPersonName: string;
  ehsPersonSign: string;
  permitIssuedByName: string;
  permitIssuedBySign: string;
  permitReceivedByName: string;
  permitReceivedBySign: string;
  certificationName: string;
  certificationSign: string;
  closureStatus: string;
  closureReceiverName: string;
  closureReceiverSign: string;
  closureReceiverDateTime: string;
  closureIssuerName: string;
  closureIssuerSign: string;
  closureIssuerDateTime: string;
  finalInspectorName: string;
  finalInspectorSign: string;
  finalInspectorDateTime: string;
  notes: string;
};

const DEFAULT_VALUES: WorkPermitFormValues = {
  siteId: undefined,
  permitDate: new Date(),
  permitTypes: [],
  permitReceiverType: 'employee',
  siteName: '',
  exactLocation: '',
  natureOfWork: [],
  jobDescription: '',
  toolsEquipment: '',
  validityFrom: '',
  validityTo: '',
  validityDate: new Date(),
  validityShift: '',
  responsiblePerson: '',
  serviceAgency: '',
  emergencyContact: '',
  personsDeployed: '',
  hazardConsiderations: [],
  hazardOther: '',
  preparationChecks: [],
  preparationExtra: '',
  ppeRequired: [],
  ppeOthers: '',
  specificCaution: '',
  projectInChargeName: '',
  projectInChargeSign: '',
  ehsPersonName: '',
  ehsPersonSign: '',
  permitIssuedByName: '',
  permitIssuedBySign: '',
  permitReceivedByName: '',
  permitReceivedBySign: '',
  certificationName: '',
  certificationSign: '',
  closureStatus: 'completed',
  closureReceiverName: '',
  closureReceiverSign: '',
  closureReceiverDateTime: '',
  closureIssuerName: '',
  closureIssuerSign: '',
  closureIssuerDateTime: '',
  finalInspectorName: '',
  finalInspectorSign: '',
  finalInspectorDateTime: '',
  notes: '',
};

const labelMap = (items: { value: string; label: string }[]) =>
  items.reduce<Record<string, string>>((acc, item) => {
    acc[item.value] = item.label;
    return acc;
  }, {});

const PERMIT_TYPE_LABELS = labelMap(PERMIT_TYPES);
const NATURE_OF_WORK_LABELS = labelMap(NATURE_OF_WORK_OPTIONS);
const HAZARD_LABELS = labelMap(HAZARD_OPTIONS);
const PREPARATION_LABELS = labelMap(PREPARATION_CHECKS);
const PPE_LABELS = labelMap(PPE_OPTIONS);

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dayjs(date).format('DD/MM/YYYY');
};

const mark = (condition: boolean) => (condition ? '☑' : '☐');

const buildPrintHtml = (record: any) => {
  const permitTypes: string[] = record?.permitTypes ?? [];
  const natureOfWork: string[] = record?.natureOfWork ?? [];
  const hazards: string[] = record?.hazardConsiderations ?? [];
  const preparations: string[] = record?.preparationChecks ?? [];
  const ppe: string[] = record?.ppeRequired ?? [];

  const permitTypeRow = 
    `<tr>
      <td style="border:1px solid #000;padding:6px;width:120px;">Type of Permit</td>
      <td style="border:1px solid #000;padding:6px;">${mark(permitTypes.includes('general'))} General Permit</td>
      <td style="border:1px solid #000;padding:6px;">${mark(permitTypes.includes('hotWork'))} Hot Work Permit</td>
      <td style="border:1px solid #000;padding:6px;">${mark(permitTypes.includes('heightWork'))} Height Work</td>
    </tr>
    <tr>
      <td style="border:1px solid #000;padding:6px;">&nbsp;</td>
      <td style="border:1px solid #000;padding:6px;">${mark(permitTypes.includes('excavation'))} Excavation</td>
      <td style="border:1px solid #000;padding:6px;">${mark(permitTypes.includes('confinedSpace'))} Confined Space</td>
      <td style="border:1px solid #000;padding:6px;">${mark(permitTypes.includes('electrical'))} Electrical</td>
    </tr>`;

  const natureRow = `
    <tr>
      <td style="border:1px solid #000;padding:6px;">Nature of Work</td>
      ${NATURE_OF_WORK_OPTIONS.map(
        (option) =>
          `<td style="border:1px solid #000;padding:6px;text-align:center;">${mark(natureOfWork.includes(option.value))} ${option.label}</td>`
      ).join('')}
    </tr>`;

  const hazardsRow = `
    <tr>
      <td style="border:1px solid #000;padding:6px;" colspan="11">Hazard Considerations</td>
    </tr>
    <tr>
      ${HAZARD_OPTIONS.slice(0, 6)
        .map(
          (option) =>
            `<td style="border:1px solid #000;padding:6px;">${mark(hazards.includes(option.value))} ${option.label}</td>`
        )
        .join('')}
    </tr>
    <tr>
      ${HAZARD_OPTIONS.slice(6)
        .map(
          (option) =>
            `<td style="border:1px solid #000;padding:6px;">${mark(hazards.includes(option.value))} ${option.label}</td>`
        )
        .join('')}
    </tr>
    ${record?.hazardOther ? `<tr><td style="border:1px solid #000;padding:6px;" colspan="11">Others: ${record.hazardOther}</td></tr>` : ''}`;

  const preparationRows = `
    <tr>
      <td style="border:1px solid #000;padding:6px;" colspan="4">Preparation of Job & Standard Precautions to be taken</td>
    </tr>
    <tr>
      ${PREPARATION_CHECKS.slice(0, 4)
        .map(
          (option) =>
            `<td style="border:1px solid #000;padding:6px;">${mark(preparations.includes(option.value))} ${option.label}</td>`
        )
        .join('')}
    </tr>
    <tr>
      ${PREPARATION_CHECKS.slice(4, 8)
        .map(
          (option) =>
            `<td style="border:1px solid #000;padding:6px;">${mark(preparations.includes(option.value))} ${option.label}</td>`
        )
        .join('')}
    </tr>
    <tr>
      ${PREPARATION_CHECKS.slice(8, 12)
        .map(
          (option) =>
            `<td style="border:1px solid #000;padding:6px;">${mark(preparations.includes(option.value))} ${option.label}</td>`
        )
        .join('')}
    </tr>
    <tr>
      <td style="border:1px solid #000;padding:6px;">${mark(preparations.includes('postFireWatch'))} Post job work fire watch</td>
      <td style="border:1px solid #000;padding:6px;" colspan="3">Any extra precautions: ${record?.preparationExtra ?? ''}</td>
    </tr>`;

  const ppeRows = `
    <tr>
      <td style="border:1px solid #000;padding:6px;" colspan="4">PPE's Required for the job (Strict compliance is to be ensured)</td>
    </tr>
    <tr>
      ${PPE_OPTIONS.slice(0, 4)
        .map((option) => `<td style="border:1px solid #000;padding:6px;">${mark(ppe.includes(option.value))} ${option.label}</td>`)
        .join('')}
    </tr>
    <tr>
      ${PPE_OPTIONS.slice(4, 8)
        .map((option) => `<td style="border:1px solid #000;padding:6px;">${mark(ppe.includes(option.value))} ${option.label}</td>`)
        .join('')}
    </tr>
    <tr>
      <td style="border:1px solid #000;padding:6px;">${mark(ppe.includes('others'))} Others</td>
      <td style="border:1px solid #000;padding:6px;" colspan="3">${record?.ppeOthers ?? ''}</td>
    </tr>`;

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Work Permit</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #fff; color: #000; }
          table { border-collapse: collapse; width: 100%; font-size: 12px; }
          th, td { border: 1px solid #000; padding: 6px; }
          .sheet { border: 2px solid #000; padding: 16px; }
          .header { display: grid; grid-template-columns: 2fr 3fr 1.2fr; gap: 12px; align-items: stretch; margin-bottom: 16px; }
          .logo { border:1px solid #000; display:flex; align-items:center; justify-content:center; padding:12px; background:#fff; }
          .title { border:1px solid #000; background:#f3f3f3; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:700; }
          .meta { border:1px solid #000; background:#f3f3f3; padding:12px; font-size:12px; line-height:1.4; }
          .section { margin-bottom: 12px; }
          .sign-row td { height: 40px; }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="header">
            <div class="logo"><img src="${logo}" alt="Shivalik" style="max-width:150px;max-height:60px;object-fit:contain;" /></div>
            <div class="title">Work Permit</div>
            <div class="meta">
              <div>Format No.: EHS-F-23</div>
              <div>Rev. 00</div>
            </div>
          </div>

          <div class="section">
            <table>
              ${permitTypeRow}
              <tr>
                <td style="border:1px solid #000;padding:6px;">Permit Receiver</td>
                <td style="border:1px solid #000;padding:6px;">${mark(record?.permitReceiverType === 'employee')} Employee/Maint.</td>
                <td style="border:1px solid #000;padding:6px;">${mark(record?.permitReceiverType === 'contractor')} Contractor/Outside Agency</td>
                <td style="border:1px solid #000;padding:6px;">&nbsp;</td>
              </tr>
              <tr>
                <td style="border:1px solid #000;padding:6px;">Site</td>
                <td style="border:1px solid #000;padding:6px;" colspan="3">${record?.siteSnapshot?.name ?? record?.siteName ?? ''}</td>
              </tr>
              <tr>
                <td style="border:1px solid #000;padding:6px;">Exact Location of Job</td>
                <td style="border:1px solid #000;padding:6px;" colspan="3">${record?.exactLocation ?? ''}</td>
              </tr>
              ${natureRow}
              <tr>
                <td style="border:1px solid #000;padding:6px;">Job Work Description</td>
                <td style="border:1px solid #000;padding:6px;" colspan="4">${record?.jobDescription ?? ''}</td>
              </tr>
              <tr>
                <td style="border:1px solid #000;padding:6px;">Tools & Equipment to be used</td>
                <td style="border:1px solid #000;padding:6px;" colspan="4">${record?.toolsEquipment ?? ''}</td>
              </tr>
              <tr>
                <td style="border:1px solid #000;padding:6px;">Permit Validity</td>
                <td style="border:1px solid #000;padding:6px;" colspan="4">From ${record?.validityFrom ?? ''} Hrs. To ${record?.validityTo ?? ''} Hrs. on date ${formatDate(record?.validityDate)} Shift ${record?.validityShift ?? ''}</td>
              </tr>
              <tr>
                <td style="border:1px solid #000;padding:6px;">Name of Person(s) responsible for job execution</td>
                <td style="border:1px solid #000;padding:6px;" colspan="4">${record?.responsiblePerson ?? ''}</td>
              </tr>
              <tr>
                <td style="border:1px solid #000;padding:6px;">Name of Service Agency</td>
                <td style="border:1px solid #000;padding:6px;" colspan="4">${record?.serviceAgency ?? ''}</td>
              </tr>
              <tr>
                <td style="border:1px solid #000;padding:6px;">Emergency Contact No.</td>
                <td style="border:1px solid #000;padding:6px;" colspan="2">${record?.emergencyContact ?? ''}</td>
                <td style="border:1px solid #000;padding:6px;">No. of Persons Deployed</td>
                <td style="border:1px solid #000;padding:6px;">${record?.personsDeployed ?? ''}</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <table>
              ${hazardsRow}
            </table>
          </div>

          <div class="section">
            <table>
              ${preparationRows}
            </table>
          </div>

          <div class="section">
            <table>
              ${ppeRows}
            </table>
          </div>

          <div class="section">
            <table>
              <tr>
                <td style="border:1px solid #000;padding:6px;">Specific Caution About Hazard & Extra Precaution to be taken</td>
              </tr>
              <tr>
                <td style="border:1px solid #000;padding:12px; min-height:80px;">${record?.specificCaution ?? ''}</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <table>
              <tr class="sign-row">
                <td style="border:1px solid #000;padding:6px;">Project In Charge<br/>Name: ${record?.projectInChargeName ?? ''}</td>
                <td style="border:1px solid #000;padding:6px;">Sign: ${record?.projectInChargeSign ?? ''}</td>
                <td style="border:1px solid #000;padding:6px;">EHS Person<br/>Name: ${record?.ehsPersonName ?? ''}</td>
                <td style="border:1px solid #000;padding:6px;">Sign: ${record?.ehsPersonSign ?? ''}</td>
              </tr>
              <tr class="sign-row">
                <td style="border:1px solid #000;padding:6px;">Permit Issued By<br/>Name: ${record?.permitIssuedByName ?? ''}</td>
                <td style="border:1px solid #000;padding:6px;">Sign: ${record?.permitIssuedBySign ?? ''}</td>
                <td style="border:1px solid #000;padding:6px;">Permit Received By<br/>Name: ${record?.permitReceivedByName ?? ''}</td>
                <td style="border:1px solid #000;padding:6px;">Sign: ${record?.permitReceivedBySign ?? ''}</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <table>
              <tr>
                <td style="border:1px solid #000;padding:12px;">
                  I certify that, work area has been inspected, job preparation, precautions & conditions are satisfactory and safe for job to proceed, all the compliance has been ensured and people who are going to carry out job have been explained the hazards involved and precautions to be taken.<br/><br/>
                  EHS Head / Safety Officer Name: ${record?.certificationName ?? ''} &nbsp;&nbsp; Sign: ${record?.certificationSign ?? ''}
                </td>
              </tr>
            </table>
          </div>

          <div class="section">
            <table>
              <tr>
                <td style="border:1px solid #000;padding:6px;" colspan="4">Closer of Work Permit: On completion of the job work, Sign and return the permit to the EHS Dept.</td>
              </tr>
              <tr>
                <td style="border:1px solid #000;padding:6px;" colspan="4">${mark(record?.closureStatus === 'continued')} Permit is closed - Job to be continued &nbsp;&nbsp; ${mark(record?.closureStatus === 'completed')} Permit is closed - Job is completed</td>
              </tr>
              <tr>
                <td style="border:1px solid #000;padding:6px;">Permit Receiver Name</td>
                <td style="border:1px solid #000;padding:6px;">${record?.closureReceiverName ?? ''}</td>
                <td style="border:1px solid #000;padding:6px;">Sign: ${record?.closureReceiverSign ?? ''}</td>
                <td style="border:1px solid #000;padding:6px;">Date/Time: ${record?.closureReceiverDateTime ?? ''}</td>
              </tr>
              <tr>
                <td style="border:1px solid #000;padding:6px;">Permit Issuer Name</td>
                <td style="border:1px solid #000;padding:6px;">${record?.closureIssuerName ?? ''}</td>
                <td style="border:1px solid #000;padding:6px;">Sign: ${record?.closureIssuerSign ?? ''}</td>
                <td style="border:1px solid #000;padding:6px;">Date/Time: ${record?.closureIssuerDateTime ?? ''}</td>
              </tr>
              <tr>
                <td style="border:1px solid #000;padding:12px;" colspan="4">
                  The work site has been inspected by me after completion of job / expiry of work permit and declared safe for normal operation to resume.<br/><br/>
                  EHS Head / Safety Officer Name: ${record?.finalInspectorName ?? ''} &nbsp;&nbsp; Sign: ${record?.finalInspectorSign ?? ''} &nbsp;&nbsp; Date/Time: ${record?.finalInspectorDateTime ?? ''}
                </td>
              </tr>
            </table>
          </div>

          <div style="text-align:center;font-size:11px;margin-top:8px;">
            THIS JOB WORK PERMIT SHOULD BE ALWAYS CARRIED BY THE PERMIT RECEIVER ON THE WORKSITE
          </div>
        </div>
      </body>
    </html>
  `;

  return html;
};

const WorkPermitPage = () => {
  const { can, loading: permissionsLoading, roles } = usePermissions();
  const { sites, loading: sitesLoading } = useSites();
  const { records, loading, fetchPermits, createPermit, updatePermit } = useWorkPermits({ limit: 50 });

  const [formOpened, setFormOpened] = useState(false);
  const [viewOpened, setViewOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = roles.includes('SuperAdmin');
  const canView = isSuperAdmin || can('WorkPermit', 'view') || roles.length === 0;
  const canCreate = isSuperAdmin || can('WorkPermit', 'add') || roles.length === 0;
  const canEdit = isSuperAdmin || can('WorkPermit', 'edit');

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WorkPermitFormValues>({ defaultValues: DEFAULT_VALUES });

  const watchedSiteId = watch('siteId');

  useEffect(() => {
    if (!permissionsLoading && canView) {
      fetchPermits().catch(() => undefined);
    }
  }, [permissionsLoading, canView, fetchPermits]);

  useEffect(() => {
    if (!watchedSiteId) return;
    const site = sites.find((item) => item._id === watchedSiteId);
    if (site && !watch('siteName')) {
      setValue('siteName', site.name ?? '', { shouldDirty: false });
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

  const formatList = (values: string[] | undefined, map: Record<string, string>) =>
    values && values.length ? values.map((value) => map[value] ?? value).join(', ') : '—';

  const openCreateModal = () => {
    if (!canCreate) {
      showMessage('You do not have permission to issue work permits', 'error');
      return;
    }
    reset(DEFAULT_VALUES);
    setEditingId(null);
    setFormOpened(true);
  };

  const handleEdit = (record: any) => {
    if (!canEdit) {
      showMessage('You do not have permission to edit work permits', 'error');
      return;
    }
    setEditingId(record._id);
    reset({
      siteId: record.siteSnapshot?.id ?? undefined,
      permitDate: record.permitDate ? new Date(record.permitDate) : new Date(),
      permitTypes: record.permitTypes ?? [],
      permitReceiverType: record.permitReceiverType ?? 'employee',
      siteName: record.siteName ?? record.siteSnapshot?.name ?? '',
      exactLocation: record.exactLocation ?? '',
      natureOfWork: record.natureOfWork ?? [],
      jobDescription: record.jobDescription ?? '',
      toolsEquipment: record.toolsEquipment ?? '',
      validityFrom: record.validityFrom ?? '',
      validityTo: record.validityTo ?? '',
      validityDate: record.validityDate ? new Date(record.validityDate) : new Date(),
      validityShift: record.validityShift ?? '',
      responsiblePerson: record.responsiblePerson ?? '',
      serviceAgency: record.serviceAgency ?? '',
      emergencyContact: record.emergencyContact ?? '',
      personsDeployed: record.personsDeployed ?? '',
      hazardConsiderations: record.hazardConsiderations ?? [],
      hazardOther: record.hazardOther ?? '',
      preparationChecks: record.preparationChecks ?? [],
      preparationExtra: record.preparationExtra ?? '',
      ppeRequired: record.ppeRequired ?? [],
      ppeOthers: record.ppeOthers ?? '',
      specificCaution: record.specificCaution ?? '',
      projectInChargeName: record.projectInChargeName ?? '',
      projectInChargeSign: record.projectInChargeSign ?? '',
      ehsPersonName: record.ehsPersonName ?? '',
      ehsPersonSign: record.ehsPersonSign ?? '',
      permitIssuedByName: record.permitIssuedByName ?? '',
      permitIssuedBySign: record.permitIssuedBySign ?? '',
      permitReceivedByName: record.permitReceivedByName ?? '',
      permitReceivedBySign: record.permitReceivedBySign ?? '',
      certificationName: record.certificationName ?? '',
      certificationSign: record.certificationSign ?? '',
      closureStatus: record.closureStatus ?? 'completed',
      closureReceiverName: record.closureReceiverName ?? '',
      closureReceiverSign: record.closureReceiverSign ?? '',
      closureReceiverDateTime: record.closureReceiverDateTime ?? '',
      closureIssuerName: record.closureIssuerName ?? '',
      closureIssuerSign: record.closureIssuerSign ?? '',
      closureIssuerDateTime: record.closureIssuerDateTime ?? '',
      finalInspectorName: record.finalInspectorName ?? '',
      finalInspectorSign: record.finalInspectorSign ?? '',
      finalInspectorDateTime: record.finalInspectorDateTime ?? '',
      notes: record.notes ?? '',
    });
    setFormOpened(true);
  };

  const handleView = (record: any) => {
    setSelectedRecord(record);
    setViewOpened(true);
  };

  const handlePrint = useCallback((record?: any) => {
    const target = record || selectedRecord;
    if (!target) {
      showMessage('Select a permit to print', 'info');
      return;
    }
    const html = buildPrintHtml(target);
    const win = window.open('', '_blank');
    if (win) {
      win.document.open();
      win.document.write(html);
      win.document.close();
      win.focus();
      win.print();
      win.close();
    }
  }, [selectedRecord]);

  const onSubmit = async (values: WorkPermitFormValues) => {
    const payload: WorkPermitPayload = {
      siteId: values.siteId || undefined,
      permitDate: values.permitDate ? values.permitDate.toISOString() : undefined,
      permitTypes: values.permitTypes ?? [],
      permitReceiverType: values.permitReceiverType || undefined,
      siteName: values.siteName || undefined,
      exactLocation: values.exactLocation || undefined,
      natureOfWork: values.natureOfWork ?? [],
      jobDescription: values.jobDescription || undefined,
      toolsEquipment: values.toolsEquipment || undefined,
      validityFrom: values.validityFrom || undefined,
      validityTo: values.validityTo || undefined,
      validityDate: values.validityDate ? values.validityDate.toISOString() : undefined,
      validityShift: values.validityShift || undefined,
      responsiblePerson: values.responsiblePerson || undefined,
      serviceAgency: values.serviceAgency || undefined,
      emergencyContact: values.emergencyContact || undefined,
      personsDeployed: values.personsDeployed || undefined,
      hazardConsiderations: values.hazardConsiderations ?? [],
      hazardOther: values.hazardOther || undefined,
      preparationChecks: values.preparationChecks ?? [],
      preparationExtra: values.preparationExtra || undefined,
      ppeRequired: values.ppeRequired ?? [],
      ppeOthers: values.ppeOthers || undefined,
      specificCaution: values.specificCaution || undefined,
      projectInChargeName: values.projectInChargeName || undefined,
      projectInChargeSign: values.projectInChargeSign || undefined,
      ehsPersonName: values.ehsPersonName || undefined,
      ehsPersonSign: values.ehsPersonSign || undefined,
      permitIssuedByName: values.permitIssuedByName || undefined,
      permitIssuedBySign: values.permitIssuedBySign || undefined,
      permitReceivedByName: values.permitReceivedByName || undefined,
      permitReceivedBySign: values.permitReceivedBySign || undefined,
      certificationName: values.certificationName || undefined,
      certificationSign: values.certificationSign || undefined,
      closureStatus: values.closureStatus || undefined,
      closureReceiverName: values.closureReceiverName || undefined,
      closureReceiverSign: values.closureReceiverSign || undefined,
      closureReceiverDateTime: values.closureReceiverDateTime || undefined,
      closureIssuerName: values.closureIssuerName || undefined,
      closureIssuerSign: values.closureIssuerSign || undefined,
      closureIssuerDateTime: values.closureIssuerDateTime || undefined,
      finalInspectorName: values.finalInspectorName || undefined,
      finalInspectorSign: values.finalInspectorSign || undefined,
      finalInspectorDateTime: values.finalInspectorDateTime || undefined,
      notes: values.notes || undefined,
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await updatePermit(editingId, payload);
      } else {
        await createPermit(payload);
      }
      await fetchPermits();
      setFormOpened(false);
      setEditingId(null);
      reset(DEFAULT_VALUES);
    } catch (error: any) {
      showMessage(error?.message ?? 'Unable to save work permit', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EhsPageLayout
      title="Work Permit"
      description="Issue, monitor, and close high-risk work permits with standardized precautions and approvals."
      actions={
        <Group>
          <Button
            variant="light"
            color="gray"
            leftSection={<IconRefresh size={16} />}
            onClick={() => fetchPermits()}
            loading={loading}
          >
            Refresh
          </Button>
          {canCreate ? (
            <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
              Issue Work Permit
            </Button>
          ) : null}
        </Group>
      }
    >
      {permissionsLoading ? (
        <Group justify="center" py="xl">
          <Loader size="sm" />
        </Group>
      ) : !canView ? (
        <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />} title="Access restricted">
          You do not have permission to view work permits.
        </Alert>
      ) : (
        <Stack gap="lg">
          <Card withBorder radius="md" padding="lg" shadow="sm">
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <Text size="sm" c="dimmed">
                  Permits recorded: {records.length}
                </Text>
              </Group>
              <ScrollArea>
                <Table highlightOnHover striped withColumnBorders>
                  <thead>
                    <tr>
                      <th>Permit Date</th>
                      <th>Site</th>
                      <th>Permit Types</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length ? (
                      records.map((record) => (
                        <tr key={record._id}>
                          <td>{formatDate(record.permitDate)}</td>
                          <td>{record.siteSnapshot?.name || record.siteName || '—'}</td>
                          <td>{formatList(record.permitTypes, PERMIT_TYPE_LABELS)}</td>
                          <td>
                            <Badge
                              color={record.closureStatus === 'completed' ? 'green' : record.closureStatus === 'continued' ? 'yellow' : 'gray'}
                              variant="light"
                            >
                              {record.closureStatus ? record.closureStatus.replace(/\b\w/g, (letter: string) => letter.toUpperCase()) : 'Pending'}
                            </Badge>
                          </td>
                          <td>
                            <Group gap="xs">
                              <ActionIcon variant="subtle" color="blue" onClick={() => handleView(record)}>
                                <IconEye size={16} />
                              </ActionIcon>
                              {canEdit ? (
                                <ActionIcon variant="subtle" color="orange" onClick={() => handleEdit(record)}>
                                  <IconPencil size={16} />
                                </ActionIcon>
                              ) : null}
                              <ActionIcon variant="subtle" color="gray" onClick={() => handlePrint(record)}>
                                <IconPrinter size={16} />
                              </ActionIcon>
                            </Group>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5}>
                          <Text size="sm" c="dimmed" ta="center">
                            No work permits issued yet.
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
                <Text fw={600}>Permit Preview</Text>
                <Group gap="sm">
                  <Button variant="light" color="gray" leftSection={<IconPrinter size={16} />} onClick={() => handlePrint(selectedRecord)}>
                    Print
                  </Button>
                  <Button variant="default" onClick={() => setSelectedRecord(null)}>
                    Close
                  </Button>
                </Group>
              </Group>
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Text size="sm" c="dimmed">
                    Permit Date
                  </Text>
                  <Text fw={600}>{formatDate(selectedRecord.permitDate)}</Text>
                </Card>
                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Text size="sm" c="dimmed">
                    Permit Types
                  </Text>
                  <Text fw={600}>{formatList(selectedRecord.permitTypes, PERMIT_TYPE_LABELS)}</Text>
                </Card>
                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Text size="sm" c="dimmed">
                    Site
                  </Text>
                  <Text fw={600}>{selectedRecord.siteSnapshot?.name || selectedRecord.siteName || '—'}</Text>
                </Card>
                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Text size="sm" c="dimmed">
                    Responsible Person
                  </Text>
                  <Text fw={600}>{selectedRecord.responsiblePerson || '—'}</Text>
                </Card>
              </SimpleGrid>
              <Table withColumnBorders striped mt="md">
                <thead>
                  <tr>
                    <th>Nature of Work</th>
                    <th>Hazards</th>
                    <th>PPE Required</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{formatList(selectedRecord.natureOfWork, NATURE_OF_WORK_LABELS)}</td>
                    <td>{formatList(selectedRecord.hazardConsiderations, HAZARD_LABELS)}</td>
                    <td>{formatList(selectedRecord.ppeRequired, PPE_LABELS)}</td>
                  </tr>
                </tbody>
              </Table>
              <Card withBorder radius="md" padding="md" shadow="xs" mt="md">
                <Text size="sm" c="dimmed">
                  Specific Caution
                </Text>
                <Text>{selectedRecord.specificCaution || '—'}</Text>
              </Card>
            </Card>
          ) : null}
        </Stack>
      )}

      <Modal
        opened={formOpened}
        onClose={() => {
          setFormOpened(false);
          setEditingId(null);
        }}
        size="95%"
        radius="md"
        title={editingId ? 'Edit Work Permit' : 'Issue Work Permit'}
        overlayProps={{ blur: 3 }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea offsetScrollbars h="70vh">
            <Stack gap="lg" py="xs">
              <Card withBorder radius="md" padding="lg" shadow="xs">
                <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing="md">
                  <Controller
                    control={control}
                    name="permitDate"
                    rules={{ required: 'Permit date required' }}
                    render={({ field }) => (
                      <DateInput
                        label="Permit Date"
                        value={field.value}
                        onChange={field.onChange}
                        valueFormat="DD MMM YYYY"
                        error={errors.permitDate?.message}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="siteId"
                    render={({ field }) => (
                      <Select
                        label="Site"
                        placeholder={sitesLoading ? 'Loading sites...' : 'Select site'}
                        data={siteOptions}
                        value={field.value ?? null}
                        onChange={(value) => field.onChange(value ?? undefined)}
                        searchable
                        clearable
                      />
                    )}
                  />
                  <TextInput label="Site Name" placeholder="Site" {...register('siteName')} />
                  <TextInput label="Exact Location" placeholder="Job location" {...register('exactLocation')} />
                </SimpleGrid>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Controller
                  control={control}
                  name="permitTypes"
                  render={({ field }) => (
                    <Checkbox.Group label="Type of Permit" {...field} value={field.value ?? []}>
                      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm" mt="xs">
                        {PERMIT_TYPES.map((option) => (
                          <Checkbox key={option.value} value={option.value} label={option.label} />
                        ))}
                      </SimpleGrid>
                    </Checkbox.Group>
                  )}
                />

                <Controller
                  control={control}
                  name="permitReceiverType"
                  render={({ field }) => (
                    <Radio.Group label="Permit Receiver" {...field} value={field.value ?? 'employee'} mt="md">
                      <Group mt="xs">
                        {PERMIT_RECEIVER_OPTIONS.map((option) => (
                          <Radio key={option.value} value={option.value} label={option.label} />
                        ))}
                      </Group>
                    </Radio.Group>
                  )}
                />

                <Controller
                  control={control}
                  name="natureOfWork"
                  render={({ field }) => (
                    <Checkbox.Group label="Nature of Work" {...field} value={field.value ?? []} mt="md">
                      <Group mt="xs">
                        {NATURE_OF_WORK_OPTIONS.map((option) => (
                          <Checkbox key={option.value} value={option.value} label={option.label} />
                        ))}
                      </Group>
                    </Checkbox.Group>
                  )}
                />

                <Textarea label="Job Work Description" minRows={3} autosize mt="md" {...register('jobDescription')} />
                <Textarea label="Tools & Equipment" minRows={2} autosize mt="md" {...register('toolsEquipment')} />
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing="md">
                  <TextInput label="Validity From (Hrs.)" placeholder="08:00" {...register('validityFrom')} />
                  <TextInput label="Validity To (Hrs.)" placeholder="18:00" {...register('validityTo')} />
                  <Controller
                    control={control}
                    name="validityDate"
                    rules={{ required: 'Validity date required' }}
                    render={({ field }) => (
                      <DateInput
                        label="Validity Date"
                        value={field.value}
                        onChange={field.onChange}
                        valueFormat="DD MMM YYYY"
                        error={errors.validityDate?.message}
                      />
                    )}
                  />
                  <TextInput label="Shift" placeholder="Shift" {...register('validityShift')} />
                  <TextInput
                    label="Responsible Person"
                    placeholder="Supervisor name"
                    {...register('responsiblePerson')}
                  />
                  <TextInput label="Service Agency" placeholder="Agency name" {...register('serviceAgency')} />
                  <TextInput label="Emergency Contact No." placeholder="Contact" {...register('emergencyContact')} />
                  <TextInput label="No. of Persons Deployed" placeholder="Count" {...register('personsDeployed')} />
                </SimpleGrid>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Controller
                  control={control}
                  name="hazardConsiderations"
                  render={({ field }) => (
                    <Checkbox.Group label="Hazard Considerations" {...field} value={field.value ?? []}>
                      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm" mt="xs">
                        {HAZARD_OPTIONS.map((option) => (
                          <Checkbox key={option.value} value={option.value} label={option.label} />
                        ))}
                      </SimpleGrid>
                    </Checkbox.Group>
                  )}
                />
                <TextInput label="Hazard - Others" placeholder="Specify other hazards" mt="md" {...register('hazardOther')} />
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Controller
                  control={control}
                  name="preparationChecks"
                  render={({ field }) => (
                    <Checkbox.Group label="Preparation & Precautions" {...field} value={field.value ?? []}>
                      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm" mt="xs">
                        {PREPARATION_CHECKS.map((option) => (
                          <Checkbox key={option.value} value={option.value} label={option.label} />
                        ))}
                      </SimpleGrid>
                    </Checkbox.Group>
                  )}
                />
                <Textarea
                  label="Any extra precautions"
                  minRows={2}
                  autosize
                  mt="md"
                  {...register('preparationExtra')}
                />
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Controller
                  control={control}
                  name="ppeRequired"
                  render={({ field }) => (
                    <Checkbox.Group label="PPE Required" {...field} value={field.value ?? []}>
                      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm" mt="xs">
                        {PPE_OPTIONS.map((option) => (
                          <Checkbox key={option.value} value={option.value} label={option.label} />
                        ))}
                      </SimpleGrid>
                    </Checkbox.Group>
                  )}
                />
                <TextInput label="PPE - Others" placeholder="Additional PPE" mt="md" {...register('ppeOthers')} />
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Textarea
                  label="Specific Caution About Hazard & Extra Precaution"
                  minRows={3}
                  autosize
                  {...register('specificCaution')}
                />
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                  <TextInput label="Project In Charge - Name" {...register('projectInChargeName')} />
                  <TextInput label="Project In Charge - Sign" {...register('projectInChargeSign')} />
                  <TextInput label="EHS Person - Name" {...register('ehsPersonName')} />
                  <TextInput label="EHS Person - Sign" {...register('ehsPersonSign')} />
                  <TextInput label="Permit Issued By - Name" {...register('permitIssuedByName')} />
                  <TextInput label="Permit Issued By - Sign" {...register('permitIssuedBySign')} />
                  <TextInput label="Permit Received By - Name" {...register('permitReceivedByName')} />
                  <TextInput label="Permit Received By - Sign" {...register('permitReceivedBySign')} />
                </SimpleGrid>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                  <TextInput label="Certification - Name" {...register('certificationName')} />
                  <TextInput label="Certification - Sign" {...register('certificationSign')} />
                </SimpleGrid>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Controller
                  control={control}
                  name="closureStatus"
                  render={({ field }) => (
                    <Radio.Group label="Permit Closure" {...field} value={field.value ?? 'completed'}>
                      <Stack mt="xs" gap="xs">
                        {CLOSURE_STATUS.map((option) => (
                          <Radio key={option.value} value={option.value} label={option.label} />
                        ))}
                      </Stack>
                    </Radio.Group>
                  )}
                />
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mt="md">
                  <TextInput label="Closure - Receiver Name" {...register('closureReceiverName')} />
                  <TextInput label="Closure - Receiver Sign" {...register('closureReceiverSign')} />
                  <TextInput label="Closure - Receiver Date/Time" {...register('closureReceiverDateTime')} />
                  <TextInput label="Closure - Issuer Name" {...register('closureIssuerName')} />
                  <TextInput label="Closure - Issuer Sign" {...register('closureIssuerSign')} />
                  <TextInput label="Closure - Issuer Date/Time" {...register('closureIssuerDateTime')} />
                </SimpleGrid>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                  <TextInput label="Final Inspection - Name" {...register('finalInspectorName')} />
                  <TextInput label="Final Inspection - Sign" {...register('finalInspectorSign')} />
                  <TextInput label="Final Inspection - Date/Time" {...register('finalInspectorDateTime')} />
                </SimpleGrid>
                <Textarea label="Additional Notes" minRows={2} autosize mt="md" {...register('notes')} />
              </Card>

              <Group justify="flex-end">
                <Button
                  variant="default"
                  onClick={() => {
                    setFormOpened(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={submitting}>
                  {editingId ? 'Update permit' : 'Save permit'}
                </Button>
              </Group>
            </Stack>
          </ScrollArea>
        </form>
      </Modal>

      <Modal
        opened={viewOpened && !!selectedRecord}
        onClose={() => {
          setViewOpened(false);
          setSelectedRecord(null);
        }}
        size="90%"
        radius="md"
        title="Work Permit"
        overlayProps={{ blur: 3 }}
      >
        {selectedRecord ? (
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Permit Date
                </Text>
                <Text fw={600}>{formatDate(selectedRecord.permitDate)}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Permit Types
                </Text>
                <Text fw={600}>{formatList(selectedRecord.permitTypes, PERMIT_TYPE_LABELS)}</Text>
              </Card>
            </SimpleGrid>
            <ScrollArea h={320}>
              <Table withColumnBorders striped>
                <thead>
                  <tr>
                    <th>Nature of Work</th>
                    <th>Hazard Considerations</th>
                    <th>PPE Required</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{formatList(selectedRecord.natureOfWork, NATURE_OF_WORK_LABELS)}</td>
                    <td>{formatList(selectedRecord.hazardConsiderations, HAZARD_LABELS)}</td>
                    <td>{formatList(selectedRecord.ppeRequired, PPE_LABELS)}</td>
                  </tr>
                </tbody>
              </Table>
            </ScrollArea>
            <Card withBorder radius="md" padding="md" shadow="xs">
              <Text size="sm" c="dimmed">
                Specific Caution
              </Text>
              <Text>{selectedRecord.specificCaution || '—'}</Text>
            </Card>
          </Stack>
        ) : null}
      </Modal>
    </EhsPageLayout>
  );
};

export default WorkPermitPage;
