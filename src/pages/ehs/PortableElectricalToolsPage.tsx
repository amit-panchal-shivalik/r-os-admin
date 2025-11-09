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
import {
  usePortableEquipmentInspections,
  PortableEquipmentInspectionRecord,
} from '@/hooks/usePortableEquipmentInspections';
import { PortableEquipmentInspectionPayload } from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';
import logo from '@/assets/ehs/Logo.jpeg';

const DEFAULT_CHECKPOINTS =
  'Check Point: (1) Machine should be in good and working condition. (2) Power cable must be used with industrial plug. (3) Handle should be provided for better control. (4) RPM of wheel should be more than RPM of motor. (5) Rotating parts must be covered by guard. (6) On/off switch should be properly insulated. (7) Wheel should be free from defect and rotating capacity should be marked.';

const STATUS_OPTIONS = [
  { value: 'OK', label: 'OK' },
  { value: 'Not OK', label: 'Not OK' },
  { value: 'NA', label: 'N/A' },
];

type InspectionRowFormValue = {
  equipmentType: string;
  idNumber: string;
  locationOfUse: string;
  physicalCondition: string;
  cableCondition: string;
  safeFitForUse: string;
  inspectionDate: Date | null;
  checkedBy: string;
  remarks: string;
};

type PortableEquipmentFormValues = {
  month: string;
  frequency: string;
  siteId?: string;
  checkpointsNote: string;
  projectInCharge: string;
  inspections: InspectionRowFormValue[];
};

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  value: String(index + 1).padStart(2, '0'),
  label: dayjs().month(index).format('MMMM'),
}));

const createInspectionRow = (): InspectionRowFormValue => ({
  equipmentType: '',
  idNumber: '',
  locationOfUse: '',
  physicalCondition: 'OK',
  cableCondition: 'OK',
  safeFitForUse: 'OK',
  inspectionDate: null,
  checkedBy: '',
  remarks: '',
});

const DEFAULT_VALUES: PortableEquipmentFormValues = {
  month: dayjs().format('MM'),
  frequency: '',
  siteId: undefined,
  checkpointsNote: DEFAULT_CHECKPOINTS,
  projectInCharge: '',
  inspections: Array.from({ length: 10 }).map(() => createInspectionRow()),
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dayjs(date).format('DD.MM.YYYY');
};

const formatMonthLabel = (value?: string) => {
  if (!value) return '—';
  const monthIndex = Number(value) - 1;
  if (Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return value;
  return `${dayjs().month(monthIndex).format('MMMM')} ${dayjs().format('YYYY')}`;
};

const buildPrintHtml = (record: PortableEquipmentInspectionRecord) => {
  const monthLabel = formatMonthLabel(record.month);
  const siteName = record.site?.name ?? '';
  const siteLocation = record.site?.location ? `, ${record.site.location}` : '';
  const rows = (record.inspections || []).map((row, index) => `
      <tr>
        <td style="border:1px solid #000;padding:6px;text-align:center;">${index + 1}</td>
        <td style="border:1px solid #000;padding:6px;">${row.equipmentType ?? ''}</td>
        <td style="border:1px solid #000;padding:6px;">${row.idNumber ?? ''}</td>
        <td style="border:1px solid #000;padding:6px;">${row.locationOfUse ?? ''}</td>
        <td style="border:1px solid #000;padding:6px;text-align:center;">${row.physicalCondition ?? ''}</td>
        <td style="border:1px solid #000;padding:6px;text-align:center;">${row.cableCondition ?? ''}</td>
        <td style="border:1px solid #000;padding:6px;text-align:center;">${row.safeFitForUse ?? ''}</td>
        <td style="border:1px solid #000;padding:6px;text-align:center;">${formatDate(row.inspectionDate)}</td>
        <td style="border:1px solid #000;padding:6px;">${row.checkedBy ?? ''}</td>
        <td style="border:1px solid #000;padding:6px;">${row.remarks ?? ''}</td>
      </tr>
    `).join('');

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Portable Electrical Equipment Inspection</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; color: #000; }
          .container { padding: 24px; }
          .sheet { border: 2px solid #004c97; padding: 20px; }
          .header { display: grid; grid-template-columns: 2fr 3fr 1.2fr; align-items: stretch; gap: 12px; margin-bottom: 18px; }
          .logo { border: 1px solid #000; display: flex; align-items: center; justify-content: center; padding: 12px; background: #fff; }
          .title { border: 1px solid #000; background: #f4f4f4; display: flex; align-items: center; justify-content: center; text-transform: uppercase; font-weight: 700; font-size: 20px; text-align: center; padding: 12px; }
          .meta { border: 1px solid #000; padding: 12px; background: #f4f4f4; font-size: 12px; line-height: 1.5; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #000; padding: 6px; }
          th { background: #f4f4f4; text-transform: uppercase; }
          .section { margin-bottom: 12px; }
          .checkpoint { border: 1px solid #000; padding: 8px; font-size: 12px; background: #fdfdfd; }
          .signature { margin-top: 18px; display: flex; justify-content: flex-end; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="sheet">
            <div class="header">
              <div class="logo"><img src="${logo}" alt="Shivalik" style="max-width:150px;max-height:60px;object-fit:contain;"/></div>
              <div class="title">List of portable electrical equipments and power tools inspection</div>
              <div class="meta">
                <div>Format No.: EHS-F-15</div>
                <div>Revision No.: 00</div>
              </div>
            </div>

            <div class="section">
              <table>
                <tbody>
                  <tr>
                    <td style="width:20%; font-weight:600;">Month:</td>
                    <td>${monthLabel}</td>
                    <td style="width:20%; font-weight:600;">Frequency:</td>
                    <td>${record.frequency ?? ''}</td>
                  </tr>
                  <tr>
                    <td style="font-weight:600;">Site:</td>
                    <td colspan="3">${siteName}${siteLocation}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="section checkpoint">${record.checkpointsNote ?? DEFAULT_CHECKPOINTS}</div>

            <div class="section">
              <table>
                <thead>
                  <tr>
                    <th style="width:40px;">Sr. No.</th>
                    <th>Type of equipment / power tool</th>
                    <th>ID No.</th>
                    <th>Location of use</th>
                    <th>Physical condition</th>
                    <th>Cable condition</th>
                    <th>Safe and fit for use</th>
                    <th>Inspection date</th>
                    <th>Checked by</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows || `<tr><td colspan="10" style="text-align:center;padding:12px;">No inspection records</td></tr>`}
                </tbody>
              </table>
            </div>

            <div class="signature">Project In Charge Sign: _________________________</div>
          </div>
        </div>
      </body>
    </html>
  `;

  return html;
};

const PortableElectricalToolsPage = () => {
  const { can, loading: permissionsLoading, roles } = usePermissions();
  const { sites, loading: sitesLoading } = useSites();
  const { records, loading, fetchInspections, createInspection, updateInspection } =
    usePortableEquipmentInspections({ limit: 50 });

  const [formOpened, setFormOpened] = useState(false);
  const [viewOpened, setViewOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PortableEquipmentInspectionRecord | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = roles.includes('SuperAdmin');
  const canView = isSuperAdmin || can('PortableEquipmentInspection', 'view') || roles.length === 0;
  const canCreate = isSuperAdmin || can('PortableEquipmentInspection', 'add') || roles.length === 0;
  const canEdit = isSuperAdmin || can('PortableEquipmentInspection', 'edit');

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PortableEquipmentFormValues>({ defaultValues: DEFAULT_VALUES });

  const { fields, append, remove, replace } = useFieldArray({ control, name: 'inspections' });
  const watchedSiteId = watch('siteId');

  useEffect(() => {
    if (!permissionsLoading && canView) {
      fetchInspections().catch(() => undefined);
    }
  }, [permissionsLoading, canView, fetchInspections]);

  useEffect(() => {
    if (!watchedSiteId) return;
    const site = sites.find((item) => item._id === watchedSiteId);
    if (site && !watch('frequency')) {
      setValue('frequency', 'Monthly', { shouldDirty: false });
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
      showMessage('You do not have permission to add inspections', 'error');
      return;
    }
    reset(DEFAULT_VALUES);
    replace(DEFAULT_VALUES.inspections);
    setEditingId(null);
    setFormOpened(true);
  };

  const handleEdit = (record: PortableEquipmentInspectionRecord) => {
    if (!canEdit) {
      showMessage('You do not have permission to edit inspections', 'error');
      return;
    }
    setEditingId(record._id);
    setFormOpened(true);
    reset({
      month: record.month ?? dayjs().format('MM'),
      frequency: record.frequency ?? '',
      siteId: record.site?.id ?? undefined,
      checkpointsNote: record.checkpointsNote ?? DEFAULT_CHECKPOINTS,
      projectInCharge: record.projectInCharge ?? '',
      inspections: (record.inspections && record.inspections.length
        ? record.inspections
        : DEFAULT_VALUES.inspections
      ).map((entry) => ({
        equipmentType: entry?.equipmentType ?? '',
        idNumber: entry?.idNumber ?? '',
        locationOfUse: entry?.locationOfUse ?? '',
        physicalCondition: entry?.physicalCondition ?? 'OK',
        cableCondition: entry?.cableCondition ?? 'OK',
        safeFitForUse: entry?.safeFitForUse ?? 'OK',
        inspectionDate: entry?.inspectionDate ? new Date(entry.inspectionDate) : null,
        checkedBy: entry?.checkedBy ?? '',
        remarks: entry?.remarks ?? '',
      })),
    });
    replace(
      (record.inspections && record.inspections.length
        ? record.inspections
        : DEFAULT_VALUES.inspections
      ).map((entry) => ({
        equipmentType: entry?.equipmentType ?? '',
        idNumber: entry?.idNumber ?? '',
        locationOfUse: entry?.locationOfUse ?? '',
        physicalCondition: entry?.physicalCondition ?? 'OK',
        cableCondition: entry?.cableCondition ?? 'OK',
        safeFitForUse: entry?.safeFitForUse ?? 'OK',
        inspectionDate: entry?.inspectionDate ? new Date(entry.inspectionDate) : null,
        checkedBy: entry?.checkedBy ?? '',
        remarks: entry?.remarks ?? '',
      }))
    );
  };

  const handleView = (record: PortableEquipmentInspectionRecord) => {
    setSelectedRecord(record);
    setViewOpened(true);
  };

  const handlePrint = useCallback((record?: PortableEquipmentInspectionRecord) => {
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

  const onSubmit = async (values: PortableEquipmentFormValues) => {
    const payload: PortableEquipmentInspectionPayload = {
      month: values.month,
      frequency: values.frequency || undefined,
      siteId: values.siteId,
      checkpointsNote: values.checkpointsNote,
      projectInCharge: values.projectInCharge || undefined,
      inspections: values.inspections.map((entry) => ({
        equipmentType: entry.equipmentType,
        idNumber: entry.idNumber || undefined,
        locationOfUse: entry.locationOfUse || undefined,
        physicalCondition: entry.physicalCondition || undefined,
        cableCondition: entry.cableCondition || undefined,
        safeFitForUse: entry.safeFitForUse || undefined,
        inspectionDate: entry.inspectionDate ? entry.inspectionDate.toISOString() : undefined,
        checkedBy: entry.checkedBy || undefined,
        remarks: entry.remarks || undefined,
      })),
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
      replace(DEFAULT_VALUES.inspections);
    } catch (error: any) {
      showMessage(error?.message ?? 'Unable to save inspection', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EhsPageLayout
      title="Portable Electrical Equipment Register"
      description="Log inspections for portable electrical equipment, track condition, and maintain compliance records."
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
              Log Equipment Inspection
            </Button>
          ) : null}
        </Group>
      }
    >
      {permissionsLoading ? (
        <Group justify="center" py="xl">
          <Text c="dimmed">Loading permissions...</Text>
        </Group>
      ) : !canView ? (
        <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />} title="Access restricted">
          You do not have permission to view portable equipment inspections.
        </Alert>
      ) : (
        <Stack gap="lg">
          <Card withBorder radius="md" padding="lg" shadow="sm">
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <div>
                  <Text size="sm" c="dimmed">
                    Total inspections recorded: {records.length}
                  </Text>
                  {sitesLoading ? (
                    <Text size="xs" c="dimmed">
                      Loading sites...
                    </Text>
                  ) : null}
                </div>
              </Group>
              <ScrollArea>
                <Table highlightOnHover striped withColumnBorders>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Site</th>
                      <th>Frequency</th>
                      <th>Entries</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length ? (
                      records.map((record) => (
                        <tr key={record._id}>
                          <td>{formatMonthLabel(record.month)}</td>
                          <td>{record.site?.name || '—'}</td>
                          <td>{record.frequency || '—'}</td>
                          <td>
                            <Badge color="green" variant="light">
                              {record.inspections?.length ?? 0}
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
                            No inspection records yet.
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
              <Group justify="space-between" mb="md">
                <Text fw={600}>Inspection summary</Text>
                <Group gap="sm">
                  <Button variant="light" color="gray" leftSection={<IconPrinter size={16} />} onClick={() => handlePrint(selectedRecord)}>
                    Print
                  </Button>
                  <Button variant="default" onClick={() => setSelectedRecord(null)}>
                    Close
                  </Button>
                </Group>
              </Group>
              <ScrollArea h={360}>
                <Table withColumnBorders striped>
                  <thead>
                    <tr>
                      <th>Sr</th>
                      <th>Equipment</th>
                      <th>ID No.</th>
                      <th>Location</th>
                      <th>Physical</th>
                      <th>Cable</th>
                      <th>Fit for use</th>
                      <th>Date</th>
                      <th>Checked by</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRecord.inspections?.length ? (
                      selectedRecord.inspections.map((row, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{row.equipmentType || '—'}</td>
                          <td>{row.idNumber || '—'}</td>
                          <td>{row.locationOfUse || '—'}</td>
                          <td>{row.physicalCondition || '—'}</td>
                          <td>{row.cableCondition || '—'}</td>
                          <td>{row.safeFitForUse || '—'}</td>
                          <td>{formatDate(row.inspectionDate)}</td>
                          <td>{row.checkedBy || '—'}</td>
                          <td>{row.remarks || '—'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={10}>
                          <Text size="sm" c="dimmed" ta="center">
                            No items logged.
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
        size="90%"
        radius="md"
        title={editingId ? 'Edit Equipment Inspection' : 'Log Equipment Inspection'}
        overlayProps={{ blur: 3 }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea offsetScrollbars h="70vh">
            <Stack gap="lg" py="xs">
              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Stack gap="md">
                  <Text fw={600}>Inspection details</Text>
                  <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
                    <Controller
                      control={control}
                      name="month"
                      rules={{ required: 'Month is required' }}
                      render={({ field }) => (
                        <Select
                          label="Month"
                          placeholder="Select month"
                          data={MONTH_OPTIONS}
                          value={field.value}
                          onChange={(value) => field.onChange(value ?? dayjs().format('MM'))}
                          error={errors.month?.message}
                        />
                      )}
                    />
                    <TextInput label="Frequency" placeholder="Inspection frequency" {...register('frequency')} />
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
                          nothingFoundMessage="No site found"
                        />
                      )}
                    />
                    <TextInput label="Project In Charge" placeholder="Name" {...register('projectInCharge')} />
                  </SimpleGrid>
                  <Textarea
                    label="Checkpoints"
                    minRows={3}
                    autosize
                    {...register('checkpointsNote')}
                  />
                </Stack>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Stack gap="md">
                  <Group justify="space-between" align="center">
                    <Text fw={600}>Equipment entries</Text>
                    <Button variant="subtle" leftSection={<IconPlus size={14} />} onClick={() => append(createInspectionRow())}>
                      Add row
                    </Button>
                  </Group>
                  <Stack gap="md">
                    {fields.map((field, index) => (
                      <Card key={field.id} withBorder radius="md" padding="md" shadow="xs">
                        <Group justify="space-between" mb="sm">
                          <Text fw={600}>Entry #{index + 1}</Text>
                          <ActionIcon variant="subtle" color="red" onClick={() => remove(index)} disabled={fields.length === 1}>
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
                          <TextInput
                            label="Type of equipment / power tool"
                            placeholder="e.g. Angle grinder"
                            {...register(`inspections.${index}.equipmentType` as const, { required: false })}
                          />
                          <TextInput
                            label="ID No."
                            placeholder="Tag number"
                            {...register(`inspections.${index}.idNumber` as const)}
                          />
                          <TextInput
                            label="Location of use"
                            placeholder="Area or building"
                            {...register(`inspections.${index}.locationOfUse` as const)}
                          />
                          <Controller
                            control={control}
                            name={`inspections.${index}.physicalCondition` as const}
                            render={({ field: fieldControl }) => (
                              <Select
                                label="Physical condition"
                                data={STATUS_OPTIONS}
                                value={fieldControl.value}
                                onChange={(value) => fieldControl.onChange(value ?? 'OK')}
                              />
                            )}
                          />
                          <Controller
                            control={control}
                            name={`inspections.${index}.cableCondition` as const}
                            render={({ field: fieldControl }) => (
                              <Select
                                label="Cable condition"
                                data={STATUS_OPTIONS}
                                value={fieldControl.value}
                                onChange={(value) => fieldControl.onChange(value ?? 'OK')}
                              />
                            )}
                          />
                          <Controller
                            control={control}
                            name={`inspections.${index}.safeFitForUse` as const}
                            render={({ field: fieldControl }) => (
                              <Select
                                label="Safe and fit for use"
                                data={STATUS_OPTIONS}
                                value={fieldControl.value}
                                onChange={(value) => fieldControl.onChange(value ?? 'OK')}
                              />
                            )}
                          />
                          <Controller
                            control={control}
                            name={`inspections.${index}.inspectionDate` as const}
                            render={({ field: fieldControl }) => (
                              <DateInput
                                label="Inspection date"
                                value={fieldControl.value}
                                onChange={fieldControl.onChange}
                                valueFormat="DD MMM YYYY"
                              />
                            )}
                          />
                          <TextInput
                            label="Checked by"
                            placeholder="Inspector"
                            {...register(`inspections.${index}.checkedBy` as const)}
                          />
                          <Textarea
                            label="Remarks"
                            minRows={2}
                            autosize
                            {...register(`inspections.${index}.remarks` as const)}
                          />
                        </SimpleGrid>
                      </Card>
                    ))}
                  </Stack>
                </Stack>
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
        title="Inspection details"
        overlayProps={{ blur: 3 }}
      >
        {selectedRecord ? (
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Month
                </Text>
                <Text fw={600}>{formatMonthLabel(selectedRecord.month)}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Site
                </Text>
                <Text fw={600}>{selectedRecord.site?.name || '—'}</Text>
                <Text size="xs" c="dimmed">
                  {selectedRecord.site?.location || ''}
                </Text>
              </Card>
            </SimpleGrid>
            <Card withBorder radius="md" padding="md" shadow="xs">
              <Text size="sm" c="dimmed">
                Checkpoints
              </Text>
              <Text>{selectedRecord.checkpointsNote || DEFAULT_CHECKPOINTS}</Text>
            </Card>
            <ScrollArea h={360}>
              <Table withColumnBorders striped>
                <thead>
                  <tr>
                    <th>Sr</th>
                    <th>Equipment</th>
                    <th>ID No.</th>
                    <th>Location</th>
                    <th>Physical</th>
                    <th>Cable</th>
                    <th>Fit for use</th>
                    <th>Date</th>
                    <th>Checked by</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRecord.inspections?.length ? (
                    selectedRecord.inspections.map((row, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{row.equipmentType || '—'}</td>
                        <td>{row.idNumber || '—'}</td>
                        <td>{row.locationOfUse || '—'}</td>
                        <td>{row.physicalCondition || '—'}</td>
                        <td>{row.cableCondition || '—'}</td>
                        <td>{row.safeFitForUse || '—'}</td>
                        <td>{formatDate(row.inspectionDate)}</td>
                        <td>{row.checkedBy || '—'}</td>
                        <td>{row.remarks || '—'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10}>
                        <Text size="sm" c="dimmed" ta="center">
                          No data available.
                        </Text>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </ScrollArea>
            <Group justify="flex-end" gap="sm">
              <Button variant="light" color="gray" leftSection={<IconPrinter size={16} />} onClick={() => handlePrint(selectedRecord)}>
                Print
              </Button>
              <Button variant="default" onClick={() => setViewOpened(false)}>
                Close
              </Button>
            </Group>
          </Stack>
        ) : null}
      </Modal>
    </EhsPageLayout>
  );
};

export default PortableElectricalToolsPage;
