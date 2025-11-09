import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Loader,
  Modal,
  MultiSelect,
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
import { useScaffoldInspections } from '@/hooks/useScaffoldInspections';
import {
  ScaffoldInspectionChecklistPayload,
  ScaffoldInspectionChecklistRecord,
  ScaffoldInspectionStatus,
} from '@/apis/ehs';
import logo from '@/assets/ehs/Logo.jpeg';
import { showMessage } from '@/utils/Constant';

type ChecklistFormEntry = {
  key: string;
  status: ScaffoldInspectionStatus | '';
};

type ScaffoldInspectionFormValues = {
  siteId?: string;
  inspectionDate: Date | null;
  location: string;
  frequency: string;
  scaffoldTypes: string[];
  checkpoints: ChecklistFormEntry[];
  remarks: string;
  inspectedBy: string;
  projectInCharge: string;
  fitnessStatus: '' | 'Fit' | 'Unfit';
};

const CHECKPOINTS: Array<{ key: string; label: string }> = [
  { key: 'adequateSpace', label: 'Is adequate space available to build scaffolding?' },
  { key: 'membersCondition', label: 'Are scaffolding members free of any damage / corrosion?' },
  { key: 'basePlate', label: 'Is base plate provided at the base of the scaffolding?' },
  {
    key: 'lockingArrangement',
    label: 'Is locking arrangement of each member effective (Vertical, horizontal and cross arms) using pin/ bracing/ Pipe lock?',
  },
  { key: 'safeAccess', label: 'Is there a safe access to the working platform?' },
  { key: 'ladderReach', label: 'Is the reach of the access ladder ensured up to the working platform?' },
  { key: 'baseHeightRatio', label: 'Is the base to height ratio maintained at 4:1 (Height: base)?' },
  {
    key: 'verticality',
    label: 'Is verticality of the structure properly tied with permanent structure at every 3 meters?',
  },
  {
    key: 'platformStrength',
    label: 'Is scaffold platform having adequate strength and in sound & healthy condition?',
  },
  {
    key: 'plankSecured',
    label: 'Are platform planks properly secured with the scaffolding structure?',
  },
  { key: 'noOpenings', label: 'Is platform ensured without any opening?' },
  {
    key: 'railings',
    label: 'Is working platform provided with railing (Main & mid rail and toe board required)?',
  },
  {
    key: 'overheadSupply',
    label: 'Is there any overhead electric supply line near the platform? If yes, is supply isolated?',
  },
  { key: 'wheelsProvided', label: 'Are wheels provided at the base?' },
  { key: 'wheelsLocking', label: 'Are wheels provided with locking facility?' },
  { key: 'wheelSurface', label: 'Wheels having the firm and leveled surface' },
];

const SCAFFOLD_TYPES = [
  { value: 'Cup Lock Type', label: 'Cup Lock Type' },
  { value: 'Frame Type (With Wheel / Without Wheel)', label: 'Frame Type (With Wheel / Without Wheel)' },
];

const STATUS_OPTIONS: Array<{ label: string; value: ScaffoldInspectionStatus }> = [
  { label: 'Yes', value: 'YES' },
  { label: 'No', value: 'NO' },
  { label: 'NA', value: 'NA' },
];

const FREQUENCIES = [
  { label: 'Daily', value: 'Daily' },
  { label: 'Weekly', value: 'Weekly' },
  { label: 'Monthly', value: 'Monthly' },
];

const DEFAULT_VALUES: ScaffoldInspectionFormValues = {
  siteId: undefined,
  inspectionDate: new Date(),
  location: '',
  frequency: 'Weekly',
  scaffoldTypes: [],
  checkpoints: CHECKPOINTS.map((item) => ({ key: item.key, status: '' })),
  remarks: '',
  inspectedBy: '',
  projectInCharge: '',
  fitnessStatus: '',
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dayjs(date).format('DD/MM/YYYY');
};

const buildPrintHtml = (record: ScaffoldInspectionChecklistRecord) => {
  const rows = CHECKPOINTS.map((checkpoint, index) => {
    const status =
      record?.checkpoints?.find((entry) => entry.key === checkpoint.key)?.status ??
      (record as any)?.[checkpoint.key] ??
      '';
    const yes = status === 'YES' ? '✔' : '';
    const no = status === 'NO' ? '✔' : '';
    const na = status === 'NA' ? '✔' : '';
    return `
      <tr>
        <td style="border:1px solid #000;padding:6px;text-align:center;">${index + 1}</td>
        <td style="border:1px solid #000;padding:6px;">${checkpoint.label}</td>
        <td style="border:1px solid #000;padding:6px;text-align:center;">${yes}</td>
        <td style="border:1px solid #000;padding:6px;text-align:center;">${no}</td>
        <td style="border:1px solid #000;padding:6px;text-align:center;">${na}</td>
      </tr>`;
  }).join('');

  const scaffoldTypes = (record.scaffoldTypes ?? [])
    .map((type) => `<li>${type}</li>`)
    .join('') || '<li>—</li>';

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Scaffold Inspection Checklist</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; background: #fff; padding: 24px; }
          .sheet { border: 2px solid #000; padding: 16px; }
          .header { display: grid; grid-template-columns: 2fr 3fr 1.5fr; gap: 12px; align-items: stretch; margin-bottom: 16px; }
          .logo { border:1px solid #000; display:flex; align-items:center; justify-content:center; padding:12px; background:#fff; }
          .title { border:1px solid #000; background:#f3f3f3; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:700; text-align:center; padding:12px; }
          .meta { border:1px solid #000; background:#f3f3f3; padding:12px; font-size:12px; line-height:1.5; }
          .details { border:1px solid #000; margin-bottom:16px; }
          .details-row { display:grid; grid-template-columns: repeat(2, 1fr); border-bottom:1px solid #000; }
          .details-row div { padding:6px 8px; border-right:1px solid #000; font-size:12px; }
          .details-row div:last-child { border-right:none; }
          .details-row:last-child { border-bottom:none; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background:#f3f3f3; border:1px solid #000; padding:6px; }
          td { border:1px solid #000; padding:6px; vertical-align: top; }
          .footer { border:1px solid #000; margin-top:16px; }
          .footer-row { display:grid; grid-template-columns: repeat(2, 1fr); border-bottom:1px solid #000; }
          .footer-row div { padding:8px; border-right:1px solid #000; font-size:12px; min-height:40px; }
          .footer-row div:last-child { border-right:none; }
          .footer-row:last-child { border-bottom:none; }
          .fit-status { border:1px solid #000; padding:10px; font-size:12px; font-weight:600; margin-top:12px; text-transform:uppercase; }
          ul { margin:6px 0 6px 18px; padding:0; }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="header">
            <div class="logo"><img src="${logo}" alt="Shivalik" style="max-width:150px;max-height:60px;object-fit:contain;" /></div>
            <div class="title">Scaffolding Inspection Checklist</div>
            <div class="meta">
              <div>Format No.: EHS-F-27</div>
              <div>Rev. No.: 00</div>
              <div>Frequency: ${record.frequency || 'Weekly'}</div>
            </div>
          </div>

          <div class="details">
            <div class="details-row">
              <div>Name of Site: ${record.siteSnapshot?.name ?? ''}</div>
              <div>Date: ${formatDate(record.inspectionDate)}</div>
            </div>
            <div class="details-row">
              <div>Location: ${record.location || record.siteSnapshot?.location || ''}</div>
              <div>Type of Scaffolding:
                <ul>${scaffoldTypes}</ul>
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width:40px;">SN</th>
                <th>Check Points</th>
                <th style="width:60px;">Yes</th>
                <th style="width:60px;">No</th>
                <th style="width:60px;">NA</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <div class="footer">
            <div class="footer-row">
              <div>Remarks: ${record.remarks ?? ''}</div>
              <div>Inspected by: ${record.inspectedBy ?? ''}</div>
            </div>
            <div class="footer-row">
              <div>Project In Charge Sign: ${record.projectInCharge ?? ''}</div>
              <div>Frequency: ${record.frequency ?? ''}</div>
            </div>
          </div>

          <div class="fit-status">
            Fit / Unfit: ${record.fitnessStatus ?? ''}
          </div>
        </div>
      </body>
    </html>
  `;

  return html;
};

const ScaffoldInspectionChecklistPage = () => {
  const { can, loading: permissionsLoading, roles } = usePermissions();
  const { sites, loading: sitesLoading } = useSites();
  const { records, loading, fetchInspections, createInspection, updateInspection } = useScaffoldInspections({
    limit: 50,
  });

  const [formOpened, setFormOpened] = useState(false);
  const [viewOpened, setViewOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ScaffoldInspectionChecklistRecord | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = roles.includes('SuperAdmin');
  const canView = isSuperAdmin || can('ScaffoldInspectionChecklist', 'view') || roles.length === 0;
  const canCreate = isSuperAdmin || can('ScaffoldInspectionChecklist', 'add') || roles.length === 0;
  const canEdit = isSuperAdmin || can('ScaffoldInspectionChecklist', 'edit');

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ScaffoldInspectionFormValues>({ defaultValues: DEFAULT_VALUES });

  const { fields, replace } = useFieldArray({ control, name: 'checkpoints' });

  const watchedSiteId = watch('siteId');

  useEffect(() => {
    if (!permissionsLoading && canView) {
      fetchInspections().catch(() => undefined);
    }
  }, [permissionsLoading, canView, fetchInspections]);

  useEffect(() => {
    if (!watchedSiteId) return;
    const site = sites.find((item) => item._id === watchedSiteId);
    if (site && !watch('location')) {
      setValue('location', site.location ?? '', { shouldDirty: false });
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
      showMessage('You do not have permission to log scaffold inspection', 'error');
      return;
    }
    reset(DEFAULT_VALUES);
    replace(DEFAULT_VALUES.checkpoints);
    setEditingId(null);
    setFormOpened(true);
  };

  const handleEdit = (record: ScaffoldInspectionChecklistRecord) => {
    if (!canEdit) {
      showMessage('You do not have permission to edit scaffold inspection', 'error');
      return;
    }
    const mappedCheckpoints = CHECKPOINTS.map((checkpoint) => {
      const status =
        record.checkpoints?.find((entry) => entry.key === checkpoint.key)?.status ??
        (record as any)?.[checkpoint.key] ??
        '';
      return { key: checkpoint.key, status: (status as ScaffoldInspectionStatus) || '' };
    });

    reset({
      siteId: record.siteSnapshot?.id ?? undefined,
      inspectionDate: record.inspectionDate ? new Date(record.inspectionDate) : new Date(),
      location: record.location ?? record.siteSnapshot?.location ?? '',
      frequency: record.frequency ?? 'Weekly',
      scaffoldTypes: record.scaffoldTypes ?? [],
      checkpoints: mappedCheckpoints,
      remarks: record.remarks ?? '',
      inspectedBy: record.inspectedBy ?? '',
      projectInCharge: record.projectInCharge ?? '',
      fitnessStatus: (record.fitnessStatus as 'Fit' | 'Unfit' | '') ?? '',
    });
    replace(mappedCheckpoints);
    setEditingId(record._id);
    setFormOpened(true);
  };

  const handleView = (record: ScaffoldInspectionChecklistRecord) => {
    setSelectedRecord(record);
    setViewOpened(true);
  };

  const handlePrint = useCallback((record?: ScaffoldInspectionChecklistRecord | null) => {
    const target = record || selectedRecord;
    if (!target) {
      showMessage('Select a record to print', 'info');
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

  const onSubmit = async (values: ScaffoldInspectionFormValues) => {
    if (!values.inspectionDate) {
      showMessage('Inspection date is required', 'error');
      return;
    }

    const payload: ScaffoldInspectionChecklistPayload = {
      siteId: values.siteId || undefined,
      inspectionDate: values.inspectionDate.toISOString(),
      location: values.location || undefined,
      frequency: values.frequency || undefined,
      scaffoldTypes: values.scaffoldTypes?.length ? values.scaffoldTypes : undefined,
      checkpoints: values.checkpoints.map((checkpoint, index) => ({
        key: CHECKPOINTS[index]?.key ?? checkpoint.key,
        status: checkpoint.status || undefined,
      })),
      remarks: values.remarks || undefined,
      inspectedBy: values.inspectedBy || undefined,
      projectInCharge: values.projectInCharge || undefined,
      fitnessStatus: values.fitnessStatus || undefined,
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await updateInspection(editingId, payload);
      } else {
        await createInspection(payload);
      }
      await fetchInspections();
      setFormOpened(false);
      setEditingId(null);
      reset(DEFAULT_VALUES);
      replace(DEFAULT_VALUES.checkpoints);
    } catch (error: any) {
      showMessage(error?.message ?? 'Unable to save scaffold inspection', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EhsPageLayout
      title="Scaffold Inspection Checklist"
      description="Daily inspection of scaffolds for tagging, bracing, access, and load conditions before use."
      actions={
        <Group>
          <Button
            variant="light"
            color="gray"
            leftSection={<IconRefresh size={16} />}
            onClick={() => fetchInspections()}
            loading={loading}
          >
            Refresh
          </Button>
          {canCreate ? (
            <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
              Log Scaffold Inspection
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
          You do not have permission to view scaffold inspections.
        </Alert>
      ) : (
        <Stack gap="lg">
          <Card withBorder radius="md" padding="lg" shadow="sm">
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <Text size="sm" c="dimmed">
                  Inspections recorded: {records.length}
                </Text>
              </Group>
              <ScrollArea>
                <Table highlightOnHover striped withColumnBorders>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Site</th>
                      <th>Location</th>
                      <th>Frequency</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length ? (
                      records.map((record) => (
                        <tr key={record._id}>
                          <td>{formatDate(record.inspectionDate)}</td>
                          <td>{record.siteSnapshot?.name || '—'}</td>
                          <td>{record.location || record.siteSnapshot?.location || '—'}</td>
                          <td>{record.frequency || '—'}</td>
                          <td>
                            <Badge color={record.fitnessStatus === 'Fit' ? 'green' : record.fitnessStatus === 'Unfit' ? 'red' : 'gray'}>
                              {record.fitnessStatus || '—'}
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
                        <td colSpan={6}>
                          <Text size="sm" c="dimmed" ta="center">
                            No scaffold inspections logged.
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
                <Text fw={600}>Inspection Preview</Text>
                <Group gap="sm">
                  <Button variant="light" color="gray" leftSection={<IconPrinter size={16} />} onClick={() => handlePrint(selectedRecord)}>
                    Print
                  </Button>
                  <Button variant="default" onClick={() => setSelectedRecord(null)}>
                    Close
                  </Button>
                </Group>
              </Group>
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Text size="sm" c="dimmed">
                    Date
                  </Text>
                  <Text fw={600}>{formatDate(selectedRecord.inspectionDate)}</Text>
                </Card>
                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Text size="sm" c="dimmed">
                    Site
                  </Text>
                  <Text fw={600}>{selectedRecord.siteSnapshot?.name || '—'}</Text>
                </Card>
                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Text size="sm" c="dimmed">
                    Location
                  </Text>
                  <Text fw={600}>{selectedRecord.location || selectedRecord.siteSnapshot?.location || '—'}</Text>
                </Card>
                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Text size="sm" c="dimmed">
                    Frequency
                  </Text>
                  <Text fw={600}>{selectedRecord.frequency || '—'}</Text>
                </Card>
              </SimpleGrid>
              <Box mb="md">
                <Text size="sm" c="dimmed" mb={4}>
                  Type of scaffolding
                </Text>
                <Group gap="xs">
                  {(selectedRecord.scaffoldTypes ?? []).length ? (
                    selectedRecord.scaffoldTypes.map((type) => (
                      <Badge key={type} variant="light" color="blue">
                        {type}
                      </Badge>
                    ))
                  ) : (
                    <Text size="sm" c="dimmed">
                      —
                    </Text>
                  )}
                </Group>
              </Box>
              <ScrollArea h={280}>
                <Table withColumnBorders striped>
                  <thead>
                    <tr>
                      <th>SN</th>
                      <th>Check Points</th>
                      <th>Yes</th>
                      <th>No</th>
                      <th>NA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CHECKPOINTS.map((checkpoint, index) => {
                      const status =
                        selectedRecord.checkpoints?.find((entry) => entry.key === checkpoint.key)?.status ?? '';
                      return (
                        <tr key={checkpoint.key}>
                          <td>{index + 1}</td>
                          <td>{checkpoint.label}</td>
                          <td>{status === 'YES' ? '✔' : '—'}</td>
                          <td>{status === 'NO' ? '✔' : '—'}</td>
                          <td>{status === 'NA' ? '✔' : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </ScrollArea>
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mt="md">
                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Text size="sm" c="dimmed">
                    Remarks
                  </Text>
                  <Text>{selectedRecord.remarks || '—'}</Text>
                </Card>
                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Text size="sm" c="dimmed">
                    Inspected by
                  </Text>
                  <Text fw={600}>{selectedRecord.inspectedBy || '—'}</Text>
                </Card>
              </SimpleGrid>
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mt="md">
                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Text size="sm" c="dimmed">
                    Project In Charge
                  </Text>
                  <Text fw={600}>{selectedRecord.projectInCharge || '—'}</Text>
                </Card>
                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Text size="sm" c="dimmed">
                    Fit / Unfit
                  </Text>
                  <Text fw={600}>{selectedRecord.fitnessStatus || '—'}</Text>
                </Card>
              </SimpleGrid>
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
        title={editingId ? 'Edit Scaffold Inspection' : 'Log Scaffold Inspection'}
        overlayProps={{ blur: 3 }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea offsetScrollbars h="70vh">
            <Stack gap="lg" py="xs">
              <Card withBorder radius="md" padding="lg" shadow="xs">
                <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing="md">
                  <Controller
                    control={control}
                    name="inspectionDate"
                    rules={{ required: 'Inspection date required' }}
                    render={({ field }) => (
                      <DateInput
                        label="Date"
                        value={field.value}
                        onChange={field.onChange}
                        valueFormat="DD MMM YYYY"
                        error={errors.inspectionDate?.message}
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
                  <TextInput label="Location" placeholder="Work location" {...register('location')} />
                  <Controller
                    control={control}
                    name="frequency"
                    render={({ field }) => (
                      <Select
                        label="Frequency"
                        data={FREQUENCIES}
                        value={field.value}
                        onChange={(value) => field.onChange(value ?? 'Weekly')}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="scaffoldTypes"
                    render={({ field }) => (
                      <MultiSelect
                        label="Type of scaffolding"
                        data={SCAFFOLD_TYPES}
                        value={field.value}
                        onChange={field.onChange}
                        searchable
                        placeholder="Select type"
                      />
                    )}
                  />
                  <TextInput label="Inspected by" placeholder="Inspector name" {...register('inspectedBy')} />
                  <TextInput
                    label="Project In Charge"
                    placeholder="Project manager"
                    {...register('projectInCharge')}
                  />
                  <Controller
                    control={control}
                    name="fitnessStatus"
                    render={({ field }) => (
                      <Radio.Group
                        label="Fit / Unfit"
                        value={field.value}
                        onChange={(value) => field.onChange((value as 'Fit' | 'Unfit' | '') || '')}
                      >
                        <Group gap="md" mt="xs">
                          <Radio value="Fit" label="Fit" />
                          <Radio value="Unfit" label="Unfit" />
                        </Group>
                      </Radio.Group>
                    )}
                  />
                  <Textarea label="Remarks" minRows={3} autosize {...register('remarks')} />
                </SimpleGrid>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <ScrollArea offsetScrollbars>
                  <Table withColumnBorders>
                    <thead>
                      <tr>
                        <th style={{ width: 60 }}>SN</th>
                        <th>Check Points</th>
                        <th style={{ width: 160 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((field, index) => (
                        <tr key={field.id}>
                          <td>{index + 1}</td>
                          <td>{CHECKPOINTS[index]?.label ?? field.key}</td>
                          <td>
                            <Controller
                              control={control}
                              name={`checkpoints.${index}.status`}
                              render={({ field: statusField }) => (
                                <Radio.Group
                                  value={statusField.value}
                                  onChange={(value) => statusField.onChange(value as ScaffoldInspectionStatus)}
                                >
                                  <Group gap="xs">
                                    {STATUS_OPTIONS.map((option) => (
                                      <Radio key={option.value} value={option.value} label={option.label} />
                                    ))}
                                  </Group>
                                </Radio.Group>
                              )}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </ScrollArea>
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
                  {editingId ? 'Update inspection' : 'Save inspection'}
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
        title="Scaffold Inspection Checklist"
        overlayProps={{ blur: 3 }}
      >
        {selectedRecord ? (
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Date
                </Text>
                <Text fw={600}>{formatDate(selectedRecord.inspectionDate)}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Site
                </Text>
                <Text fw={600}>{selectedRecord.siteSnapshot?.name || '—'}</Text>
              </Card>
            </SimpleGrid>
            <ScrollArea h={300}>
              <Table withColumnBorders striped>
                <thead>
                  <tr>
                    <th>SN</th>
                    <th>Check Points</th>
                    <th>Yes</th>
                    <th>No</th>
                    <th>NA</th>
                  </tr>
                </thead>
                <tbody>
                  {CHECKPOINTS.map((checkpoint, index) => {
                    const status =
                      selectedRecord.checkpoints?.find((entry) => entry.key === checkpoint.key)?.status ?? '';
                    return (
                      <tr key={checkpoint.key}>
                        <td>{index + 1}</td>
                        <td>{checkpoint.label}</td>
                        <td>{status === 'YES' ? '✔' : '—'}</td>
                        <td>{status === 'NO' ? '✔' : '—'}</td>
                        <td>{status === 'NA' ? '✔' : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </ScrollArea>
            <Card withBorder radius="md" padding="md" shadow="xs">
              <Text size="sm" c="dimmed">
                Remarks
              </Text>
              <Text>{selectedRecord.remarks || '—'}</Text>
            </Card>
          </Stack>
        ) : null}
      </Modal>
    </EhsPageLayout>
  );
};

export default ScaffoldInspectionChecklistPage;
