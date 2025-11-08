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
import { useWeldingChecklists } from '@/hooks/useWeldingChecklists';
import { WeldingChecklistPayload } from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

const DEFAULT_ITEMS = [
  'Are authorized & trained personal permitted to operate welding machine?',
  'Inspection tag available on welding machine.',
  'Any Smoke/Noise/Fire hazards noticed',
  'Starting and shut down/ isolating switch available?',
  'Mechanical Guards provided',
  'Work area housekeeping done',
  'Electrode holder and earthing holder are Free from damage.',
  'Circuit Breaker/ ELCB checked.',
  'Are Electrode Holder cables connected to the welding machine with lugs at the joints',
  'No damage in the insulation of welding Cables',
  'Body Earthing provided?',
  'Accessories and Associated Equipment inspected before use?',
  'Is suitable Fire extinguisher available for immediate use?',
  "Appropriate PPE's Provided to engage workers.",
  'General condition of welding machine.',
];

type ChecklistItemForm = {
  description: string;
  status: 'OK' | 'NOT OK' | 'NA';
  comment?: string;
};

type WeldingChecklistFormValues = {
  projectName: string;
  contractorName: string;
  equipmentNumber: string;
  make: string;
  siteId?: string;
  inspectionDate: Date | null;
  dueDate: Date | null;
  checklistNumber: string;
  frequency: string;
  items: ChecklistItemForm[];
  accepted: boolean;
  comments?: string;
  inspectedBySafetyName?: string;
  inspectedBySafetySignature?: string;
  areaEngineerName?: string;
  areaEngineerSignature?: string;
  projectInChargeName?: string;
  projectInChargeSignature?: string;
};

const defaultValues: WeldingChecklistFormValues = {
  projectName: '',
  contractorName: '',
  equipmentNumber: '',
  make: '',
  siteId: undefined,
  inspectionDate: new Date(),
  dueDate: new Date(),
  checklistNumber: '',
  frequency: 'Weekly',
  items: DEFAULT_ITEMS.map((description) => ({ description, status: 'OK', comment: '' })),
  accepted: true,
  comments: '',
  inspectedBySafetyName: '',
  inspectedBySafetySignature: '',
  areaEngineerName: '',
  areaEngineerSignature: '',
  projectInChargeName: '',
  projectInChargeSignature: '',
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString();
};

const WeldingMachineChecklistPage = () => {
  const { can, loading: permissionsLoading, roles } = usePermissions();
  const { sites, loading: sitesLoading } = useSites();
  const { records, loading, fetchChecklists, createChecklist, updateChecklist } = useWeldingChecklists({ limit: 50 });
  const [modalOpened, setModalOpened] = useState(false);
  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = roles.includes('SuperAdmin');
  const canView = isSuperAdmin || can('WeldingChecklist', 'view') || roles.length === 0;
  const canCreate = isSuperAdmin || can('WeldingChecklist', 'add') || roles.length === 0;
  const canEdit = isSuperAdmin || can('WeldingChecklist', 'edit');

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WeldingChecklistFormValues>({
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
  }, [watchedSiteId, sites, setValue, watch]);

  const openCreateModal = () => {
    if (!canCreate) {
      showMessage('You do not have permission to add welding checklists', 'error');
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
        projectName: record.projectName ?? '',
        contractorName: record.contractorName ?? '',
        equipmentNumber: record.equipmentNumber ?? '',
        make: record.make ?? '',
        siteId: record.site?.id ?? undefined,
        inspectionDate: record.inspectionDate ? new Date(record.inspectionDate) : new Date(),
        dueDate: record.dueDate ? new Date(record.dueDate) : new Date(),
        checklistNumber: record.checklistNumber ?? '',
        frequency: record.frequency ?? 'Weekly',
        items: DEFAULT_ITEMS.map((description, index) => {
          const item = record.items?.[index];
          return {
            description,
            status: item?.status ?? 'OK',
            comment: item?.comment ?? '',
          } as ChecklistItemForm;
        }),
        accepted: record.accepted ?? true,
        comments: record.comments ?? '',
        inspectedBySafetyName: record.inspectedBySafety?.name ?? '',
        inspectedBySafetySignature: record.inspectedBySafety?.signature ?? '',
        areaEngineerName: record.areaEngineer?.name ?? '',
        areaEngineerSignature: record.areaEngineer?.signature ?? '',
        projectInChargeName: record.projectInCharge?.name ?? '',
        projectInChargeSignature: record.projectInCharge?.signature ?? '',
      });
      replace(
        DEFAULT_ITEMS.map((description, index) => {
          const item = record.items?.[index];
          return {
            description,
            status: item?.status ?? 'OK',
            comment: item?.comment ?? '',
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

      const rows = DEFAULT_ITEMS.map((description, index) => {
        const item = target.items?.[index];
        const status = item?.status || '';
        return `
          <tr>
            <td>${(index + 1).toString().padStart(2, '0')}</td>
            <td>${description}</td>
            <td style="text-align:center;">${status === 'OK' ? '✔' : ''}</td>
            <td style="text-align:center;">${status === 'NOT OK' ? '✔' : ''}</td>
            <td>${item?.comment || ''}</td>
          </tr>
        `;
      }).join('');

      const html = `
        <html>
          <head>
            <title>Inspection Checklist for Welding Machine</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 24px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #000; padding: 6px; font-size: 12px; vertical-align: top; }
              th { background: #f2f2f2; }
              .header-table td { border: 1px solid #000; padding: 6px; font-size: 12px; }
              .header-table { margin-bottom: 12px; width: 100%; }
              .meta { margin-bottom: 12px; font-size: 12px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px 16px; }
              .signatures { margin-top: 16px; font-size: 12px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
              .comments { margin-top: 12px; font-size: 12px; }
            </style>
          </head>
          <body>
            <table class="header-table">
              <tr>
                <td rowspan="2" style="width:25%; text-align:center; font-weight:bold;">Shivalik</td>
                <td rowspan="2" style="text-align:center; font-size:18px; font-weight:bold;">Inspection Checklist for Welding Machine</td>
                <td>Format No.: <strong>EHS-F-07</strong></td>
              </tr>
              <tr>
                <td>Rev. No.: <strong>00</strong></td>
              </tr>
            </table>
            <div class="meta">
              <div><strong>Name of the Project:</strong> ${target.projectName || ''}</div>
              <div><strong>Date:</strong> ${formatDate(target.inspectionDate)}</div>
              <div><strong>Name of the contractor:</strong> ${target.contractorName || ''}</div>
              <div><strong>Checklist No:</strong> ${target.checklistNumber || ''}</div>
              <div><strong>Equipment No:</strong> ${target.equipmentNumber || ''}</div>
              <div><strong>Frequency:</strong> ${target.frequency || ''}</div>
              <div><strong>Make:</strong> ${target.make || ''}</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th style="width:60px;">Sr. No.</th>
                  <th>Safety Checks</th>
                  <th style="width:60px;">OK</th>
                  <th style="width:80px;">Not OK</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
            <div class="comments">
              <strong>Comments:</strong> ${target.comments || ''} &nbsp;&nbsp; <strong>Accepted:</strong> ${target.accepted ? 'YES' : 'NO'} &nbsp;&nbsp; <strong>Rejected:</strong> ${!target.accepted ? 'YES' : 'NO'}
            </div>
            <div class="signatures">
              <div>
                <div><strong>Inspected by Safety Person:</strong> ${target.inspectedBySafety?.name || '__________________'}</div>
                <div><strong>Date:</strong> ${formatDate(target.inspectedBySafety?.date)}</div>
              </div>
              <div>
                <div><strong>Area Engineer:</strong> ${target.areaEngineer?.name || '__________________'}</div>
                <div><strong>Date:</strong> ${formatDate(target.areaEngineer?.date)}</div>
              </div>
              <div>
                <div><strong>Project In Charge:</strong> ${target.projectInCharge?.name || '__________________'}</div>
                <div><strong>Date:</strong> ${formatDate(target.projectInCharge?.date)}</div>
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

  const onSubmit = async (values: WeldingChecklistFormValues) => {
    setSubmitting(true);
    try {
      const payload: WeldingChecklistPayload = {
        projectName: values.projectName,
        contractorName: values.contractorName,
        equipmentNumber: values.equipmentNumber,
        make: values.make,
        siteId: values.siteId,
        inspectionDate: values.inspectionDate ? values.inspectionDate.toISOString() : new Date().toISOString(),
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
        checklistNumber: values.checklistNumber,
        frequency: values.frequency,
        items: values.items.map((item) => ({
          description: item.description,
          status: item.status,
          comment: item.comment,
        })),
        accepted: values.accepted,
        comments: values.comments,
        inspectedBySafety: values.inspectedBySafetyName
          ? {
              name: values.inspectedBySafetyName,
              signature: values.inspectedBySafetySignature,
              date: values.inspectionDate ? values.inspectionDate.toISOString() : new Date().toISOString(),
            }
          : undefined,
        areaEngineer: values.areaEngineerName
          ? {
              name: values.areaEngineerName,
              signature: values.areaEngineerSignature,
              date: values.dueDate ? values.dueDate.toISOString() : undefined,
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

      await fetchChecklists();
      setModalOpened(false);
      setEditingId(null);
      reset({ ...defaultValues });
      replace(defaultValues.items);
    } catch (error: any) {
      showMessage(error?.message ?? 'Unable to save welding checklist', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EhsPageLayout
      title="Welding Machine Checklist"
      description="Verify welding machines for earthing, cables, shielding, and fire prevention before use."
      actions={
        canCreate ? (
          <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
            Submit Welding Checklist
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
          You do not have permission to view welding checklists.
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
                    <Table.Th>Inspection Date</Table.Th>
                    <Table.Th>Equipment No.</Table.Th>
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
                          No welding machine inspections recorded.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    records.map((record) => (
                      <Table.Tr key={record._id}>
                        <Table.Td>{formatDate(record.inspectionDate)}</Table.Td>
                        <Table.Td>{record.equipmentNumber}</Table.Td>
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
        title={editingId ? 'Edit Welding Checklist' : 'Submit Welding Checklist'}
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
                  name="projectName"
                  render={({ field }) => <TextInput {...field} label="Project Name" placeholder="Name of the project" />}
                />
                <Controller
                  control={control}
                  name="contractorName"
                  render={({ field }) => <TextInput {...field} label="Contractor Name" placeholder="Contractor" />}
                />
              </SimpleGrid>

              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                <Controller
                  control={control}
                  name="equipmentNumber"
                  rules={{ required: 'Equipment number is required' }}
                  render={({ field }) => (
                    <TextInput {...field} label="Equipment No." placeholder="WLD-01" error={errors.equipmentNumber?.message} />
                  )}
                />
                <Controller
                  control={control}
                  name="make"
                  render={({ field }) => <TextInput {...field} label="Make" placeholder="Manufacturer" />}
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
                      onChange={(value) => field.onChange(value ?? undefined)}
                    />
                  )}
                />
              </SimpleGrid>

              <SimpleGrid cols={{ base: 1, md: 4 }} spacing="md">
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
                  render={({ field }) => <DateInput label="Due Date" value={field.value} onChange={field.onChange} />}
                />
                <Controller
                  control={control}
                  name="checklistNumber"
                  render={({ field }) => <TextInput {...field} label="Checklist No." placeholder="E.g. WM-CHK-01" />}
                />
                <Controller
                  control={control}
                  name="frequency"
                  render={({ field }) => <TextInput {...field} label="Frequency" placeholder="Weekly" />}
                />
              </SimpleGrid>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Stack gap="md">
                  <Text fw={600}>Safety Checks</Text>
                  <Stack gap="sm">
                    {fields.map((field, index) => (
                      <Card key={field.id} withBorder radius="md" padding="md" shadow="xs">
                        <Stack gap="sm">
                          <Text fw={600}>#{(index + 1).toString().padStart(2, '0')}</Text>
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
                              name={`items.${index}.comment` as const}
                              render={({ field: commentField }) => (
                                <TextInput {...commentField} label="Comments" placeholder="Enter remarks" />
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
                  <Text fw={600}>Approvals</Text>
                  <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                    <Controller
                      control={control}
                      name="accepted"
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Checklist Status"
                          data={[
                            { label: 'Accepted', value: 'true' },
                            { label: 'Rejected', value: 'false' },
                          ]}
                          onChange={(value) => field.onChange(value === 'true')}
                          value={field.value ? 'true' : 'false'}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="comments"
                      render={({ field }) => <Textarea {...field} label="Overall Comments" minRows={2} />}
                    />
                  </SimpleGrid>
                  <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                    <Controller
                      control={control}
                      name="inspectedBySafetyName"
                      render={({ field }) => <TextInput {...field} label="Safety Person (Name)" />}
                    />
                    <Controller
                      control={control}
                      name="inspectedBySafetySignature"
                      render={({ field }) => <TextInput {...field} label="Safety Person Signature" placeholder="Signature URL / data" />}
                    />
                    <Controller
                      control={control}
                      name="areaEngineerName"
                      render={({ field }) => <TextInput {...field} label="Area Engineer" />}
                    />
                    <Controller
                      control={control}
                      name="areaEngineerSignature"
                      render={({ field }) => <TextInput {...field} label="Area Engineer Signature" placeholder="Signature URL / data" />}
                    />
                    <Controller
                      control={control}
                      name="projectInChargeName"
                      render={({ field }) => <TextInput {...field} label="Project In Charge" />}
                    />
                    <Controller
                      control={control}
                      name="projectInChargeSignature"
                      render={({ field }) => <TextInput {...field} label="Project In Charge Signature" placeholder="Signature URL / data" />}
                    />
                  </SimpleGrid>
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
        title="Welding Checklist"
        size="lg"
        centered
        keepMounted
      >
        {selectedRecord ? (
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Project Name
                </Text>
                <Text fw={600}>{selectedRecord.projectName || '—'}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Contractor Name
                </Text>
                <Text fw={600}>{selectedRecord.contractorName || '—'}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Equipment No.
                </Text>
                <Text fw={600}>{selectedRecord.equipmentNumber}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Make
                </Text>
                <Text fw={600}>{selectedRecord.make || '—'}</Text>
              </Card>
            </SimpleGrid>

            <Table withTableBorder striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Sl No</Table.Th>
                  <Table.Th>Safety Checks</Table.Th>
                  <Table.Th>OK</Table.Th>
                  <Table.Th>Not OK</Table.Th>
                  <Table.Th>Comments</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {DEFAULT_ITEMS.map((description, index) => {
                  const item = selectedRecord.items?.[index];
                  return (
                    <Table.Tr key={description}>
                      <Table.Td>{(index + 1).toString().padStart(2, '0')}</Table.Td>
                      <Table.Td>{description}</Table.Td>
                      <Table.Td>{item?.status === 'OK' ? '✔' : ''}</Table.Td>
                      <Table.Td>{item?.status === 'NOT OK' ? '✔' : ''}</Table.Td>
                      <Table.Td>{item?.comment || '—'}</Table.Td>
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

export default WeldingMachineChecklistPage;
