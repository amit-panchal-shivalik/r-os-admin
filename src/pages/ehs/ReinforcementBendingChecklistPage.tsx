import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import {
  ActionIcon,
  Alert,
  Button,
  Card,
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
import { IconAlertCircle, IconEye, IconPencil, IconPlus, IconPrinter, IconRefresh } from '@tabler/icons-react';
import EhsPageLayout from '@/components/ehs/EhsPageLayout';
import { usePermissions } from '@/hooks/usePermissions';
import { useSites } from '@/hooks/useSites';
import { useReinforcementBendingChecklists } from '@/hooks/useReinforcementBendingChecklists';
import { ReinforcementBendingChecklistPayload } from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

type WeekStatus = 'OK' | 'NOT OK' | 'NA';

const WEEK_STATUS_OPTIONS = [
  { value: 'OK', label: 'OK' },
  { value: 'NOT OK', label: 'Not OK' },
  { value: 'NA', label: 'N/A' },
];

const DEFAULT_ITEMS = [
  'Erected in a firm base concrete platform.',
  'Machine is grouted properly/ Base wheel stopper provided.',
  'Body Earthing is provided.',
  'D.B box connected with the machine is equipped with MCB and ELCB.',
  'Emergency switch is available in working condition (Front side and back side of the m/c).',
  'Power on & off switch with indicator light are available in working condition.',
  'Belt and other internal moving parts are covered/Guarded.',
  'No oil leakage.',
  'Both side hand guard is available.',
  'Limit switch (Both Side, below the job plate) are in working condition.',
  'Availability of standard limit switch pin. (Usage of nail & other material is N.G)',
  'Fire Extinguisher/Fire Bucket Provided At work location.',
  'Protection Roof Provided.',
];

type ChecklistItemForm = {
  description: string;
  week1: WeekStatus;
  week2: WeekStatus;
  week3: WeekStatus;
  week4: WeekStatus;
  week5: WeekStatus;
  remarks?: string;
};

type ReinforcementBendingFormValues = {
  projectName: string;
  contractorName: string;
  equipmentId: string;
  frequency: string;
  monthlyStartFrom: Date | null;
  monthlyStartTo: Date | null;
  siteId?: string;
  items: ChecklistItemForm[];
  checkedByOperatorName?: string;
  checkedByOperatorSignature?: string;
  checkedBySafetyOfficerName?: string;
  checkedBySafetyOfficerSignature?: string;
  projectInChargeName?: string;
  projectInChargeSignature?: string;
};

const defaultValues: ReinforcementBendingFormValues = {
  projectName: '',
  contractorName: '',
  equipmentId: '',
  frequency: 'Weekly',
  monthlyStartFrom: new Date(),
  monthlyStartTo: null,
  siteId: undefined,
  items: DEFAULT_ITEMS.map((description) => ({
    description,
    week1: 'NA',
    week2: 'NA',
    week3: 'NA',
    week4: 'NA',
    week5: 'NA',
    remarks: '',
  })),
  checkedByOperatorName: '',
  checkedByOperatorSignature: '',
  checkedBySafetyOfficerName: '',
  checkedBySafetyOfficerSignature: '',
  projectInChargeName: '',
  projectInChargeSignature: '',
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleDateString();
};

const formatWeekStatus = (status?: string | null) => {
  if (status === 'OK') return '✔';
  if (status === 'NOT OK') return '✖';
  if (status === 'NA') return 'NA';
  return '';
};

const ReinforcementBendingChecklistPage = () => {
  const { can, loading: permissionsLoading, roles } = usePermissions();
  const { sites, loading: sitesLoading } = useSites();
  const { records, loading, fetchChecklists, createChecklist, updateChecklist } = useReinforcementBendingChecklists({
    limit: 50,
  });

  const [modalOpened, setModalOpened] = useState(false);
  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = roles.includes('SuperAdmin');
  const canView = isSuperAdmin || can('ReinforcementBendingChecklist', 'view') || roles.length === 0;
  const canCreate = isSuperAdmin || can('ReinforcementBendingChecklist', 'add') || roles.length === 0;
  const canEdit = isSuperAdmin || can('ReinforcementBendingChecklist', 'edit');

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReinforcementBendingFormValues>({
    defaultValues,
  });

  const { fields, replace } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedSiteId = watch('siteId');

  useEffect(() => {
    if (!permissionsLoading && canView) {
      fetchChecklists().catch(() => undefined);
    }
  }, [permissionsLoading, canView, fetchChecklists]);

  const siteOptions = useMemo(
    () =>
      sites.map((site) => ({
        value: site._id,
        label: site.name,
        description: site.location ?? '',
      })),
    [sites]
  );

  useEffect(() => {
    if (!watchedSiteId) {
      return;
    }
    const selectedSite = sites.find((site) => site._id === watchedSiteId);
    if (selectedSite && !watch('projectName')) {
      setValue('projectName', selectedSite.name ?? '');
    }
  }, [watchedSiteId, sites, watch, setValue]);

  const openCreateModal = () => {
    if (!canCreate) {
      showMessage('You do not have permission to add bending machine checklists', 'error');
      return;
    }
    setEditingId(null);
    reset({ ...defaultValues });
    replace(defaultValues.items);
    setModalOpened(true);
  };

  const handleEdit = useCallback(
    (record: any) => {
      if (!canEdit) {
        showMessage('You do not have permission to edit bending checklists', 'error');
        return;
      }

      setEditingId(record._id);
      reset({
        projectName: record.projectName ?? '',
        contractorName: record.contractorName ?? '',
        equipmentId: record.equipmentId ?? '',
        frequency: record.frequency ?? 'Weekly',
        monthlyStartFrom: record.monthlyStartFrom ? new Date(record.monthlyStartFrom) : new Date(),
        monthlyStartTo: record.monthlyStartTo ? new Date(record.monthlyStartTo) : null,
        siteId: record.site?.id ?? undefined,
        items: DEFAULT_ITEMS.map((description, index) => {
          const item = record.items?.[index] ?? {};
          const weeks = item.weeks ?? item;
          return {
            description,
            week1: (weeks.week1 as WeekStatus) ?? 'NA',
            week2: (weeks.week2 as WeekStatus) ?? 'NA',
            week3: (weeks.week3 as WeekStatus) ?? 'NA',
            week4: (weeks.week4 as WeekStatus) ?? 'NA',
            week5: (weeks.week5 as WeekStatus) ?? 'NA',
            remarks: item.remarks ?? '',
          };
        }),
        checkedByOperatorName: record.checkedByOperator?.name ?? '',
        checkedByOperatorSignature: record.checkedByOperator?.signature ?? '',
        checkedBySafetyOfficerName: record.checkedBySafetyOfficer?.name ?? '',
        checkedBySafetyOfficerSignature: record.checkedBySafetyOfficer?.signature ?? '',
        projectInChargeName: record.projectInCharge?.name ?? '',
        projectInChargeSignature: record.projectInCharge?.signature ?? '',
      });
      replace(
        DEFAULT_ITEMS.map((description, index) => {
          const item = record.items?.[index] ?? {};
          const weeks = item.weeks ?? item;
          return {
            description,
            week1: (weeks.week1 as WeekStatus) ?? 'NA',
            week2: (weeks.week2 as WeekStatus) ?? 'NA',
            week3: (weeks.week3 as WeekStatus) ?? 'NA',
            week4: (weeks.week4 as WeekStatus) ?? 'NA',
            week5: (weeks.week5 as WeekStatus) ?? 'NA',
            remarks: item.remarks ?? '',
          };
        })
      );
      setModalOpened(true);
    },
    [canEdit, reset, replace]
  );

  const handleView = useCallback((record: any) => {
    setSelectedRecord(record);
    setViewModalOpened(true);
  }, []);

  const handlePrint = useCallback(
    (record?: any) => {
      const target = record || selectedRecord;
      if (!target) return;

      const buildWeeks = (item: any) => {
        const weeks = item?.weeks ?? item ?? {};
        return {
          week1: weeks.week1 ?? 'NA',
          week2: weeks.week2 ?? 'NA',
          week3: weeks.week3 ?? 'NA',
          week4: weeks.week4 ?? 'NA',
          week5: weeks.week5 ?? 'NA',
        };
      };

      const rowsHtml = DEFAULT_ITEMS.map((description, index) => {
        const item = target.items?.[index] ?? {};
        const weeks = buildWeeks(item);
        const remarks = item.remarks ?? '';
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${description}</td>
            <td>${formatWeekStatus(weeks.week1)}</td>
            <td>${formatWeekStatus(weeks.week2)}</td>
            <td>${formatWeekStatus(weeks.week3)}</td>
            <td>${formatWeekStatus(weeks.week4)}</td>
            <td>${formatWeekStatus(weeks.week5)}</td>
            <td>${remarks || ''}</td>
          </tr>
        `;
      }).join('');

      const html = `
        <html>
          <head>
            <title>Reinforcement Bending Machine Inspection Checklist</title>
            <style>
              * { box-sizing: border-box; }
              body { font-family: "Arial", sans-serif; background: #1f1f1f; color: #fff; margin: 0; padding: 32px; }
              .container { background: #2b2b2b; padding: 24px; border-radius: 8px; }
              .header-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
              .header-table td { border: 1px solid #555; padding: 8px; color: #fff; font-size: 12px; }
              .header-logo { font-size: 20px; font-weight: 700; text-transform: uppercase; text-align: center; letter-spacing: 2px; }
              .header-sub { font-size: 10px; font-weight: 500; letter-spacing: 1px; }
              .title-cell { text-align: center; font-size: 18px; font-weight: 700; }
              .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
              .meta-table td { border: 1px solid #555; padding: 8px; font-size: 11px; color: #fff; }
              table.checklist { width: 100%; border-collapse: collapse; }
              table.checklist th, table.checklist td { border: 1px solid #555; padding: 6px; font-size: 11px; color: #fff; text-align: left; }
              table.checklist th { background: #3a3a3a; text-transform: uppercase; letter-spacing: 0.5px; }
              table.checklist td:nth-child(n+3):nth-child(-n+7) { text-align: center; }
              .signatures { margin-top: 24px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; font-size: 11px; }
              .signature-block { border: 1px solid #555; padding: 12px; background: #262626; }
              .signature-title { font-weight: 600; margin-bottom: 8px; }
              @media print {
                body { background: #fff; color: #000; padding: 16px; }
                .container { background: #fff; color: #000; }
                .header-table td, .meta-table td, table.checklist th, table.checklist td, .signature-block { border-color: #000; color: #000; background: #fff; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <table class="header-table">
                <tr>
                  <td rowspan="3" style="width: 25%; text-align: center;">
                    <div class="header-logo">Shivalik</div>
                    <div class="header-sub">Building Landmarks Since 1998</div>
                  </td>
                  <td rowspan="3" class="title-cell">
                    Reinforcement Bending Machine<br/>Inspection Checklist
                  </td>
                  <td>Format No.: <strong>EHS-F-09</strong></td>
                </tr>
                <tr>
                  <td>Rev. No.: <strong>00</strong></td>
                </tr>
                <tr>
                  <td>&nbsp;</td>
                </tr>
              </table>
              <table class="meta-table">
                <tr>
                  <td style="width: 35%;">Name of Project:</td>
                  <td style="width: 30%;">${target.projectName || ''}</td>
                  <td style="width: 15%;">Monthly Start From:</td>
                  <td>${formatDate(target.monthlyStartFrom)}</td>
                </tr>
                <tr>
                  <td>Equipment ID No.:</td>
                  <td>${target.equipmentId || ''}</td>
                  <td>To:</td>
                  <td>${formatDate(target.monthlyStartTo)}</td>
                </tr>
                <tr>
                  <td>Name of Contractor:</td>
                  <td>${target.contractorName || ''}</td>
                  <td>Frequency:</td>
                  <td>${target.frequency || 'Weekly'}</td>
                </tr>
              </table>
              <table class="checklist">
                <thead>
                  <tr>
                    <th style="width: 40px;">Sr. No</th>
                    <th>Description</th>
                    <th style="width: 60px;">Week-1</th>
                    <th style="width: 60px;">Week-2</th>
                    <th style="width: 60px;">Week-3</th>
                    <th style="width: 60px;">Week-4</th>
                    <th style="width: 60px;">Week-5</th>
                    <th style="width: 160px;">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>
              <div class="signatures">
                <div class="signature-block">
                  <div class="signature-title">Checked by Machine Operator</div>
                  <div>Name: ${target.checkedByOperator?.name || '________________'}</div>
                  <div>Signature: ${target.checkedByOperator?.signature || '________________'}</div>
                </div>
                <div class="signature-block">
                  <div class="signature-title">Checked by Safety Officer</div>
                  <div>Name: ${target.checkedBySafetyOfficer?.name || '________________'}</div>
                  <div>Signature: ${target.checkedBySafetyOfficer?.signature || '________________'}</div>
                </div>
                <div class="signature-block">
                  <div class="signature-title">Project In Charge Sign</div>
                  <div>Name: ${target.projectInCharge?.name || '________________'}</div>
                  <div>Signature: ${target.projectInCharge?.signature || '________________'}</div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    },
    [selectedRecord]
  );

  const onSubmit = async (values: ReinforcementBendingFormValues) => {
    setSubmitting(true);
    try {
      const payload: ReinforcementBendingChecklistPayload = {
        projectName: values.projectName,
        contractorName: values.contractorName,
        equipmentId: values.equipmentId,
        frequency: values.frequency,
        monthlyStartFrom: values.monthlyStartFrom
          ? values.monthlyStartFrom.toISOString()
          : new Date().toISOString(),
        monthlyStartTo: values.monthlyStartTo ? values.monthlyStartTo.toISOString() : undefined,
        siteId: values.siteId,
        items: values.items.map((item) => ({
          description: item.description,
          weeks: {
            week1: item.week1,
            week2: item.week2,
            week3: item.week3,
            week4: item.week4,
            week5: item.week5,
          },
          remarks: item.remarks,
        })),
        checkedByOperator: values.checkedByOperatorName
          ? {
              name: values.checkedByOperatorName,
              signature: values.checkedByOperatorSignature,
            }
          : undefined,
        checkedBySafetyOfficer: values.checkedBySafetyOfficerName
          ? {
              name: values.checkedBySafetyOfficerName,
              signature: values.checkedBySafetyOfficerSignature,
            }
          : undefined,
        projectInCharge: values.projectInChargeName
          ? {
              name: values.projectInChargeName,
              signature: values.projectInChargeSignature,
            }
          : undefined,
      };

      if (editingId) {
        await updateChecklist(editingId, payload);
      } else {
        await createChecklist(payload);
      }

      setSubmitting(false);
      setModalOpened(false);
      setEditingId(null);
      reset({ ...defaultValues });
      replace(defaultValues.items);
    } catch (error: any) {
      setSubmitting(false);
      showMessage(error?.message ?? 'Unable to save reinforcement bending checklist', 'error');
    }
  };

  return (
    <EhsPageLayout
      title="Reinforcement Bending Machine Checklist"
      description="Capture weekly condition of bending machine guards, limit switches, emergency stops, and housekeeping."
      actions={
        canCreate ? (
          <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
            Record Bending Checklist
          </Button>
        ) : undefined
      }
    >
      {permissionsLoading ? (
        <Group justify="center" py="xl">
          <Loader size="sm" />
        </Group>
      ) : !canView ? (
        <Alert color="red" variant="light" icon={<IconAlertCircle size={16} />} title="Access restricted">
          You do not have permission to view reinforcement bending machine checklists.
        </Alert>
      ) : (
        <Stack gap="lg">
          <Card withBorder radius="md" padding="lg" shadow="sm">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Recorded checklists: {records.length}
              </Text>
              <Group gap="sm">
                <Button
                  variant="light"
                  color="gray"
                  leftSection={<IconPrinter size={16} />}
                  onClick={() => handlePrint()}
                  disabled={!records.length}
                >
                  Print Sheet
                </Button>
                <Button
                  variant="light"
                  color="gray"
                  leftSection={<IconRefresh size={16} />}
                  onClick={() => fetchChecklists()}
                  loading={loading}
                >
                  Refresh
                </Button>
              </Group>
            </Group>
          </Card>

          <Card withBorder radius="md" padding="lg" shadow="sm">
            <ScrollArea>
              <Table striped highlightOnHover withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Period Start</Table.Th>
                    <Table.Th>Equipment ID</Table.Th>
                    <Table.Th>Project</Table.Th>
                    <Table.Th>Contractor</Table.Th>
                    <Table.Th align="right">Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {loading ? (
                    <Table.Tr>
                      <Table.Td colSpan={5}>
                        <Group justify="center" py="md">
                          <Loader size="sm" />
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ) : records.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={5}>
                        <Text size="sm" c="dimmed" ta="center">
                          No reinforcement bending machine inspections recorded.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    records.map((record) => (
                      <Table.Tr key={record._id}>
                        <Table.Td>{formatDate(record.monthlyStartFrom)}</Table.Td>
                        <Table.Td>{record.equipmentId}</Table.Td>
                        <Table.Td>{record.projectName || '—'}</Table.Td>
                        <Table.Td>{record.contractorName || '—'}</Table.Td>
                        <Table.Td align="right">
                          <Group gap="xs" justify="flex-end">
                            <ActionIcon
                              variant="light"
                              color="gray"
                              aria-label="Print checklist"
                              onClick={() => handlePrint(record)}
                            >
                              <IconPrinter size={16} />
                            </ActionIcon>
                            <ActionIcon
                              variant="light"
                              color="blue"
                              aria-label="View checklist"
                              onClick={() => {
                                setSelectedRecord(record);
                                handleView(record);
                              }}
                            >
                              <IconEye size={16} />
                            </ActionIcon>
                            {canEdit ? (
                              <ActionIcon
                                variant="light"
                                color="orange"
                                aria-label="Edit checklist"
                                onClick={() => handleEdit(record)}
                              >
                                <IconPencil size={16} />
                              </ActionIcon>
                            ) : null}
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Card>
        </Stack>
      )}

      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          setEditingId(null);
        }}
        title={editingId ? 'Edit Reinforcement Bending Checklist' : 'Record Reinforcement Bending Checklist'}
        size="85%"
        centered
        overlayProps={{ blur: 3 }}
      >
        <ScrollArea h="70vh">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="xl" p="sm">
              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                <Controller
                  control={control}
                  name="projectName"
                  render={({ field }) => (
                    <TextInput {...field} label="Name of Project" placeholder="Project name" />
                  )}
                />
                <Controller
                  control={control}
                  name="equipmentId"
                  rules={{ required: 'Equipment ID is required' }}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      label="Equipment ID No."
                      placeholder="RBM-01"
                      error={errors.equipmentId?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="contractorName"
                  render={({ field }) => (
                    <TextInput {...field} label="Name of Contractor" placeholder="Contractor name" />
                  )}
                />
              </SimpleGrid>

              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                <Controller
                  control={control}
                  name="siteId"
                  render={({ field }) => (
                    <Select
                      label="Site"
                      placeholder={sitesLoading ? 'Loading sites...' : 'Select site'}
                      data={siteOptions}
                      searchable
                      clearable
                      value={field.value ?? null}
                      onChange={(value) => field.onChange(value ?? undefined)}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="frequency"
                  render={({ field }) => (
                    <TextInput {...field} label="Frequency" placeholder="Weekly" />
                  )}
                />
                <Controller
                  control={control}
                  name="monthlyStartFrom"
                  rules={{ required: 'Start date is required' }}
                  render={({ field }) => (
                    <DateInput
                      label="Monthly Start From"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.monthlyStartFrom ? 'Required' : undefined}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="monthlyStartTo"
                  render={({ field }) => (
                    <DateInput label="To" value={field.value} onChange={field.onChange} />
                  )}
                />
              </SimpleGrid>

              <Stack gap="sm">
                <Text fw={600}>Weekly Inspection Points</Text>
                <ScrollArea>
                  <Table highlightOnHover withTableBorder striped>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th style={{ width: 60 }}>Sr. No</Table.Th>
                        <Table.Th>Description</Table.Th>
                        <Table.Th style={{ width: 120 }}>Week-1</Table.Th>
                        <Table.Th style={{ width: 120 }}>Week-2</Table.Th>
                        <Table.Th style={{ width: 120 }}>Week-3</Table.Th>
                        <Table.Th style={{ width: 120 }}>Week-4</Table.Th>
                        <Table.Th style={{ width: 120 }}>Week-5</Table.Th>
                        <Table.Th style={{ width: 220 }}>Remarks</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {fields.map((fieldItem, index) => (
                        <Table.Tr key={fieldItem.id}>
                          <Table.Td>{index + 1}</Table.Td>
                          <Table.Td style={{ maxWidth: 320 }}>{fieldItem.description}</Table.Td>
                          {(['week1', 'week2', 'week3', 'week4', 'week5'] as const).map((weekKey) => (
                            <Table.Td key={weekKey}>
                              <Controller
                                control={control}
                                name={`items.${index}.${weekKey}`}
                                render={({ field }) => (
                                  <Select
                                    data={WEEK_STATUS_OPTIONS}
                                    {...field}
                                    value={field.value ?? 'NA'}
                                  />
                                )}
                              />
                            </Table.Td>
                          ))}
                          <Table.Td>
                            <Controller
                              control={control}
                              name={`items.${index}.remarks`}
                              render={({ field }) => (
                                <Textarea
                                  {...field}
                                  placeholder="Remarks"
                                  autosize
                                  minRows={1}
                                  maxRows={3}
                                />
                              )}
                            />
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              </Stack>

              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                <Controller
                  control={control}
                  name="checkedByOperatorName"
                  render={({ field }) => (
                    <TextInput {...field} label="Checked by Machine Operator (Name)" placeholder="Operator name" />
                  )}
                />
                <Controller
                  control={control}
                  name="checkedByOperatorSignature"
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      label="Machine Operator Signature / Initial"
                      placeholder="Signature or reference"
                    />
                  )}
                />
              </SimpleGrid>

              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                <Controller
                  control={control}
                  name="checkedBySafetyOfficerName"
                  render={({ field }) => (
                    <TextInput {...field} label="Checked by Safety Officer (Name)" placeholder="Safety officer name" />
                  )}
                />
                <Controller
                  control={control}
                  name="checkedBySafetyOfficerSignature"
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      label="Safety Officer Signature / Initial"
                      placeholder="Signature or reference"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="projectInChargeName"
                  render={({ field }) => (
                    <TextInput {...field} label="Project In Charge (Name)" placeholder="Project in charge" />
                  )}
                />
                <Controller
                  control={control}
                  name="projectInChargeSignature"
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      label="Project In Charge Signature / Initial"
                      placeholder="Signature or reference"
                    />
                  )}
                />
              </SimpleGrid>

              <Group justify="flex-end">
                <Button variant="light" color="gray" onClick={() => setModalOpened(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={submitting}>
                  {editingId ? 'Update Checklist' : 'Save Checklist'}
                </Button>
              </Group>
            </Stack>
          </form>
        </ScrollArea>
      </Modal>

      <Modal
        opened={viewModalOpened}
        onClose={() => setViewModalOpened(false)}
        title="Checklist Details"
        size="80%"
        centered
      >
        {selectedRecord ? (
          <Stack gap="lg">
            <Table withTableBorder>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Th>Name of Project</Table.Th>
                  <Table.Td>{selectedRecord.projectName || '—'}</Table.Td>
                  <Table.Th>Equipment ID</Table.Th>
                  <Table.Td>{selectedRecord.equipmentId}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>Contractor</Table.Th>
                  <Table.Td>{selectedRecord.contractorName || '—'}</Table.Td>
                  <Table.Th>Frequency</Table.Th>
                  <Table.Td>{selectedRecord.frequency || 'Weekly'}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>Monthly Start From</Table.Th>
                  <Table.Td>{formatDate(selectedRecord.monthlyStartFrom)}</Table.Td>
                  <Table.Th>To</Table.Th>
                  <Table.Td>{formatDate(selectedRecord.monthlyStartTo)}</Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>

            <ScrollArea h={360}>
              <Table striped highlightOnHover withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Sr. No</Table.Th>
                    <Table.Th>Description</Table.Th>
                    <Table.Th>Week-1</Table.Th>
                    <Table.Th>Week-2</Table.Th>
                    <Table.Th>Week-3</Table.Th>
                    <Table.Th>Week-4</Table.Th>
                    <Table.Th>Week-5</Table.Th>
                    <Table.Th>Remarks</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {DEFAULT_ITEMS.map((description, index) => {
                    const item = selectedRecord.items?.[index] ?? {};
                    const weeks = item.weeks ?? item ?? {};
                    return (
                      <Table.Tr key={description}>
                        <Table.Td>{index + 1}</Table.Td>
                        <Table.Td>{description}</Table.Td>
                        <Table.Td>{weeks.week1 || 'NA'}</Table.Td>
                        <Table.Td>{weeks.week2 || 'NA'}</Table.Td>
                        <Table.Td>{weeks.week3 || 'NA'}</Table.Td>
                        <Table.Td>{weeks.week4 || 'NA'}</Table.Td>
                        <Table.Td>{weeks.week5 || 'NA'}</Table.Td>
                        <Table.Td>{item.remarks || '—'}</Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
              <Stack gap={4}>
                <Text fw={600}>Checked by Machine Operator</Text>
                <Text size="sm">{selectedRecord.checkedByOperator?.name || '—'}</Text>
                <Text size="sm" c="dimmed">
                  {selectedRecord.checkedByOperator?.signature ? `Signature: ${selectedRecord.checkedByOperator.signature}` : 'Signature: —'}
                </Text>
              </Stack>
              <Stack gap={4}>
                <Text fw={600}>Checked by Safety Officer</Text>
                <Text size="sm">{selectedRecord.checkedBySafetyOfficer?.name || '—'}</Text>
                <Text size="sm" c="dimmed">
                  {selectedRecord.checkedBySafetyOfficer?.signature ? `Signature: ${selectedRecord.checkedBySafetyOfficer.signature}` : 'Signature: —'}
                </Text>
              </Stack>
              <Stack gap={4}>
                <Text fw={600}>Project In Charge</Text>
                <Text size="sm">{selectedRecord.projectInCharge?.name || '—'}</Text>
                <Text size="sm" c="dimmed">
                  {selectedRecord.projectInCharge?.signature ? `Signature: ${selectedRecord.projectInCharge.signature}` : 'Signature: —'}
                </Text>
              </Stack>
            </SimpleGrid>
          </Stack>
        ) : (
          <Group justify="center" py="lg">
            <Loader size="sm" />
          </Group>
        )}
      </Modal>
    </EhsPageLayout>
  );
};

export default ReinforcementBendingChecklistPage;
