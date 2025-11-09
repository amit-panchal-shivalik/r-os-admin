import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Group,
  HoverCard,
  Image,
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
import { IconAlertCircle, IconEye, IconInfoCircle, IconPencil, IconPlus, IconPrinter, IconRefresh } from '@tabler/icons-react';
import dayjs from 'dayjs';
import EhsPageLayout from '@/components/ehs/EhsPageLayout';
import { usePermissions } from '@/hooks/usePermissions';
import { useSites } from '@/hooks/useSites';
import { useReinforcementCuttingChecklists } from '@/hooks/useReinforcementCuttingChecklists';
import { ReinforcementCuttingChecklistPayload } from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';
import reinforcementReferenceImg from '@/assets/ehs/reinforcement-checklist.png';

const DEFAULT_ITEMS = [
  'Steel cutting machine is properly placed on concrete platform.',
  'Reinforcement cutting chart provided on machine.',
  'All screw of machine is in place.',
  'Belt and other internal moving parts are cover/guarded.',
  'Proper body earthing is provided.',
  'Machine is free from oil & grease leakage.',
  'On & off switch is functioning.',
  'If machine is paddle operated foot guard is provided / Machine handle is in good condition.',
  'Hydraulic oil level indicator is visible.',
  'Power supply is taken through ELCB.',
  'Safety guard is in place.',
  'Fire extinguisher provided at work location.',
  'Power supply cable is in good condition.',
  'Area house keeping done.',
  'Protection shed provided.',
];

type WeekStatus = 'OK' | 'NOT OK' | 'NA' | '';

type ChecklistItemForm = {
  description: string;
  weeks: {
    week1: WeekStatus;
    week2: WeekStatus;
    week3: WeekStatus;
    week4: WeekStatus;
    week5: WeekStatus;
  };
  remarks?: string;
};

type SignatureForm = {
  name?: string;
  signature?: string;
  date?: Date | null;
};

type ReinforcementChecklistFormValues = {
  projectName?: string;
  equipmentId: string;
  contractorName?: string;
  frequency?: string;
  monthStart: Date | null;
  monthEnd: Date | null;
  siteId?: string;
  items: ChecklistItemForm[];
  machineOperator: SignatureForm;
  safetyOfficer: SignatureForm;
  projectInCharge: SignatureForm;
};

const defaultValues: ReinforcementChecklistFormValues = {
  projectName: '',
  equipmentId: '',
  contractorName: '',
  frequency: 'Weekly',
  monthStart: new Date(),
  monthEnd: new Date(),
  siteId: undefined,
  items: DEFAULT_ITEMS.map((description) => ({
    description,
    weeks: {
      week1: '',
      week2: '',
      week3: '',
      week4: '',
      week5: '',
    },
    remarks: '',
  })),
  machineOperator: { name: '', signature: '', date: null },
  safetyOfficer: { name: '', signature: '', date: null },
  projectInCharge: { name: '', signature: '', date: null },
};

const weekOptions = [
  { label: 'OK', value: 'OK' },
  { label: 'Not OK', value: 'NOT OK' },
  { label: 'N/A', value: 'NA' },
];

type ReinforcementRecord = ReturnType<typeof useReinforcementCuttingChecklists>['records'][number];

const ReinforcementCuttingChecklistPage = () => {
  const { can, loading: permissionsLoading, roles } = usePermissions();
  const { sites, loading: sitesLoading } = useSites();
  const { records, loading, fetchChecklists, createChecklist, updateChecklist } = useReinforcementCuttingChecklists({ limit: 50 });

  const [modalOpened, setModalOpened] = useState(false);
  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ReinforcementRecord | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = roles.includes('SuperAdmin');
  const canView = isSuperAdmin || can('ReinforcementCuttingChecklist', 'view') || roles.length === 0;
  const canCreate = isSuperAdmin || can('ReinforcementCuttingChecklist', 'add') || roles.length === 0;
  const canEdit = isSuperAdmin || can('ReinforcementCuttingChecklist', 'edit');

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReinforcementChecklistFormValues>({
    defaultValues,
  });

  const { fields, replace } = useFieldArray({ control, name: 'items' });

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
    if (!watchedSiteId) return;
    const selectedSite = sites.find((site) => site._id === watchedSiteId);
    if (selectedSite && !watch('projectName')) {
      setValue('projectName', selectedSite.name ?? '', { shouldDirty: false });
    }
  }, [watchedSiteId, sites, setValue, watch]);

  const renderReferenceHover = useCallback(
    (index: number) =>
      index < 11 ? (
        <HoverCard width={320} shadow="md" withArrow withinPortal>
          <HoverCard.Target>
            <ActionIcon variant="subtle" color="gray" aria-label={`Reference for checkpoint ${index + 1}`}>
              <IconInfoCircle size={16} />
            </ActionIcon>
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Stack gap="xs" align="center">
              <Text size="sm" fw={600}>
                Visual reference (points 1–11)
              </Text>
              <Image src={reinforcementReferenceImg} alt="Cutting machine checklist" width={280} fit="contain" />
              <Text size="xs" c="dimmed" ta="center">
                Use this to quickly spot weekly inspection points.
              </Text>
            </Stack>
          </HoverCard.Dropdown>
        </HoverCard>
      ) : null,
    []
  );

  const openCreateModal = () => {
    if (!canCreate) {
      showMessage('You do not have permission to add checklists', 'error');
      return;
    }
    reset({ ...defaultValues, monthStart: new Date(), monthEnd: new Date() });
    replace(defaultValues.items);
    setEditingId(null);
    setModalOpened(true);
  };

  const handleEdit = useCallback(
    (record: ReinforcementRecord) => {
      if (!canEdit) {
        showMessage('You do not have permission to edit checklists', 'error');
        return;
      }
      setEditingId(record._id);
      reset({
        projectName: record.projectName ?? '',
        equipmentId: record.equipmentId ?? '',
        contractorName: record.contractorName ?? '',
        frequency: record.frequency ?? 'Weekly',
        monthStart: record.monthStart ? new Date(record.monthStart) : new Date(),
        monthEnd: record.monthEnd ? new Date(record.monthEnd) : new Date(),
        siteId: record.site?.id ?? undefined,
        items:
          record.items?.length
            ? record.items.map((item) => ({
                description: item.description,
                weeks: {
                  week1: (item.weeks?.week1 as WeekStatus) || '',
                  week2: (item.weeks?.week2 as WeekStatus) || '',
                  week3: (item.weeks?.week3 as WeekStatus) || '',
                  week4: (item.weeks?.week4 as WeekStatus) || '',
                  week5: (item.weeks?.week5 as WeekStatus) || '',
                },
                remarks: item.remarks ?? '',
              }))
            : defaultValues.items,
        machineOperator: {
          name: record.checkedByMachineOperator?.name ?? '',
          signature: record.checkedByMachineOperator?.signature ?? '',
          date: record.checkedByMachineOperator?.date ? new Date(record.checkedByMachineOperator.date) : null,
        },
        safetyOfficer: {
          name: record.checkedBySafetyOfficer?.name ?? '',
          signature: record.checkedBySafetyOfficer?.signature ?? '',
          date: record.checkedBySafetyOfficer?.date ? new Date(record.checkedBySafetyOfficer.date) : null,
        },
        projectInCharge: {
          name: record.projectInCharge?.name ?? '',
          signature: record.projectInCharge?.signature ?? '',
          date: record.projectInCharge?.date ? new Date(record.projectInCharge.date) : null,
        },
      });
      replace(
        record.items?.length
          ? record.items.map((item) => ({
              description: item.description,
              weeks: {
                week1: (item.weeks?.week1 as WeekStatus) || '',
                week2: (item.weeks?.week2 as WeekStatus) || '',
                week3: (item.weeks?.week3 as WeekStatus) || '',
                week4: (item.weeks?.week4 as WeekStatus) || '',
                week5: (item.weeks?.week5 as WeekStatus) || '',
              },
              remarks: item.remarks ?? '',
            }))
          : defaultValues.items
      );
      setModalOpened(true);
    },
    [canEdit, reset, replace]
  );

  const handleView = useCallback((record: ReinforcementRecord) => {
    setSelectedRecord(record);
    setViewModalOpened(true);
  }, []);

  const closeModal = () => {
    setModalOpened(false);
    setEditingId(null);
  };

  const closeViewModal = () => {
    setSelectedRecord(null);
    setViewModalOpened(false);
  };

  const handlePrint = useCallback(
    (record?: ReinforcementRecord) => {
      const target = record || selectedRecord;
      if (!target) return;

      const rows = DEFAULT_ITEMS.map((description, index) => {
        const item = target.items?.[index];
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${description}</td>
            <td>${item?.weeks?.week1 ?? ''}</td>
            <td>${item?.weeks?.week2 ?? ''}</td>
            <td>${item?.weeks?.week3 ?? ''}</td>
            <td>${item?.weeks?.week4 ?? ''}</td>
            <td>${item?.weeks?.week5 ?? ''}</td>
            <td>${item?.remarks ?? ''}</td>
          </tr>
        `;
      }).join('');

      const html = `
        <html>
          <head>
            <title>Reinforcement Cutting Machine Checklist</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 24px; margin: 0; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #000; padding: 6px; font-size: 12px; }
              th { background: #1f2937; color: #fff; }
              .header-table td { border: 1px solid #000; padding: 6px; font-size: 12px; }
              .header-table { width: 100%; margin-bottom: 12px; }
              .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px 16px; font-size: 12px; margin-bottom: 12px; }
              .signatures { margin-top: 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; font-size: 12px; }
              .signatures div { border-top: 1px solid #000; padding-top: 6px; }
            </style>
          </head>
          <body>
            <table class="header-table">
              <tr>
                <td rowspan="2" style="width:25%; text-align:center; font-weight:bold; font-size:18px;">Shivalik</td>
                <td rowspan="2" style="text-align:center; font-size:20px; font-weight:bold;">Reinforcement Cutting Machine Checklist</td>
                <td>Format No.: <strong>EHS-F-08</strong></td>
              </tr>
              <tr>
                <td>Rev. No.: <strong>00</strong></td>
              </tr>
            </table>
            <div class="meta-grid">
              <div><strong>Name of Project:</strong> ${target.projectName || ''}</div>
              <div><strong>Month Start:</strong> ${target.monthStart ? dayjs(target.monthStart).format('DD.MM.YYYY') : ''}</div>
              <div><strong>Equipment ID No.:</strong> ${target.equipmentId || ''}</div>
              <div><strong>Month End:</strong> ${target.monthEnd ? dayjs(target.monthEnd).format('DD.MM.YYYY') : ''}</div>
              <div><strong>Name of Contractor:</strong> ${target.contractorName || ''}</div>
              <div><strong>Frequency:</strong> ${target.frequency || 'Weekly'}</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th style="width:50px;">SL NO</th>
                  <th>DESCRIPTION</th>
                  <th style="width:90px;">Week-1</th>
                  <th style="width:90px;">Week-2</th>
                  <th style="width:90px;">Week-3</th>
                  <th style="width:90px;">Week-4</th>
                  <th style="width:90px;">Week-5</th>
                  <th style="width:160px;">Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
            <div class="signatures">
              <div>
                <strong>Checked by Machine Operator:</strong><br/>
                ${target.checkedByMachineOperator?.name || ''}
              </div>
              <div>
                <strong>Checked by Safety Officer:</strong><br/>
                ${target.checkedBySafetyOfficer?.name || ''}
              </div>
              <div>
                <strong>Project In Charge Sign:</strong><br/>
                ${target.projectInCharge?.name || ''}
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

  const onSubmit = async (values: ReinforcementChecklistFormValues) => {
    setSubmitting(true);
    try {
      const payload: ReinforcementCuttingChecklistPayload = {
        projectName: values.projectName,
        equipmentId: values.equipmentId,
        contractorName: values.contractorName,
        frequency: values.frequency,
        monthStart: values.monthStart ? values.monthStart.toISOString() : undefined,
        monthEnd: values.monthEnd ? values.monthEnd.toISOString() : undefined,
        siteId: values.siteId,
        items: values.items.map((item) => ({
          description: item.description,
          weeks: {
            week1: item.weeks.week1,
            week2: item.weeks.week2,
            week3: item.weeks.week3,
            week4: item.weeks.week4,
            week5: item.weeks.week5,
          },
          remarks: item.remarks,
        })),
        checkedByMachineOperator: values.machineOperator.name
          ? {
              name: values.machineOperator.name,
              signature: values.machineOperator.signature,
              date: values.machineOperator.date ? values.machineOperator.date.toISOString() : undefined,
            }
          : undefined,
        checkedBySafetyOfficer: values.safetyOfficer.name
          ? {
              name: values.safetyOfficer.name,
              signature: values.safetyOfficer.signature,
              date: values.safetyOfficer.date ? values.safetyOfficer.date.toISOString() : undefined,
            }
          : undefined,
        projectInCharge: values.projectInCharge.name
          ? {
              name: values.projectInCharge.name,
              signature: values.projectInCharge.signature,
              date: values.projectInCharge.date ? values.projectInCharge.date.toISOString() : undefined,
            }
          : undefined,
      };

      if (editingId) {
        await updateChecklist(editingId, payload);
      } else {
        await createChecklist(payload);
      }

      await fetchChecklists();
      closeModal();
      reset(defaultValues);
      replace(defaultValues.items);
    } catch (error: any) {
      showMessage(error?.message ?? 'Unable to save checklist', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EhsPageLayout
      title="Reinforcement Cutting Machine Checklist"
      description="Weekly inspection of cutting machines covering guards, emergency stops, earthing, and housekeeping."
      actions={
        canCreate ? (
          <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
            Log Cutting Machine Check
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
          You do not have permission to view reinforcement cutting machine checklists.
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
                  Print Latest
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
                    <Table.Th>Month Start</Table.Th>
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
                          No reinforcement cutting machine checklists recorded yet.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    records.map((record) => (
                      <Table.Tr key={record._id}>
                        <Table.Td>{record.monthStart ? dayjs(record.monthStart).format('DD MMM YYYY') : '—'}</Table.Td>
                        <Table.Td>{record.equipmentId}</Table.Td>
                        <Table.Td>{record.projectName || '—'}</Table.Td>
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
        onClose={closeModal}
        title={editingId ? 'Edit Reinforcement Cutting Checklist' : 'Log Reinforcement Cutting Checklist'}
        size="85%"
        centered
        overlayProps={{ blur: 3 }}
      >
        <ScrollArea h="70vh">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="xl" p="sm">
              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Stack gap="xs" align="center">
                  <Text fw={600}>Weekly inspection reference</Text>
                  <Image src={reinforcementReferenceImg} alt="Reinforcement cutting machine" width={320} fit="contain" />
                  <Text size="xs" c="dimmed" ta="center">
                    Hover info icons beside checklist rows to revisit this layout while entering weekly statuses.
                  </Text>
                </Stack>
              </Card>

              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                <Controller
                  control={control}
                  name="projectName"
                  render={({ field }) => <TextInput {...field} label="Name of Project" placeholder="Project name" />}
                />
                <Controller
                  control={control}
                  name="equipmentId"
                  rules={{ required: 'Equipment ID is required' }}
                  render={({ field }) => (
                    <TextInput {...field} label="Equipment ID No." placeholder="RCM-01" error={errors.equipmentId?.message} />
                  )}
                />
                <Controller
                  control={control}
                  name="contractorName"
                  render={({ field }) => <TextInput {...field} label="Name of Contractor" placeholder="Contractor" />}
                />
              </SimpleGrid>

              <SimpleGrid cols={{ base: 1, md: 4 }} spacing="md">
                <Controller
                  control={control}
                  name="monthStart"
                  render={({ field }) => (
                    <DateInput label="Month Start" value={field.value} onChange={field.onChange} error={errors.monthStart ? 'Required' : undefined} />
                  )}
                />
                <Controller
                  control={control}
                  name="monthEnd"
                  render={({ field }) => (
                    <DateInput label="Month End" value={field.value} onChange={field.onChange} />
                  )}
                />
                <Controller
                  control={control}
                  name="frequency"
                  render={({ field }) => <TextInput {...field} label="Frequency" placeholder="Weekly" />}
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

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Stack gap="md">
                  <Text fw={600}>Weekly checklist</Text>
                  <Stack gap="md">
                    {fields.map((field, index) => (
                      <Card key={field.id} withBorder radius="md" padding="md" shadow="xs">
                        <Stack gap="sm">
                          <Group justify="space-between" align="flex-start">
                            <Text fw={600}>#{index + 1}</Text>
                            {renderReferenceHover(index)}
                          </Group>
                          <TextInput
                            label="Description"
                            value={field.description}
                            onChange={(event) => setValue(`items.${index}.description`, event.currentTarget.value)}
                          />
                          <SimpleGrid cols={{ base: 1, md: 5 }} spacing="md">
                            {(['week1', 'week2', 'week3', 'week4', 'week5'] as const).map((weekKey) => (
                              <Controller
                                key={weekKey}
                                control={control}
                                name={`items.${index}.weeks.${weekKey}` as const}
                                render={({ field: weekField }) => (
                                  <Select
                                    {...weekField}
                                    label={weekKey.replace('week', 'Week ')}
                                    data={weekOptions}
                                    placeholder="Select"
                                    allowDeselect
                                  />
                                )}
                              />
                            ))}
                          </SimpleGrid>
                          <Controller
                            control={control}
                            name={`items.${index}.remarks` as const}
                            render={({ field: remarkField }) => (
                              <Textarea {...remarkField} label="Remarks" placeholder="Enter remarks" minRows={2} />
                            )}
                          />
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                </Stack>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Stack gap="md">
                  <Text fw={600}>Sign-offs</Text>
                  <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                    <Controller
                      control={control}
                      name="machineOperator.name"
                      render={({ field }) => <TextInput {...field} label="Machine Operator" placeholder="Name" />}
                    />
                    <Controller
                      control={control}
                      name="machineOperator.signature"
                      render={({ field }) => <TextInput {...field} label="Operator Signature" placeholder="Signature" />}
                    />
                    <Controller
                      control={control}
                      name="machineOperator.date"
                      render={({ field }) => (
                        <DateInput label="Operator Date" value={field.value} onChange={field.onChange} clearable />
                      )}
                    />
                  </SimpleGrid>
                  <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                    <Controller
                      control={control}
                      name="safetyOfficer.name"
                      render={({ field }) => <TextInput {...field} label="Safety Officer" placeholder="Name" />}
                    />
                    <Controller
                      control={control}
                      name="safetyOfficer.signature"
                      render={({ field }) => <TextInput {...field} label="Safety Officer Signature" placeholder="Signature" />}
                    />
                    <Controller
                      control={control}
                      name="safetyOfficer.date"
                      render={({ field }) => (
                        <DateInput label="Safety Officer Date" value={field.value} onChange={field.onChange} clearable />
                      )}
                    />
                  </SimpleGrid>
                  <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                    <Controller
                      control={control}
                      name="projectInCharge.name"
                      render={({ field }) => <TextInput {...field} label="Project In Charge" placeholder="Name" />}
                    />
                    <Controller
                      control={control}
                      name="projectInCharge.signature"
                      render={({ field }) => <TextInput {...field} label="Project In Charge Signature" placeholder="Signature" />}
                    />
                    <Controller
                      control={control}
                      name="projectInCharge.date"
                      render={({ field }) => (
                        <DateInput label="Project In Charge Date" value={field.value} onChange={field.onChange} clearable />
                      )}
                    />
                  </SimpleGrid>
                </Stack>
              </Card>

              <Group justify="space-between">
                <Button variant="default" onClick={closeModal}>
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
        onClose={closeViewModal}
        title="Reinforcement Cutting Checklist"
        size="85%"
        centered
        keepMounted
      >
        {selectedRecord ? (
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Project
                </Text>
                <Text fw={600}>{selectedRecord.projectName || '—'}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Equipment ID
                </Text>
                <Text fw={600}>{selectedRecord.equipmentId}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Contractor
                </Text>
                <Text fw={600}>{selectedRecord.contractorName || '—'}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Month Start
                </Text>
                <Text fw={600}>{selectedRecord.monthStart ? dayjs(selectedRecord.monthStart).format('DD MMM YYYY') : '—'}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Month End
                </Text>
                <Text fw={600}>{selectedRecord.monthEnd ? dayjs(selectedRecord.monthEnd).format('DD MMM YYYY') : '—'}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Frequency
                </Text>
                <Text fw={600}>{selectedRecord.frequency || 'Weekly'}</Text>
              </Card>
            </SimpleGrid>

            <Card withBorder radius="md" padding="md" shadow="xs">
              <Stack gap="xs" align="center">
                <Text fw={600}>Weekly reference</Text>
                <Image src={reinforcementReferenceImg} alt="Reinforcement cutting reference" width={320} fit="contain" />
              </Stack>
            </Card>

            <ScrollArea h={320}>
              <Table withTableBorder striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>SL NO</Table.Th>
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
                    const item = selectedRecord.items?.[index];
                    return (
                      <Table.Tr key={description}>
                        <Table.Td>{index + 1}</Table.Td>
                        <Table.Td>
                          <Group gap="xs" align="flex-start">
                            <Text size="sm" style={{ flex: 1 }}>
                              {description}
                            </Text>
                            {renderReferenceHover(index)}
                          </Group>
                        </Table.Td>
                        <Table.Td>{item?.weeks?.week1 || '—'}</Table.Td>
                        <Table.Td>{item?.weeks?.week2 || '—'}</Table.Td>
                        <Table.Td>{item?.weeks?.week3 || '—'}</Table.Td>
                        <Table.Td>{item?.weeks?.week4 || '—'}</Table.Td>
                        <Table.Td>{item?.weeks?.week5 || '—'}</Table.Td>
                        <Table.Td>{item?.remarks || '—'}</Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Stack>
        ) : null}
      </Modal>
    </EhsPageLayout>
  );
};

export default ReinforcementCuttingChecklistPage;
