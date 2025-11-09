import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import {
  ActionIcon,
  Alert,
  Badge,
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
import dayjs from 'dayjs';
import EhsPageLayout from '@/components/ehs/EhsPageLayout';
import { usePermissions } from '@/hooks/usePermissions';
import { useSites } from '@/hooks/useSites';
import { useTruckInspections } from '@/hooks/useTruckInspections';
import { TruckInspectionPayload, TruckInspectionStatus } from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';
import logo from '@/assets/ehs/Logo.jpeg';

const STATUS_OPTIONS = [
  { label: 'OK', value: 'OK' as TruckInspectionStatus },
  { label: 'NOT OK', value: 'NOT_OK' as TruckInspectionStatus },
  { label: 'NA', value: 'NA' as TruckInspectionStatus },
];

const CHECKPOINTS = [
  'Available of RC Book',
  'Available/Validity of Insurance',
  "Driver\'s HMV License",
  'Vehicle Pass',
  'Main Horn',
  'Reverse Horn',
  'Brake Condition',
  'Brake Light',
  'Head Light',
  'Back Light',
  'Side Indicator',
  'Tyre Condition',
  'Rear view Mirror',
  'Number Plate Front',
  'Number Plate Rear',
  'Body Condition of Truck',
  'Condition of Front Glass',
  'Safety Helmet Use by the Driver',
  'Safety Shoes Use by the Driver',
];

type StatusForm = {
  value: TruckInspectionStatus;
  notes: string;
};

type CheckpointForm = {
  description: string;
  statuses: StatusForm[];
};

type TruckInspectionFormValues = {
  inspectionDate: Date | null;
  vehicleNumber: string;
  driverName: string;
  contractorName: string;
  subContractorName: string;
  siteId?: string;
  frequency: string;
  checkpoints: CheckpointForm[];
  remarks: string;
  driverNameSign?: string;
  driverSignature?: string;
  driverSignDate?: Date | null;
  safetyOfficerName?: string;
  safetyOfficerSignature?: string;
  safetyOfficerDate?: Date | null;
  projectInChargeName?: string;
  projectInChargeSignature?: string;
  projectInChargeDate?: Date | null;
};

const createDefaultStatuses = (): StatusForm[] =>
  Array.from({ length: 4 }).map(() => ({ value: 'OK' as TruckInspectionStatus, notes: '' }));

const defaultValues: TruckInspectionFormValues = {
  inspectionDate: new Date(),
  vehicleNumber: '',
  driverName: '',
  contractorName: '',
  subContractorName: '',
  siteId: undefined,
  frequency: 'Monthly',
  checkpoints: CHECKPOINTS.map((description) => ({ description, statuses: createDefaultStatuses() })),
  remarks: '',
  driverNameSign: '',
  driverSignature: '',
  driverSignDate: null,
  safetyOfficerName: '',
  safetyOfficerSignature: '',
  safetyOfficerDate: null,
  projectInChargeName: '',
  projectInChargeSignature: '',
  projectInChargeDate: null,
};

type TruckInspectionRecord = ReturnType<typeof useTruckInspections>['records'][number];

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dayjs(date).format('DD.MM.YYYY');
};

const TruckChecklistPage = () => {
  const { can, loading: permissionsLoading, roles } = usePermissions();
  const { sites, loading: sitesLoading } = useSites();
  const { records, loading, fetchInspections, createInspection, updateInspection } = useTruckInspections({ limit: 50 });

  const [modalOpened, setModalOpened] = useState(false);
  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TruckInspectionRecord | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = roles.includes('SuperAdmin');
  const canView = isSuperAdmin || can('TruckInspection', 'view') || roles.length === 0;
  const canCreate = isSuperAdmin || can('TruckInspection', 'add') || roles.length === 0;
  const canEdit = isSuperAdmin || can('TruckInspection', 'edit');

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TruckInspectionFormValues>({
    defaultValues,
  });

  const { fields, replace } = useFieldArray({ control, name: 'checkpoints' });

  const watchedSiteId = watch('siteId');

  useEffect(() => {
    if (!permissionsLoading && canView) {
      fetchInspections().catch(() => undefined);
    }
  }, [permissionsLoading, canView, fetchInspections]);

  useEffect(() => {
    if (!watchedSiteId) return;
    const selectedSite = sites.find((site) => site._id === watchedSiteId);
    if (selectedSite && !watch('contractorName')) {
      setValue('contractorName', selectedSite.name ?? '', { shouldDirty: false });
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
      showMessage('You do not have permission to log truck inspections', 'error');
      return;
    }
    reset({ ...defaultValues, checkpoints: CHECKPOINTS.map((description) => ({ description, statuses: createDefaultStatuses() })) });
    replace(CHECKPOINTS.map((description) => ({ description, statuses: createDefaultStatuses() })));
    setEditingId(null);
    setModalOpened(true);
  };

  const handleEdit = useCallback(
    (record: TruckInspectionRecord) => {
      if (!canEdit) {
        showMessage('You do not have permission to edit truck inspections', 'error');
        return;
      }
      setEditingId(record._id);
      reset({
        inspectionDate: record.inspectionDate ? new Date(record.inspectionDate) : new Date(),
        vehicleNumber: record.vehicleNumber ?? '',
        driverName: record.driverName ?? '',
        contractorName: record.contractorName ?? '',
        subContractorName: record.subContractorName ?? '',
        siteId: record.site?.id ?? undefined,
        frequency: record.frequency ?? 'Monthly',
        checkpoints: (record.checkpoints || CHECKPOINTS.map((description) => ({ description, statuses: createDefaultStatuses() }))).map(
          (item) => ({
            description: item.description,
            statuses: item.statuses?.length
              ? item.statuses.map((status) => ({ value: status.value as TruckInspectionStatus, notes: status.notes ?? '' }))
              : createDefaultStatuses(),
          })
        ),
        remarks: record.remarks ?? '',
        driverNameSign: record.driverSignature?.name ?? '',
        driverSignature: record.driverSignature?.signature ?? '',
        driverSignDate: record.driverSignature?.date ? new Date(record.driverSignature.date) : null,
        safetyOfficerName: record.safetyOfficerSignature?.name ?? '',
        safetyOfficerSignature: record.safetyOfficerSignature?.signature ?? '',
        safetyOfficerDate: record.safetyOfficerSignature?.date ? new Date(record.safetyOfficerSignature.date) : null,
        projectInChargeName: record.projectInChargeSignature?.name ?? '',
        projectInChargeSignature: record.projectInChargeSignature?.signature ?? '',
        projectInChargeDate: record.projectInChargeSignature?.date ? new Date(record.projectInChargeSignature.date) : null,
      });
      replace(
        (record.checkpoints || CHECKPOINTS.map((description) => ({ description, statuses: createDefaultStatuses() }))).map((item) => ({
          description: item.description,
          statuses: item.statuses?.length
            ? item.statuses.map((status) => ({ value: status.value as TruckInspectionStatus, notes: status.notes ?? '' }))
            : createDefaultStatuses(),
        }))
      );
      setModalOpened(true);
    },
    [canEdit, reset, replace]
  );

  const handleView = useCallback((record: TruckInspectionRecord) => {
    setSelectedRecord(record);
    setViewModalOpened(true);
  }, []);

  const handlePrint = useCallback(
    (record?: TruckInspectionRecord) => {
      const target = record || selectedRecord;
      if (!target) return;

      const detailRows = [
        { label: 'Date of Inspection', value: formatDate(target.inspectionDate) },
        { label: 'Vehicle No.', value: target.vehicleNumber || '' },
        { label: 'Name of Driver', value: target.driverName || '' },
        { label: 'Contractor Name', value: target.contractorName || '' },
        { label: 'Sub-Contractor Name', value: target.subContractorName || '' },
      ]
        .map(
          (item) => `
          <tr>
            <td>${item.label}</td>
            <td colspan="4">${item.value}</td>
          </tr>
        `
        )
        .join('');

      const checkpointRows = (target.checkpoints || CHECKPOINTS.map((description) => ({ description, statuses: createDefaultStatuses() })))
        .map((checkpoint) => `
          <tr>
            <td>${checkpoint.description}</td>
            ${checkpoint.statuses
              .map(
                (status) => `<td>${status?.value === 'NOT_OK' ? 'NOT OK' : status?.value || 'OK'}${status?.notes ? `<br/><small>${status.notes}</small>` : ''}</td>`
              )
              .join('')}
          </tr>
        `)
        .join('');

      const html = `
        <html>
          <head>
            <title>Truck Inspection</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 24px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #000; padding: 6px; font-size: 12px; }
              th { background: #f3f4f6; text-align: left; }
              .header { display: grid; grid-template-columns: 2fr 3fr 1fr; gap: 12px; align-items: center; margin-bottom: 16px; }
              .header-logo { display: flex; justify-content: center; align-items: center; border: 1px solid #000; padding: 12px; }
              .header-logo img { max-width: 140px; }
              .header-title { display: flex; justify-content: center; align-items: center; font-size: 24px; font-weight: bold; border: 1px solid #000; padding: 12px; }
              .header-meta { border: 1px solid #000; padding: 12px; font-size: 12px; }
              .section-title { background: #d1d5db; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="header-logo"><img src="${logo}" alt="Shivalik" /></div>
              <div class="header-title">Truck Inspection</div>
              <div class="header-meta">
                <div>Format No.: EHS-F-12</div>
                <div>Rev. No.: 00</div>
                <div>Frequency: ${target.frequency || 'Monthly'}</div>
              </div>
            </div>
            <table>
              <thead>
                <tr class="section-title">
                  <th>Description</th>
                  <th colspan="4">Details</th>
                </tr>
              </thead>
              <tbody>
                ${detailRows}
                <tr class="section-title">
                  <td>Check Points</td>
                  <td>OK / NOT OK / NA</td>
                  <td>OK / NOT OK / NA</td>
                  <td>OK / NOT OK / NA</td>
                  <td>OK / NOT OK / NA</td>
                </tr>
                ${checkpointRows}
                <tr>
                  <td>Remarks, if any</td>
                  <td colspan="4">${target.remarks || ''}</td>
                </tr>
                <tr>
                  <td>Signature of Driver</td>
                  <td colspan="4">${target.driverSignature?.name || ''}</td>
                </tr>
                <tr>
                  <td>Name and Sign of Safety Officer</td>
                  <td colspan="4">${target.safetyOfficerSignature?.name || ''}</td>
                </tr>
                <tr>
                  <td>Project In Charge Sign</td>
                  <td colspan="4">${target.projectInChargeSignature?.name || ''}</td>
                </tr>
              </tbody>
            </table>
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

  const onSubmit = async (values: TruckInspectionFormValues) => {
    setSubmitting(true);
    try {
      const payload: TruckInspectionPayload = {
        inspectionDate: (values.inspectionDate ?? new Date()).toISOString(),
        vehicleNumber: values.vehicleNumber,
        driverName: values.driverName,
        contractorName: values.contractorName,
        subContractorName: values.subContractorName,
        frequency: values.frequency,
        siteId: values.siteId,
        checkpoints: values.checkpoints.map((checkpoint) => ({
          description: checkpoint.description,
          statuses: checkpoint.statuses.map((status) => ({ value: status.value, notes: status.notes })),
        })),
        remarks: values.remarks,
        driverSignature: values.driverNameSign
          ? {
              name: values.driverNameSign,
              signature: values.driverSignature,
              date: values.driverSignDate ? values.driverSignDate.toISOString() : undefined,
            }
          : undefined,
        safetyOfficerSignature: values.safetyOfficerName
          ? {
              name: values.safetyOfficerName,
              signature: values.safetyOfficerSignature,
              date: values.safetyOfficerDate ? values.safetyOfficerDate.toISOString() : undefined,
            }
          : undefined,
        projectInChargeSignature: values.projectInChargeName
          ? {
              name: values.projectInChargeName,
              signature: values.projectInChargeSignature,
              date: values.projectInChargeDate ? values.projectInChargeDate.toISOString() : undefined,
            }
          : undefined,
      };

      if (editingId) {
        await updateInspection(editingId, payload);
      } else {
        await createInspection(payload);
      }

      await fetchInspections();
      setModalOpened(false);
      setEditingId(null);
      reset(defaultValues);
      replace(CHECKPOINTS.map((description) => ({ description, statuses: createDefaultStatuses() })));
    } catch (error: any) {
      showMessage(error?.message ?? 'Unable to save truck inspection', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EhsPageLayout
      title="Truck Inspection Checklist"
      description="Monthly inspection of contractor vehicles covering documentation, functional checks, and PPE compliance."
      actions={
        canCreate ? (
          <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
            Log Truck Inspection
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
          You do not have permission to view truck inspections.
        </Alert>
      ) : (
        <Stack gap="lg">
          <Card withBorder radius="md" padding="lg" shadow="sm">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Inspections logged: {records.length}
              </Text>
              <Group gap="sm">
                <Button
                  variant="light"
                  color="gray"
                  leftSection={<IconPrinter size={16} />}
                  onClick={() => handlePrint()}
                  disabled={!records.length}
                >
                  Print Latest
                </Button>
                <Button
                  variant="light"
                  color="gray"
                  leftSection={<IconRefresh size={16} />}
                  onClick={() => fetchInspections()}
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
                    <Table.Th>Date</Table.Th>
                    <Table.Th>Vehicle No.</Table.Th>
                    <Table.Th>Driver</Table.Th>
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
                          No truck inspection data recorded.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    records.map((record) => (
                      <Table.Tr key={record._id}>
                        <Table.Td>{formatDate(record.inspectionDate)}</Table.Td>
                        <Table.Td>{record.vehicleNumber}</Table.Td>
                        <Table.Td>{record.driverName || '—'}</Table.Td>
                        <Table.Td>{record.contractorName || '—'}</Table.Td>
                        <Table.Td align="right">
                          <Group gap="xs" justify="flex-end">
                            <ActionIcon variant="light" color="gray" onClick={() => handlePrint(record)}>
                              <IconPrinter size={16} />
                            </ActionIcon>
                            <ActionIcon variant="light" color="blue" onClick={() => handleView(record)}>
                              <IconEye size={16} />
                            </ActionIcon>
                            {canEdit ? (
                              <ActionIcon variant="light" color="orange" onClick={() => handleEdit(record)}>
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
        title={editingId ? 'Edit Truck Inspection' : 'Log Truck Inspection'}
        size="90%"
        centered
        overlayProps={{ blur: 3 }}
      >
        <ScrollArea h="70vh">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="xl" p="sm">
              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                <Controller
                  control={control}
                  name="inspectionDate"
                  rules={{ required: 'Inspection date is required' }}
                  render={({ field }) => (
                    <DateInput label="Date of Inspection" value={field.value} onChange={field.onChange} error={errors.inspectionDate ? 'Required' : undefined} />
                  )}
                />
                <Controller
                  control={control}
                  name="vehicleNumber"
                  rules={{ required: 'Vehicle number is required' }}
                  render={({ field }) => (
                    <TextInput {...field} label="Vehicle No." placeholder="Enter vehicle number" error={errors.vehicleNumber?.message} />
                  )}
                />
                <Controller
                  control={control}
                  name="driverName"
                  rules={{ required: 'Driver name is required' }}
                  render={({ field }) => (
                    <TextInput {...field} label="Name of Driver" placeholder="Driver" error={errors.driverName?.message} />
                  )}
                />
              </SimpleGrid>

              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                <Controller
                  control={control}
                  name="contractorName"
                  render={({ field }) => <TextInput {...field} label="Contractor Name" placeholder="Contractor" />}
                />
                <Controller
                  control={control}
                  name="subContractorName"
                  render={({ field }) => <TextInput {...field} label="Sub Contractor Name" placeholder="Sub contractor" />}
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
                      searchable
                      clearable
                      nothingFoundMessage={sitesLoading ? 'Loading...' : 'No sites found'}
                      onChange={(value) => field.onChange(value ?? undefined)}
                    />
                  )}
                />
              </SimpleGrid>

              <ScrollArea>
                <Table highlightOnHover withTableBorder>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: 240 }}>Check Points</Table.Th>
                      <Table.Th>OK / NOT OK / NA</Table.Th>
                      <Table.Th>OK / NOT OK / NA</Table.Th>
                      <Table.Th>OK / NOT OK / NA</Table.Th>
                      <Table.Th>OK / NOT OK / NA</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {fields.map((field, index) => (
                      <Table.Tr key={field.id}>
                        <Table.Td>{field.description}</Table.Td>
                        {field.statuses.map((status, statusIndex) => (
                          <Table.Td key={`${field.id}-${statusIndex}`}>
                            <Stack gap={4}>
                              <Controller
                                control={control}
                                name={`checkpoints.${index}.statuses.${statusIndex}.value` as const}
                                render={({ field: statusField }) => (
                                  <Select data={STATUS_OPTIONS} value={statusField.value} onChange={(value) => statusField.onChange(value as TruckInspectionStatus)} />
                                )}
                              />
                              <Controller
                                control={control}
                                name={`checkpoints.${index}.statuses.${statusIndex}.notes` as const}
                                render={({ field: noteField }) => (
                                  <Textarea {...noteField} placeholder="Notes" autosize minRows={1} />
                                )}
                              />
                            </Stack>
                          </Table.Td>
                        ))}
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>

              <Textarea label="Remarks" placeholder="Additional remarks" {...control.register('remarks')} minRows={2} />

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Stack gap="md">
                  <Text fw={600}>Signatures</Text>
                  <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                    <Controller
                      control={control}
                      name="driverNameSign"
                      render={({ field }) => <TextInput {...field} label="Driver Name" placeholder="Driver" />}
                    />
                    <Controller
                      control={control}
                      name="driverSignature"
                      render={({ field }) => <TextInput {...field} label="Driver Signature" placeholder="Signature" />}
                    />
                    <Controller
                      control={control}
                      name="driverSignDate"
                      render={({ field }) => <DateInput label="Driver Sign Date" value={field.value} onChange={field.onChange} clearable />}
                    />
                  </SimpleGrid>
                  <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                    <Controller
                      control={control}
                      name="safetyOfficerName"
                      render={({ field }) => <TextInput {...field} label="Safety Officer Name" placeholder="Safety officer" />}
                    />
                    <Controller
                      control={control}
                      name="safetyOfficerSignature"
                      render={({ field }) => <TextInput {...field} label="Safety Officer Signature" placeholder="Signature" />}
                    />
                    <Controller
                      control={control}
                      name="safetyOfficerDate"
                      render={({ field }) => <DateInput label="Safety Officer Date" value={field.value} onChange={field.onChange} clearable />}
                    />
                  </SimpleGrid>
                  <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                    <Controller
                      control={control}
                      name="projectInChargeName"
                      render={({ field }) => <TextInput {...field} label="Project In Charge Name" placeholder="Project in charge" />}
                    />
                    <Controller
                      control={control}
                      name="projectInChargeSignature"
                      render={({ field }) => <TextInput {...field} label="Project In Charge Signature" placeholder="Signature" />}
                    />
                    <Controller
                      control={control}
                      name="projectInChargeDate"
                      render={({ field }) => <DateInput label="Project In Charge Date" value={field.value} onChange={field.onChange} clearable />}
                    />
                  </SimpleGrid>
                </Stack>
              </Card>

              <Group justify="space-between">
                <Button variant="default" onClick={() => setModalOpened(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={submitting}>
                  {editingId ? 'Update Inspection' : 'Save Inspection'}
                </Button>
              </Group>
            </Stack>
          </form>
        </ScrollArea>
      </Modal>

      <Modal
        opened={viewModalOpened && !!selectedRecord}
        onClose={() => {
          setSelectedRecord(null);
          setViewModalOpened(false);
        }}
        title="Truck Inspection"
        size="90%"
        centered
        keepMounted
      >
        {selectedRecord ? (
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Date of Inspection
                </Text>
                <Text fw={600}>{formatDate(selectedRecord.inspectionDate)}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Vehicle No.
                </Text>
                <Text fw={600}>{selectedRecord.vehicleNumber}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Driver Name
                </Text>
                <Text fw={600}>{selectedRecord.driverName || '—'}</Text>
              </Card>
            </SimpleGrid>

            <ScrollArea h={320}>
              <Table withTableBorder striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Check Points</Table.Th>
                    <Table.Th>Result 1</Table.Th>
                    <Table.Th>Result 2</Table.Th>
                    <Table.Th>Result 3</Table.Th>
                    <Table.Th>Result 4</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {(selectedRecord.checkpoints || CHECKPOINTS.map((description) => ({ description, statuses: createDefaultStatuses() }))).map(
                    (checkpoint, index) => (
                      <Table.Tr key={index}>
                        <Table.Td>{checkpoint.description}</Table.Td>
                        {checkpoint.statuses?.map((status, statusIndex) => (
                          <Table.Td key={`${index}-${statusIndex}`}>
                            <Stack gap={4}>
                              <Badge color={status.value === 'NOT_OK' ? 'red' : status.value === 'NA' ? 'gray' : 'green'} variant="light">
                                {status.value === 'NOT_OK' ? 'NOT OK' : status.value}
                              </Badge>
                              {status.notes ? <Text size="xs">{status.notes}</Text> : null}
                            </Stack>
                          </Table.Td>
                        ))}
                      </Table.Tr>
                    )
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            <Card withBorder radius="md" padding="md" shadow="xs">
              <Text size="sm" c="dimmed">
                Remarks
              </Text>
              <Text fw={500}>{selectedRecord.remarks || '—'}</Text>
            </Card>
          </Stack>
        ) : null}
      </Modal>
    </EhsPageLayout>
  );
};

export default TruckChecklistPage;
