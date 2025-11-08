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
import { IconAlertCircle, IconClipboardCheck, IconEye, IconPencil, IconPlus, IconPrinter, IconRefresh } from '@tabler/icons-react';
import dayjs from 'dayjs';
import EhsPageLayout from '@/components/ehs/EhsPageLayout';
import { usePermissions } from '@/hooks/usePermissions';
import { useSites } from '@/hooks/useSites';
import { useExcavatorChecklists } from '@/hooks/useExcavatorChecklists';
import { ExcavatorChecklistPayload } from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

const DEFAULT_ITEMS = [
  'Front & reverse horn',
  'Head & tail lamps (for working at night)',
  'Leakage of oil (in hydraulic & pneumatic systems)',
  'Loose bolts / connecting pins (bucket)',
  'Back view mirror',
  'Roller-crawler / tyre condition (check for damaged / missing idle rollers)',
  'Structure boom condition (damage, cut, crack)',
  'Diesel, oil and grease spillage.',
  'RC, Insurance, Licensed operator (heavy licence)',
  'Fire extinguisher in operator cabin',
];

type ChecklistItemForm = {
  description: string;
  status: 'OK' | 'NOT OK' | 'NA';
  needRepairs: boolean;
  remark?: string;
};

type ExcavatorChecklistFormValues = {
  equipmentId: string;
  siteId?: string;
  inspectionDate: Date | null;
  dueDate: Date | null;
  operatorName?: string;
  items: ChecklistItemForm[];
  siteEngineerName?: string;
  siteEngineerSignature?: string;
  safetyOfficerName?: string;
  safetyOfficerSignature?: string;
  projectInChargeSignature?: string;
};

const defaultValues: ExcavatorChecklistFormValues = {
  equipmentId: '',
  siteId: undefined,
  inspectionDate: new Date(),
  dueDate: new Date(),
  operatorName: '',
  items: DEFAULT_ITEMS.map((description) => ({ description, status: 'OK', needRepairs: false, remark: '' })),
  siteEngineerName: '',
  siteEngineerSignature: '',
  safetyOfficerName: '',
  safetyOfficerSignature: '',
  projectInChargeSignature: '',
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString();
};

const ExcavatorChecklistPage = () => {
  const { can, loading: permissionsLoading, roles } = usePermissions();
  const { sites, loading: sitesLoading } = useSites();
  const { records, loading, fetchChecklists, createChecklist, updateChecklist } = useExcavatorChecklists({ limit: 50 });
  const [modalOpened, setModalOpened] = useState(false);
  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = roles.includes('SuperAdmin');
  const canView = isSuperAdmin || can('ExcavatorChecklist', 'view') || roles.length === 0;
  const canCreate = isSuperAdmin || can('ExcavatorChecklist', 'add') || roles.length === 0;
  const canEdit = isSuperAdmin || can('ExcavatorChecklist', 'edit');

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExcavatorChecklistFormValues>({
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
    if (selectedSite) {
      setValue('operatorName', selectedSite.contactPerson ?? '');
    }
  }, [watchedSiteId, sites, setValue]);

  const openCreateModal = () => {
    if (!canCreate) {
      showMessage('You do not have permission to add checklists', 'error');
      return;
    }
    reset({ ...defaultValues });
    replace(defaultValues.items);
    setEditingId(null);
    setModalOpened(true);
  };

  const handleEdit = useCallback(
    (record: any) => {
      if (!canEdit) {
        showMessage('You do not have permission to edit checklists', 'error');
        return;
      }
      setEditingId(record._id);
      reset({
        equipmentId: record.equipmentId ?? '',
        siteId: record.site?.id ?? undefined,
        inspectionDate: record.inspectionDate ? new Date(record.inspectionDate) : new Date(),
        dueDate: record.dueDate ? new Date(record.dueDate) : new Date(),
        operatorName: record.operatorName ?? '',
        items:
          record.items && record.items.length
            ? record.items.map((item: any) => ({
                description: item.description,
                status: item.status ?? 'OK',
                needRepairs: !!item.needRepairs,
                remark: item.remark ?? '',
              }))
            : defaultValues.items,
        siteEngineerName: record.checkedBySiteEngineer?.name ?? '',
        siteEngineerSignature: record.checkedBySiteEngineer?.signature ?? '',
        safetyOfficerName: record.checkedBySafetyOfficer?.name ?? '',
        safetyOfficerSignature: record.checkedBySafetyOfficer?.signature ?? '',
        projectInChargeSignature: record.projectInChargeSignature ?? '',
      });
      replace(
        record.items && record.items.length
          ? record.items.map((item: any) => ({
              description: item.description,
              status: item.status ?? 'OK',
              needRepairs: !!item.needRepairs,
              remark: item.remark ?? '',
            }))
          : defaultValues.items
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
      const rows = DEFAULT_ITEMS.map((description, index) => {
        const item = target.items?.[index];
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${description}</td>
            <td style="text-align:center;">${item?.status ?? ''}</td>
            <td style="text-align:center;">${item?.needRepairs ? 'YES' : ''}</td>
            <td>${item?.remark ?? ''}</td>
          </tr>
        `;
      }).join('');

      const html = `
        <html>
          <head>
            <title>Check List for Excavator</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 24px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #000; padding: 6px; font-size: 12px; }
              th { background: #f2f2f2; text-align: left; }
              .header-table td { border: 1px solid #000; padding: 6px; font-size: 12px; }
              .header-table { margin-bottom: 12px; width: 100%; }
              .signatures { margin-top: 16px; display: flex; justify-content: space-between; font-size: 12px; }
              .signatures div { width: 32%; }
            </style>
          </head>
          <body>
            <table class="header-table">
              <tr>
                <td rowspan="2" style="width:25%; text-align:center; font-weight:bold;">Shivalik</td>
                <td rowspan="2" style="text-align:center; font-size:18px; font-weight:bold;">CHECK LIST FOR EXCAVATOR</td>
                <td style="width:25%;">Doc No: <strong>EHS-F-06</strong></td>
              </tr>
              <tr>
                <td>DUE DATE: ${formatDate(target.dueDate)}</td>
              </tr>
            </table>
            <table class="header-table">
              <tr>
                <td>Excavator No.</td>
                <td>${target.equipmentId || ''}</td>
                <td>Inspection Date</td>
                <td>${formatDate(target.inspectionDate)}</td>
                <td>Due Date</td>
                <td>${formatDate(target.dueDate)}</td>
              </tr>
            </table>
            <table>
              <thead>
                <tr>
                  <th>SL NO</th>
                  <th>DESCRIPTION</th>
                  <th style="width:90px; text-align:center;">STATUS</th>
                  <th style="width:120px; text-align:center;">NEED REPAIRS</th>
                  <th>REMARK</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
            <div class="signatures">
              <div>
                Checked by Site Contract Sup./Eng.: ${target.checkedBySiteEngineer?.name || '________________'}<br />
                Sign: __________________
              </div>
              <div>
                Checked by Safety Officer: ${target.checkedBySafetyOfficer?.name || '________________'}<br />
                Sign: __________________
              </div>
              <div>
                Project In Charge Sign: __________________
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

  const onSubmit = async (values: ExcavatorChecklistFormValues) => {
    setSubmitting(true);
    try {
      const payload: ExcavatorChecklistPayload = {
        equipmentId: values.equipmentId,
        siteId: values.siteId,
        inspectionDate: values.inspectionDate ? values.inspectionDate.toISOString() : new Date().toISOString(),
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
        items: values.items.map((item) => ({
          description: item.description,
          status: item.status,
          needRepairs: item.needRepairs,
          remark: item.remark,
        })),
        checkedBySiteEngineer: values.siteEngineerName
          ? { name: values.siteEngineerName, signature: values.siteEngineerSignature }
          : undefined,
        checkedBySafetyOfficer: values.safetyOfficerName
          ? { name: values.safetyOfficerName, signature: values.safetyOfficerSignature }
          : undefined,
        projectInChargeSignature: values.projectInChargeSignature,
      };

      if (editingId) {
        await updateChecklist(editingId, payload);
      } else {
        await createChecklist(payload);
      }

      await fetchChecklists();
      setModalOpened(false);
      setEditingId(null);
      reset({ ...defaultValues });
      replace(defaultValues.items);
    } catch (error: any) {
      showMessage(error?.message ?? 'Unable to save checklist', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EhsPageLayout
      title="Excavator Daily Checklist"
      description="Pre-operation inspection checklist covering mechanical, hydraulic, and safety controls."
      actions={
        canCreate ? (
          <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
            Submit Excavator Checklist
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
          You do not have permission to view excavator checklists.
        </Alert>
      ) : (
        <Stack gap="lg">
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            <Card withBorder radius="md" padding="lg" shadow="sm">
              <Group gap="sm">
                <IconClipboardCheck size={20} />
                <Stack gap={2}>
                  <Text size="sm" c="dimmed">
                    Checklists Logged (30d)
                  </Text>
                  <Text size="xl" fw={700}>{records.length}</Text>
                </Stack>
              </Group>
            </Card>
          </SimpleGrid>

          <Card withBorder radius="md" padding="lg" shadow="sm">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Last Updated: {dayjs().format('DD.MM.YYYY')}
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
                    <Table.Th>Inspection Date</Table.Th>
                    <Table.Th>Equipment</Table.Th>
                    <Table.Th>Site</Table.Th>
                    <Table.Th>Due Date</Table.Th>
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
                          No excavator inspection records available.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    records.map((record) => (
                      <Table.Tr key={record._id}>
                        <Table.Td>{formatDate(record.inspectionDate)}</Table.Td>
                        <Table.Td>{record.equipmentId}</Table.Td>
                        <Table.Td>{record.site?.name || '—'}</Table.Td>
                        <Table.Td>{formatDate(record.dueDate)}</Table.Td>
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
                              onClick={() => handleView(record)}
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
        title={editingId ? 'Edit Excavator Checklist' : 'Submit Excavator Checklist'}
        size="80%"
        centered
        overlayProps={{ blur: 3 }}
      >
        <ScrollArea h="70vh">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="xl" p="sm">
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                <Controller
                  control={control}
                  name="equipmentId"
                  rules={{ required: 'Equipment ID is required' }}
                  render={({ field }) => (
                    <TextInput {...field} label="Equipment ID" placeholder="Excavator number" error={errors.equipmentId?.message} />
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
                      searchable
                      clearable
                      nothingFoundMessage={sitesLoading ? 'Loading...' : 'No sites found'}
                      onChange={(value) => field.onChange(value ?? undefined)}
                    />
                  )}
                />
              </SimpleGrid>

              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                <Controller
                  control={control}
                  name="inspectionDate"
                  render={({ field }) => (
                    <DateInput label="Inspection Date" value={field.value} onChange={field.onChange} error={errors.inspectionDate ? 'Required' : undefined} />
                  )}
                />
                <Controller
                  control={control}
                  name="dueDate"
                  render={({ field }) => (
                    <DateInput label="Due Date" value={field.value} onChange={field.onChange} />
                  )}
                />
                <Controller
                  control={control}
                  name="operatorName"
                  render={({ field }) => <TextInput {...field} label="Operator Name" placeholder="Operator" />}
                />
              </SimpleGrid>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Stack gap="md">
                  <Text fw={600}>Inspection Checklist</Text>
                  <Stack gap="sm">
                    {fields.map((field, index) => (
                      <Card key={field.id} withBorder radius="md" padding="md" shadow="xs">
                        <Stack gap="sm">
                          <Text fw={600}>#{index + 1}</Text>
                          <TextInput
                            label="Description"
                            value={field.description}
                            onChange={(event) => setValue(`items.${index}.description`, event.currentTarget.value)}
                          />
                          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                            <Controller
                              control={control}
                              name={`items.${index}.status` as const}
                              render={({ field: statusField }) => (
                                <Select
                                  {...statusField}
                                  label="Status"
                                  data={[
                                    { label: 'OK', value: 'OK' },
                                    { label: 'NOT OK', value: 'NOT OK' },
                                    { label: 'NA', value: 'NA' },
                                  ]}
                                />
                              )}
                            />
                            <Controller
                              control={control}
                              name={`items.${index}.needRepairs` as const}
                              render={({ field: repairField }) => (
                                <Select
                                  {...repairField}
                                  label="Need Repairs"
                                  data={[
                                    { label: 'No', value: false as any },
                                    { label: 'Yes', value: true as any },
                                  ]}
                                  onChange={(value) => repairField.onChange(value === 'true' || value === true)}
                                  value={repairField.value ? 'true' : 'false'}
                                />
                              )}
                            />
                            <Controller
                              control={control}
                              name={`items.${index}.remark` as const}
                              render={({ field: remarkField }) => (
                                <TextInput {...remarkField} label="Remark" placeholder="Enter remark" />
                              )}
                            />
                          </SimpleGrid>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                </Stack>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Stack gap="md">
                  <Text fw={600}>Signatures</Text>
                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    <Controller
                      control={control}
                      name="siteEngineerName"
                      render={({ field }) => <TextInput {...field} label="Site Contractor Supervisor / Engineer" placeholder="Name" />}
                    />
                    <Controller
                      control={control}
                      name="siteEngineerSignature"
                      render={({ field }) => <TextInput {...field} label="Site Eng. Signature" placeholder="Signature URL / data" />}
                    />
                    <Controller
                      control={control}
                      name="safetyOfficerName"
                      render={({ field }) => <TextInput {...field} label="Safety Officer" placeholder="Name" />}
                    />
                    <Controller
                      control={control}
                      name="safetyOfficerSignature"
                      render={({ field }) => <TextInput {...field} label="Safety Officer Signature" placeholder="Signature URL / data" />}
                    />
                  </SimpleGrid>
                  <Controller
                    control={control}
                    name="projectInChargeSignature"
                    render={({ field }) => (
                      <TextInput {...field} label="Project In Charge Signature" placeholder="Signature URL / data" />
                    )}
                  />
                </Stack>
              </Card>

              <Group justify="space-between">
                <Button variant="default" onClick={() => setModalOpened(false)}>
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
        opened={viewModalOpened && !!selectedRecord}
        onClose={() => {
          setSelectedRecord(null);
          setViewModalOpened(false);
        }}
        title="Excavator Checklist"
        size="lg"
        centered
        keepMounted
      >
        {selectedRecord ? (
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Equipment ID
                </Text>
                <Text fw={600}>{selectedRecord.equipmentId}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Site
                </Text>
                <Text fw={600}>{selectedRecord.site?.name || '—'}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Inspection Date
                </Text>
                <Text fw={600}>{formatDate(selectedRecord.inspectionDate)}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Due Date
                </Text>
                <Text fw={600}>{formatDate(selectedRecord.dueDate)}</Text>
              </Card>
            </SimpleGrid>

            <Table withTableBorder striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Sl No</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Need Repairs</Table.Th>
                  <Table.Th>Remark</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {DEFAULT_ITEMS.map((description, index) => {
                  const item = selectedRecord.items?.[index];
                  return (
                    <Table.Tr key={description}>
                      <Table.Td>{index + 1}</Table.Td>
                      <Table.Td>{description}</Table.Td>
                      <Table.Td>{item?.status || '—'}</Table.Td>
                      <Table.Td>{item?.needRepairs ? 'YES' : 'NO'}</Table.Td>
                      <Table.Td>{item?.remark || '—'}</Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Stack>
        ) : null}
      </Modal>
    </EhsPageLayout>
  );
};

export default ExcavatorChecklistPage;
