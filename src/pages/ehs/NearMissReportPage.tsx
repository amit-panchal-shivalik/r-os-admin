import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
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
import { IconAlertCircle, IconEye, IconPencil, IconPlus, IconPrinter, IconRefresh, IconTrash } from '@tabler/icons-react';
import dayjs from 'dayjs';
import EhsPageLayout from '@/components/ehs/EhsPageLayout';
import { usePermissions } from '@/hooks/usePermissions';
import { useSites } from '@/hooks/useSites';
import { useNearMissReports } from '@/hooks/useNearMissReports';
import { NearMissReportPayload } from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';
import logo from '@/assets/ehs/Logo.jpeg';

const SEVERITY_OPTIONS = [
  { value: 'stop_work', label: 'Stop work & report' },
  { value: 'make_safe_report', label: 'Make safe (if possible), use caution & report' },
  { value: 'continue_report', label: 'Make safe (if possible), continue & report' },
];

const createAction = () => ({
  description: '',
  responsibility: '',
  dueDate: '',
  completedDate: '',
});

type CorrectiveActionFormValue = ReturnType<typeof createAction>;

type NearMissFormValues = {
  siteId?: string;
  reportNumber: string;
  severityLevel: string[];
  department: string;
  reportedTime: string;
  reportedDate: Date | null;
  location: string;
  description: string;
  immediateAction: string;
  reportedBy: string;
  investigationManager: string;
  investigationDate: string;
  investigationTeam: string;
  rootCause: string;
  correctiveActions: CorrectiveActionFormValue[];
  riskAssessmentUpdate: string;
  additionalAreasInformed: string;
  documentsUpdateRequired: string;
  reviewComments: string;
  reviewDate: string;
  reviewerSignature: string;
};

const createDefaultValues = (): NearMissFormValues => ({
  siteId: undefined,
  reportNumber: '',
  severityLevel: [],
  department: '',
  reportedTime: '',
  reportedDate: new Date(),
  location: '',
  description: '',
  immediateAction: '',
  reportedBy: '',
  investigationManager: '',
  investigationDate: '',
  investigationTeam: '',
  rootCause: '',
  correctiveActions: Array.from({ length: 3 }).map(() => createAction()),
  riskAssessmentUpdate: '',
  additionalAreasInformed: '',
  documentsUpdateRequired: '',
  reviewComments: '',
  reviewDate: '',
  reviewerSignature: '',
});

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dayjs(date).format('DD/MM/YYYY');
};

const buildPrintHtml = (record: any) => {
  const actions = (record.correctiveActions || []).map((action: any, index: number) => `
      <tr>
        <td style="border:1px solid #000;padding:6px;">${action.description ?? ''}</td>
        <td style="border:1px solid #000;padding:6px;width:140px;">${action.responsibility ?? ''}</td>
        <td style="border:1px solid #000;padding:6px;width:100px;">${action.dueDate ?? ''}</td>
        <td style="border:1px solid #000;padding:6px;width:120px;">${action.completedDate ?? ''}</td>
      </tr>
    `);

  while (actions.length < 5) {
    actions.push(`
      <tr>
        <td style="border:1px solid #000;padding:6px;height:60px;">&nbsp;</td>
        <td style="border:1px solid #000;padding:6px;">&nbsp;</td>
        <td style="border:1px solid #000;padding:6px;">&nbsp;</td>
        <td style="border:1px solid #000;padding:6px;">&nbsp;</td>
      </tr>`);
  }

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Near Miss / Unsafe Condition Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #fff; color: #000; }
          .sheet { border: 2px solid #000; padding: 16px; page-break-after: always; }
          .sheet:last-child { page-break-after: auto; }
          .header { display: grid; grid-template-columns: 2fr 3fr 1.2fr; gap: 12px; align-items: stretch; margin-bottom: 16px; }
          .logo { border:1px solid #000; display:flex; align-items:center; justify-content:center; padding:12px; background:#fff; }
          .title { border:1px solid #000; background:#f3f3f3; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:700; text-align:center; padding:12px; }
          .meta { border:1px solid #000; background:#f3f3f3; padding:12px; font-size:12px; line-height:1.4; }
          table { border-collapse: collapse; width: 100%; font-size: 12px; }
          th, td { border: 1px solid #000; padding: 6px; }
          th { background: #f3f3f3; }
          .blue-text { color: #0b61d8; font-weight: 600; text-align: center; margin: 12px 0; }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="header">
            <div class="logo"><img src="${logo}" alt="Shivalik" style="max-width:150px;max-height:60px;object-fit:contain;" /></div>
            <div class="title">Near Miss/ Unsafe Act/ Unsafe Condition Report</div>
            <div class="meta">
              <div>Format No.: EHS-F-26</div>
              <div>Rev. No.: 00</div>
            </div>
          </div>

          <table>
            <tr>
              <td colspan="3" style="font-weight:600;">Use this form to report a near miss, unsafe conditions, unsafe acts, damage to the environment.</td>
              <td style="width:160px;">Report No.: ${record.reportNumber ?? ''}</td>
            </tr>
          </table>

          <table style="margin-top:10px;">
            <tr>
              <th colspan="3" style="text-align:center;">Tick appropriate level</th>
            </tr>
            <tr>
              <td style="text-align:center;">${record.severityLevel?.includes('stop_work') ? '☑' : '☐'} Stop work & report</td>
              <td style="text-align:center;">${record.severityLevel?.includes('make_safe_report') ? '☑' : '☐'} Make safe (if possible), use caution & report</td>
              <td style="text-align:center;">${record.severityLevel?.includes('continue_report') ? '☑' : '☐'} Make safe (if possible), continue & report</td>
            </tr>
          </table>

          <table style="margin-top:10px;">
            <tr>
              <td style="width:25%;">Reported By (Optional): ${record.reportedBy ?? ''}</td>
              <td style="width:25%;">Dept: ${record.department ?? ''}</td>
              <td style="width:25%;">Time: ${record.reportedTime ?? ''}</td>
              <td style="width:25%;">Date: ${formatDate(record.reportedDate)}</td>
            </tr>
          </table>

          <table style="margin-top:10px;">
            <tr>
              <td style="height:60px;">Where did the near miss / unsafe condition / unsafe act happen?<br/>${record.location ?? ''}</td>
            </tr>
            <tr>
              <td style="height:80px;">What happened (what did you see)?<br/>${record.description ?? ''}</td>
            </tr>
            <tr>
              <td style="height:80px;">Immediate action taken?<br/>${record.immediateAction ?? ''}</td>
            </tr>
          </table>

          <div class="blue-text">Thanks for making this a safer place to work.<br/>Please now pass/email this form to your Safety Officer</div>

          <h3 style="margin:12px 0 4px;">NEAR MISS/UNSAFE CONDITION/UNSAFE ACT INVESTIGATION</h3>
          <table>
            <tr>
              <td>Manager/Supervisor name: ${record.investigationManager ?? ''}</td>
              <td>Date: ${record.investigationDate ?? ''}</td>
            </tr>
            <tr>
              <td colspan="2">Investigation team: ${record.investigationTeam ?? ''}</td>
            </tr>
            <tr>
              <td colspan="2" style="height:100px;">Why & how the near miss happened (What was the root cause)?<br/>${record.rootCause ?? ''}</td>
            </tr>
          </table>
        </div>

        <div class="sheet">
          <div class="header">
            <div class="logo"><img src="${logo}" alt="Shivalik" style="max-width:150px;max-height:60px;object-fit:contain;" /></div>
            <div class="title">Near Miss/ Unsafe Act/ Unsafe Condition Report</div>
            <div class="meta">
              <div>Format No.: EHS-F-26</div>
              <div>Rev. No.: 00</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th colspan="4" style="text-align:left;">Corrective action required</th>
              </tr>
              <tr>
                <th>Please describe corrective action required</th>
                <th>Responsibility</th>
                <th>Due date</th>
                <th>Completed date</th>
              </tr>
            </thead>
            <tbody>
              ${actions.join('')}
            </tbody>
          </table>

          <table style="margin-top:12px;">
            <tr>
              <td>Does the risk assessment for the area/ activity require reviewing or updating?<br/>${record.riskAssessmentUpdate ?? ''}</td>
              <td style="width:60px;text-align:center;">Yes ${record.riskAssessmentUpdate?.toLowerCase() === 'yes' ? '☑' : '☐'}</td>
              <td style="width:60px;text-align:center;">No ${record.riskAssessmentUpdate?.toLowerCase() === 'no' ? '☑' : '☐'}</td>
            </tr>
            <tr>
              <td>Are other concerned people / areas that may be affected been informed?<br/>${record.additionalAreasInformed ?? ''}</td>
              <td style="text-align:center;">Yes ${record.additionalAreasInformed?.toLowerCase() === 'yes' ? '☑' : '☐'}</td>
              <td style="text-align:center;">No ${record.additionalAreasInformed?.toLowerCase() === 'no' ? '☑' : '☐'}</td>
            </tr>
            <tr>
              <td>Does it requires documents reviewing or updating?<br/>${record.documentsUpdateRequired ?? ''}</td>
              <td style="text-align:center;">Yes ${record.documentsUpdateRequired?.toLowerCase() === 'yes' ? '☑' : '☐'}</td>
              <td style="text-align:center;">No ${record.documentsUpdateRequired?.toLowerCase() === 'no' ? '☑' : '☐'}</td>
            </tr>
          </table>

          <div class="blue-text">Please now pass/email a copy of the completed form to the EHS Head</div>

          <table>
            <tr>
              <th colspan="2">Review of actions by Project in Charge and Comment</th>
            </tr>
            <tr>
              <td colspan="2" style="height:100px;">${record.reviewComments ?? ''}</td>
            </tr>
            <tr>
              <td>Date of review: ${record.reviewDate ?? ''}</td>
              <td>Signature: ${record.reviewerSignature ?? ''}</td>
            </tr>
          </table>
        </div>
      </body>
    </html>
  `;

  return html;
};

const NearMissReportPage = () => {
  const { can, loading: permissionsLoading, roles } = usePermissions();
  const { sites, loading: sitesLoading } = useSites();
  const { records, loading, fetchReports, createReport, updateReport } = useNearMissReports({ limit: 50 });

  const [formOpened, setFormOpened] = useState(false);
  const [viewOpened, setViewOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = roles.includes('SuperAdmin');
  const canView = isSuperAdmin || can('NearMissReport', 'view') || roles.length === 0;
  const canCreate = isSuperAdmin || can('NearMissReport', 'add') || roles.length === 0;
  const canEdit = isSuperAdmin || can('NearMissReport', 'edit');

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NearMissFormValues>({ defaultValues: createDefaultValues() });

  const { fields, append, remove, replace } = useFieldArray({ control, name: 'correctiveActions' });
  const watchedSiteId = watch('siteId');

  useEffect(() => {
    if (!permissionsLoading && canView) {
      fetchReports().catch(() => undefined);
    }
  }, [permissionsLoading, canView, fetchReports]);

  useEffect(() => {
    if (!watchedSiteId) return;
    const site = sites.find((item) => item._id === watchedSiteId);
    if (site && !watch('reportNumber')) {
      setValue('reportNumber', `${site.code ?? 'NM'}/${dayjs().format('YYYYMMDD')}/${Math.floor(Math.random() * 100)}`, { shouldDirty: false });
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

  const openCreateModal = () => {
    if (!canCreate) {
      showMessage('You do not have permission to submit near miss', 'error');
      return;
    }
    const defaults = createDefaultValues();
    reset(defaults);
    replace(defaults.correctiveActions);
    setEditingId(null);
    setFormOpened(true);
  };

  const handleEdit = (record: any) => {
    if (!canEdit) {
      showMessage('You do not have permission to edit this report', 'error');
      return;
    }
    const defaults = createDefaultValues();
    reset({
      siteId: record.siteSnapshot?.id ?? undefined,
      reportNumber: record.reportNumber ?? '',
      severityLevel: record.severityLevel ? [].concat(record.severityLevel) : [],
      department: record.department ?? '',
      reportedTime: record.reportedTime ?? '',
      reportedDate: record.reportedDate ? new Date(record.reportedDate) : new Date(),
      location: record.location ?? '',
      description: record.description ?? '',
      immediateAction: record.immediateAction ?? '',
      reportedBy: record.reportedBy ?? '',
      investigationManager: record.investigationManager ?? '',
      investigationDate: record.investigationDate ?? '',
      investigationTeam: record.investigationTeam ?? '',
      rootCause: record.rootCause ?? '',
      correctiveActions: (record.correctiveActions || []).map((action: any) => ({
        description: action.description ?? '',
        responsibility: action.responsibility ?? '',
        dueDate: action.dueDate ?? '',
        completedDate: action.completedDate ?? '',
      })) || defaults.correctiveActions,
      riskAssessmentUpdate: record.riskAssessmentUpdate ?? '',
      additionalAreasInformed: record.additionalAreasInformed ?? '',
      documentsUpdateRequired: record.documentsUpdateRequired ?? '',
      reviewComments: record.reviewComments ?? '',
      reviewDate: record.reviewDate ?? '',
      reviewerSignature: record.reviewerSignature ?? '',
    });
    const actionRows = (record.correctiveActions || []).map((action: any) => ({
      description: action.description ?? '',
      responsibility: action.responsibility ?? '',
      dueDate: action.dueDate ?? '',
      completedDate: action.completedDate ?? '',
    }));
    replace(actionRows.length ? actionRows : defaults.correctiveActions);
    setFormOpened(true);
  };

  const handleView = (record: any) => {
    setSelectedRecord(record);
    setViewOpened(true);
  };

  const handlePrint = useCallback((record?: any) => {
    const target = record || selectedRecord;
    if (!target) {
      showMessage('Select a report to print', 'info');
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

  const onSubmit = async (values: NearMissFormValues) => {
    const payload: NearMissReportPayload = {
      siteId: values.siteId || undefined,
      reportNumber: values.reportNumber || undefined,
      severityLevel: values.severityLevel || [],
      department: values.department || undefined,
      reportedTime: values.reportedTime || undefined,
      reportedDate: values.reportedDate ? values.reportedDate.toISOString() : undefined,
      location: values.location || undefined,
      description: values.description || undefined,
      immediateAction: values.immediateAction || undefined,
      reportedBy: values.reportedBy || undefined,
      investigationManager: values.investigationManager || undefined,
      investigationDate: values.investigationDate || undefined,
      investigationTeam: values.investigationTeam || undefined,
      rootCause: values.rootCause || undefined,
      correctiveActions: values.correctiveActions
        .filter((action) => action.description?.trim())
        .map((action) => ({
          description: action.description,
          responsibility: action.responsibility || undefined,
          dueDate: action.dueDate || undefined,
          completedDate: action.completedDate || undefined,
        })),
      riskAssessmentUpdate: values.riskAssessmentUpdate || undefined,
      additionalAreasInformed: values.additionalAreasInformed || undefined,
      documentsUpdateRequired: values.documentsUpdateRequired || undefined,
      reviewComments: values.reviewComments || undefined,
      reviewDate: values.reviewDate || undefined,
      reviewerSignature: values.reviewerSignature || undefined,
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await updateReport(editingId, payload);
      } else {
        await createReport(payload);
      }
      await fetchReports();
      setFormOpened(false);
      setEditingId(null);
      const defaults = createDefaultValues();
      reset(defaults);
      replace(defaults.correctiveActions);
    } catch (error: any) {
      showMessage(error?.message ?? 'Unable to save near miss report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EhsPageLayout
      title="Near Miss / Unsafe Act Report"
      description="Encourage reporting of near misses and unsafe conditions, assign corrective actions, and track closure."
      actions={
        <Group>
          <Button
            variant="light"
            color="gray"
            leftSection={<IconRefresh size={16} />}
            onClick={() => fetchReports()}
            loading={loading}
          >
            Refresh
          </Button>
          {canCreate ? (
            <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
              Submit Near Miss
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
          You do not have permission to view near miss reports.
        </Alert>
      ) : (
        <Stack gap="lg">
          <Card withBorder radius="md" padding="lg" shadow="sm">
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <Text size="sm" c="dimmed">
                  Reports recorded: {records.length}
                </Text>
              </Group>
              <ScrollArea>
                <Table highlightOnHover striped withColumnBorders>
                  <thead>
                    <tr>
                      <th>Report No.</th>
                      <th>Date</th>
                      <th>Location</th>
                      <th>Severity</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length ? (
                      records.map((record) => (
                        <tr key={record._id}>
                          <td>{record.reportNumber || '—'}</td>
                          <td>{formatDate(record.reportedDate)}</td>
                          <td>{record.location || '—'}</td>
                          <td>
                            <Badge color={record.severityLevel?.includes('stop_work') ? 'red' : 'yellow'} variant="light">
                              {Array.isArray(record.severityLevel) ? record.severityLevel.join(', ') : record.severityLevel || '—'}
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
                            No near miss reports captured yet.
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
                <Text fw={600}>Report Preview</Text>
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
                    Report number
                  </Text>
                  <Text fw={600}>{selectedRecord.reportNumber || '—'}</Text>
                </Card>
                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Text size="sm" c="dimmed">
                    Date
                  </Text>
                  <Text fw={600}>{formatDate(selectedRecord.reportedDate)}</Text>
                </Card>
              </SimpleGrid>
              <Card withBorder radius="md" padding="md" shadow="xs" mt="md">
                <Text size="sm" c="dimmed">
                  Description
                </Text>
                <Text>{selectedRecord.description || '—'}</Text>
              </Card>
              <ScrollArea h={220} mt="md">
                <Table withColumnBorders striped>
                  <thead>
                    <tr>
                      <th>Corrective action</th>
                      <th>Responsibility</th>
                      <th>Due date</th>
                      <th>Completed date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRecord.correctiveActions?.length ? (
                      selectedRecord.correctiveActions.map((action: any, index: number) => (
                        <tr key={`${action.description}-${index}`}>
                          <td>{action.description || '—'}</td>
                          <td>{action.responsibility || '—'}</td>
                          <td>{action.dueDate || '—'}</td>
                          <td>{action.completedDate || '—'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4}>
                          <Text size="sm" c="dimmed" ta="center">
                            No corrective actions recorded.
                          </Text>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </ScrollArea>
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
        title={editingId ? 'Edit Near Miss Report' : 'Submit Near Miss Report'}
        overlayProps={{ blur: 3 }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea offsetScrollbars h="70vh">
            <Stack gap="lg" py="xs">
              <Card withBorder radius="md" padding="lg" shadow="xs">
                <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing="md">
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
                  <TextInput label="Report number" placeholder="NM/2025/001" {...register('reportNumber')} />
                  <Controller
                    control={control}
                    name="reportedDate"
                    rules={{ required: 'Date required' }}
                    render={({ field }) => (
                      <DateInput
                        label="Date"
                        value={field.value}
                        onChange={field.onChange}
                        valueFormat="DD MMM YYYY"
                        error={errors.reportedDate?.message}
                      />
                    )}
                  />
                  <TextInput label="Time" placeholder="14:45" {...register('reportedTime')} />
                  <TextInput label="Department" placeholder="Department" {...register('department')} />
                  <TextInput label="Location" placeholder="Location" {...register('location')} />
                  <TextInput label="Reported by" placeholder="Name" {...register('reportedBy')} />
                </SimpleGrid>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Controller
                  control={control}
                  name="severityLevel"
                  render={({ field }) => (
                    <Checkbox.Group label="Tick appropriate level" {...field} value={field.value ?? []}>
                      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm" mt="xs">
                        {SEVERITY_OPTIONS.map((option) => (
                          <Checkbox key={option.value} value={option.value} label={option.label} />
                        ))}
                      </SimpleGrid>
                    </Checkbox.Group>
                  )}
                />
                <Textarea label="Description" minRows={3} autosize mt="md" {...register('description')} />
                <Textarea label="Immediate action taken" minRows={2} autosize mt="md" {...register('immediateAction')} />
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                  <TextInput label="Investigation manager" placeholder="Manager name" {...register('investigationManager')} />
                  <TextInput label="Investigation date" placeholder="DD/MM/YYYY" {...register('investigationDate')} />
                  <TextInput label="Investigation team" placeholder="Team members" {...register('investigationTeam')} />
                  <Textarea label="Root cause" minRows={3} autosize {...register('rootCause')} />
                </SimpleGrid>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Text fw={600} mb="sm">
                  Corrective actions
                </Text>
                <ScrollArea h={260} offsetScrollbars>
                  <Table withColumnBorders>
                    <thead>
                      <tr>
                        <th>Action description</th>
                        <th style={{ width: 160 }}>Responsibility</th>
                        <th style={{ width: 120 }}>Due date</th>
                        <th style={{ width: 140 }}>Completed date</th>
                        <th style={{ width: 40 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((field, index) => (
                        <tr key={field.id}>
                          <td>
                            <Textarea
                              autosize
                              minRows={2}
                              {...register(`correctiveActions.${index}.description` as const, {
                                required: 'Required',
                              })}
                              error={errors.correctiveActions?.[index]?.description?.message}
                            />
                          </td>
                          <td>
                            <TextInput placeholder="Responsible" {...register(`correctiveActions.${index}.responsibility` as const)} />
                          </td>
                          <td>
                            <TextInput placeholder="Due date" {...register(`correctiveActions.${index}.dueDate` as const)} />
                          </td>
                          <td>
                            <TextInput placeholder="Completed date" {...register(`correctiveActions.${index}.completedDate` as const)} />
                          </td>
                          <td>
                            <ActionIcon variant="subtle" color="red" onClick={() => remove(index)} disabled={fields.length <= 1}>
                              <IconTrash size={16} />
                            </ActionIcon>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </ScrollArea>
                <Group justify="flex-end" mt="md">
                  <Button variant="subtle" leftSection={<IconPlus size={14} />} onClick={() => append(createAction())}>
                    Add corrective action
                  </Button>
                </Group>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                  <TextInput label="Risk assessment update" placeholder="Yes/No" {...register('riskAssessmentUpdate')} />
                  <TextInput label="Additional areas informed" placeholder="Yes/No" {...register('additionalAreasInformed')} />
                  <TextInput label="Documents update required" placeholder="Yes/No" {...register('documentsUpdateRequired')} />
                  <Textarea label="Review comments" minRows={3} autosize {...register('reviewComments')} />
                  <TextInput label="Review date" placeholder="DD/MM/YYYY" {...register('reviewDate')} />
                  <TextInput label="Reviewer signature" placeholder="Signature" {...register('reviewerSignature')} />
                </SimpleGrid>
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
                  {editingId ? 'Update report' : 'Save report'}
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
        title="Near Miss / Unsafe Act Report"
        overlayProps={{ blur: 3 }}
      >
        {selectedRecord ? (
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Report number
                </Text>
                <Text fw={600}>{selectedRecord.reportNumber || '—'}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Date
                </Text>
                <Text fw={600}>{formatDate(selectedRecord.reportedDate)}</Text>
              </Card>
            </SimpleGrid>
            <ScrollArea h={320}>
              <Table withColumnBorders striped>
                <thead>
                  <tr>
                    <th>Corrective action</th>
                    <th>Responsibility</th>
                    <th>Due date</th>
                    <th>Completed date</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRecord.correctiveActions?.length ? (
                    selectedRecord.correctiveActions.map((action: any, index: number) => (
                      <tr key={`${action.description}-${index}`}>
                        <td>{action.description || '—'}</td>
                        <td>{action.responsibility || '—'}</td>
                        <td>{action.dueDate || '—'}</td>
                        <td>{action.completedDate || '—'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4}>
                        <Text size="sm" c="dimmed" ta="center">
                          No corrective actions recorded.
                        </Text>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </ScrollArea>
          </Stack>
        ) : null}
      </Modal>
    </EhsPageLayout>
  );
};

export default NearMissReportPage;
