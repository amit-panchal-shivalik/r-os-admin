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
  NumberInput,
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
import { useSafetyStatisticsBoards } from '@/hooks/useSafetyStatisticsBoards';
import { SafetyStatisticsBoardPayload } from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';
import logo from '@/assets/ehs/Logo.jpeg';

const DEFAULT_METRICS = [
  'TOTAL MANDAYS WORKED',
  'TOTAL SAFE MAN HOURS WORKED',
  'TOTAL HSE INDUCTION CONDUCTED',
  'TOTAL TOOL BOX TALK MEETING CONDUCTED',
  'LOST TIME INJURIES (LTI)',
  'TOTAL NO OF FIRST AID INJURIES',
  'TOTAL NEAR MISSES REPORTED',
  'TOTAL NO OF REPORTABLE INCIDENT',
  'TOTAL HSE MEETING CONDUCTED',
];

type MetricFormValue = {
  description: string;
  lastMonth: number;
  cumulative: number;
  units?: string;
};

type SafetyBoardFormValues = {
  projectName: string;
  clientName: string;
  contractorName: string;
  date: Date | null;
  manpowerStrength: number;
  siteId?: string;
  metrics: MetricFormValue[];
  target: string;
  safetySlogan: string;
};

const defaultValues: SafetyBoardFormValues = {
  projectName: '',
  clientName: '',
  contractorName: '',
  date: new Date(),
  manpowerStrength: 0,
  siteId: undefined,
  metrics: DEFAULT_METRICS.map((description, index) => ({
    description,
    lastMonth: 0,
    cumulative: 0,
    units: index < 2 ? 'Hours' : '',
  })),
  target: '',
  safetySlogan: '',
};

type SafetyStatisticsBoardRecord = ReturnType<typeof useSafetyStatisticsBoards>['records'][number];

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dayjs(date).format('DD.MM.YYYY');
};

const SafetyStatisticsBoardPage = () => {
  const { can, loading: permissionsLoading, roles } = usePermissions();
  const { sites, loading: sitesLoading } = useSites();
  const { records, loading, fetchBoards, createBoard, updateBoard } = useSafetyStatisticsBoards({ limit: 50 });

  const [modalOpened, setModalOpened] = useState(false);
  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SafetyStatisticsBoardRecord | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = roles.includes('SuperAdmin');
  const canView = isSuperAdmin || can('SafetyStatisticsBoard', 'view') || roles.length === 0;
  const canCreate = isSuperAdmin || can('SafetyStatisticsBoard', 'add') || roles.length === 0;
  const canEdit = isSuperAdmin || can('SafetyStatisticsBoard', 'edit');

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SafetyBoardFormValues>({
    defaultValues,
  });

  const { fields, replace } = useFieldArray({ control, name: 'metrics' });

  const watchedSiteId = watch('siteId');

  useEffect(() => {
    if (!permissionsLoading && canView) {
      fetchBoards().catch(() => undefined);
    }
  }, [permissionsLoading, canView, fetchBoards]);

  useEffect(() => {
    if (!watchedSiteId) return;
    const selectedSite = sites.find((site) => site._id === watchedSiteId);
    if (selectedSite) {
      if (!watch('projectName')) setValue('projectName', selectedSite.name ?? '', { shouldDirty: false });
      if (!watch('contractorName')) setValue('contractorName', selectedSite.name ?? '', { shouldDirty: false });
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
      showMessage('You do not have permission to update statistics', 'error');
      return;
    }
    reset({ ...defaultValues, metrics: DEFAULT_METRICS.map((description, index) => ({ description, lastMonth: 0, cumulative: 0, units: index < 2 ? 'Hours' : '' })) });
    replace(DEFAULT_METRICS.map((description, index) => ({ description, lastMonth: 0, cumulative: 0, units: index < 2 ? 'Hours' : '' })));
    setEditingId(null);
    setModalOpened(true);
  };

  const handleEdit = useCallback(
    (record: SafetyStatisticsBoardRecord) => {
      if (!canEdit) {
        showMessage('You do not have permission to edit statistics', 'error');
        return;
      }
      setEditingId(record._id);
      reset({
        projectName: record.projectName ?? '',
        clientName: record.clientName ?? '',
        contractorName: record.contractorName ?? '',
        date: record.date ? new Date(record.date) : new Date(),
        manpowerStrength: record.manpowerStrength ?? 0,
        siteId: record.site?.id ?? undefined,
        metrics: (record.metrics || DEFAULT_METRICS.map((description, index) => ({ description, lastMonth: 0, cumulative: 0, units: index < 2 ? 'Hours' : '' }))).map(
          (metric) => ({
            description: metric.description,
            lastMonth: Number(metric.lastMonth) || 0,
            cumulative: Number(metric.cumulative) || 0,
            units: metric.units || '',
          })
        ),
        target: record.target ?? '',
        safetySlogan: record.safetySlogan ?? '',
      });
      replace(
        (record.metrics || DEFAULT_METRICS.map((description, index) => ({ description, lastMonth: 0, cumulative: 0, units: index < 2 ? 'Hours' : '' }))).map(
          (metric) => ({
            description: metric.description,
            lastMonth: Number(metric.lastMonth) || 0,
            cumulative: Number(metric.cumulative) || 0,
            units: metric.units || '',
          })
        )
      );
      setModalOpened(true);
    },
    [canEdit, reset, replace]
  );

  const handleView = useCallback((record: SafetyStatisticsBoardRecord) => {
    setSelectedRecord(record);
    setViewModalOpened(true);
  }, []);

  const handlePrint = useCallback(
    (record?: SafetyStatisticsBoardRecord) => {
      const target = record || selectedRecord;
      if (!target) return;

      const headerRows = `
        <tr>
          <td>Name of Project:</td>
          <td colspan="2">${target.projectName || ''}</td>
        </tr>
        <tr>
          <td>Name of Client:</td>
          <td colspan="2">${target.clientName || ''}</td>
        </tr>
        <tr>
          <td>Name of Contractor:</td>
          <td colspan="2">${target.contractorName || ''}</td>
        </tr>
        <tr>
          <td>Date:</td>
          <td colspan="2">${formatDate(target.date)}</td>
        </tr>
        <tr>
          <td>Today's Total Manpower Strength at Site:</td>
          <td colspan="2">${target.manpowerStrength ?? ''}</td>
        </tr>
      `;

      const metricRows = (target.metrics || []).map((metric, index) => `
        <tr>
          <td style="text-align:center;">${index + 1}</td>
          <td>${metric.description}</td>
          <td style="text-align:center;">${metric.lastMonth ?? ''}</td>
          <td style="text-align:center;">${metric.cumulative ?? ''}</td>
        </tr>
      `).join('');

      const html = `
        <html>
          <head>
            <title>EHS Statistics Board</title>
            <style>
              body { font-family: Arial, sans-serif; background: #004d00; color: #ffffff; padding: 24px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
              th, td { border: 1px solid #ffffff; padding: 6px; font-size: 12px; }
              .header { display: grid; grid-template-columns: 2fr 3fr 1fr; gap: 12px; align-items: center; margin-bottom: 16px; }
              .header-logo { display: flex; justify-content: center; align-items: center; border: 1px solid #ffffff; padding: 12px; background: #ffffff; }
              .header-logo img { max-width: 140px; }
              .header-title { display: flex; justify-content: center; align-items: center; font-size: 24px; font-weight: bold; background: #333333; border: 1px solid #ffffff; }
              .header-meta { border: 1px solid #ffffff; padding: 12px; font-size: 12px; background: #333333; }
              .section-title { background: #008000; font-weight: bold; }
              .target-cell { height: 50px; }
              .slogan-cell { height: 50px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="header-logo"><img src="${logo}" alt="Shivalik" /></div>
              <div class="header-title">EHS STATISTICS BOARD</div>
              <div class="header-meta">
                <div>Format No.: EHS-F-13</div>
                <div>Rev. No.: 00</div>
              </div>
            </div>
            <table>
              <tbody>
                ${headerRows}
              </tbody>
            </table>
            <table>
              <thead>
                <tr class="section-title">
                  <th style="width:60px;">SR. No</th>
                  <th>DESCRIPTION</th>
                  <th>LAST MONTH</th>
                  <th>CUMULATIVE</th>
                </tr>
              </thead>
              <tbody>
                ${metricRows}
              </tbody>
            </table>
            <table>
              <tbody>
                <tr>
                  <td class="target-cell" style="width: 20%; font-weight:bold;">OUR TARGET:</td>
                  <td>${target.target || ''}</td>
                </tr>
                <tr>
                  <td class="slogan-cell" style="font-weight:bold;">SAFETY SLOGAN:</td>
                  <td>${target.safetySlogan || ''}</td>
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

  const onSubmit = async (values: SafetyBoardFormValues) => {
    setSubmitting(true);
    try {
      const payload: SafetyStatisticsBoardPayload = {
        projectName: values.projectName,
        clientName: values.clientName,
        contractorName: values.contractorName,
        date: (values.date ?? new Date()).toISOString(),
        manpowerStrength: values.manpowerStrength,
        siteId: values.siteId,
        metrics: values.metrics.map((metric, index) => ({
          order: index + 1,
          description: metric.description,
          lastMonth: metric.lastMonth,
          cumulative: metric.cumulative,
          units: metric.units,
        })),
        target: values.target,
        safetySlogan: values.safetySlogan,
      };

      if (editingId) {
        await updateBoard(editingId, payload);
      } else {
        await createBoard(payload);
      }

      await fetchBoards();
      setModalOpened(false);
      setEditingId(null);
      reset(defaultValues);
      replace(DEFAULT_METRICS.map((description, index) => ({ description, lastMonth: 0, cumulative: 0, units: index < 2 ? 'Hours' : '' })));
    } catch (error: any) {
      showMessage(error?.message ?? 'Unable to save statistics board', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EhsPageLayout
      title="Safety Statistics Board"
      description="Maintain daily statistics for EHS display boards covering man hours, inductions, meetings, and incidents."
      actions={
        canCreate ? (
          <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
            Update Statistics
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
          You do not have permission to view safety statistics.
        </Alert>
      ) : (
        <Stack gap="lg">
          <Card withBorder radius="md" padding="lg" shadow="sm">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Boards updated: {records.length}
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
                  onClick={() => fetchBoards()}
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
                    <Table.Th>Project</Table.Th>
                    <Table.Th>Client</Table.Th>
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
                          No statistics logged yet.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    records.map((record) => (
                      <Table.Tr key={record._id}>
                        <Table.Td>{formatDate(record.date)}</Table.Td>
                        <Table.Td>{record.projectName}</Table.Td>
                        <Table.Td>{record.clientName || '—'}</Table.Td>
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
        title={editingId ? 'Edit Statistics Board' : 'Update Statistics Board'}
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
                  rules={{ required: 'Project name is required' }}
                  render={({ field }) => (
                    <TextInput {...field} label="Name of Project" placeholder="Project" error={errors.projectName?.message} />
                  )}
                />
                <Controller
                  control={control}
                  name="clientName"
                  render={({ field }) => <TextInput {...field} label="Name of Client" placeholder="Client" />}
                />
                <Controller
                  control={control}
                  name="contractorName"
                  render={({ field }) => <TextInput {...field} label="Name of Contractor" placeholder="Contractor" />}
                />
              </SimpleGrid>

              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                <Controller
                  control={control}
                  name="date"
                  rules={{ required: 'Date is required' }}
                  render={({ field }) => <DateInput label="Date" value={field.value} onChange={field.onChange} error={errors.date ? 'Required' : undefined} />}
                />
                <Controller
                  control={control}
                  name="manpowerStrength"
                  render={({ field }) => (
                    <NumberInput
                      label="Today's total manpower strength"
                      value={field.value}
                      onChange={(value) => field.onChange(value || 0)}
                      min={0}
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
                      <Table.Th style={{ width: 60 }}>SR. No</Table.Th>
                      <Table.Th>Description</Table.Th>
                      <Table.Th>Last Month</Table.Th>
                      <Table.Th>Cumulative</Table.Th>
                      <Table.Th>Units</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {fields.map((field, index) => (
                      <Table.Tr key={field.id}>
                        <Table.Td>{index + 1}</Table.Td>
                        <Table.Td>{field.description}</Table.Td>
                        <Table.Td>
                          <Controller
                            control={control}
                            name={`metrics.${index}.lastMonth` as const}
                            render={({ field: lastField }) => (
                              <NumberInput value={lastField.value} onChange={(value) => lastField.onChange(value || 0)} min={0} />
                            )}
                          />
                        </Table.Td>
                        <Table.Td>
                          <Controller
                            control={control}
                            name={`metrics.${index}.cumulative` as const}
                            render={({ field: cumField }) => (
                              <NumberInput value={cumField.value} onChange={(value) => cumField.onChange(value || 0)} min={0} />
                            )}
                          />
                        </Table.Td>
                        <Table.Td>
                          <Controller
                            control={control}
                            name={`metrics.${index}.units` as const}
                            render={({ field: unitField }) => (
                              <TextInput {...unitField} placeholder="Units" />
                            )}
                          />
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>

              <Textarea label="Our Target" {...control.register('target')} minRows={2} />
              <Textarea label="Safety Slogan" {...control.register('safetySlogan')} minRows={2} />

              <Group justify="space-between">
                <Button variant="default" onClick={() => setModalOpened(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={submitting}>
                  {editingId ? 'Update Board' : 'Save Board'}
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
        title="EHS Statistics Board"
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
                <Text fw={600}>{selectedRecord.projectName}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Client
                </Text>
                <Text fw={600}>{selectedRecord.clientName || '—'}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Contractor
                </Text>
                <Text fw={600}>{selectedRecord.contractorName || '—'}</Text>
              </Card>
            </SimpleGrid>

            <Card withBorder radius="md" padding="md" shadow="xs">
              <Stack gap={4}>
                <Text size="sm" c="dimmed">
                  Date
                </Text>
                <Text fw={600}>{formatDate(selectedRecord.date)}</Text>
                <Text size="sm" c="dimmed">
                  Today's manpower strength
                </Text>
                <Text fw={600}>{selectedRecord.manpowerStrength ?? '—'}</Text>
              </Stack>
            </Card>

            <ScrollArea h={320}>
              <Table withTableBorder striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>SR. No</Table.Th>
                    <Table.Th>Description</Table.Th>
                    <Table.Th>Last Month</Table.Th>
                    <Table.Th>Cumulative</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {(selectedRecord.metrics || []).map((metric, index) => (
                    <Table.Tr key={index}>
                      <Table.Td>{index + 1}</Table.Td>
                      <Table.Td>{metric.description}</Table.Td>
                      <Table.Td>{metric.lastMonth ?? 0}</Table.Td>
                      <Table.Td>{metric.cumulative ?? 0}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            <Card withBorder radius="md" padding="md" shadow="xs">
              <Text size="sm" c="dimmed">
                Our Target
              </Text>
              <Text fw={500}>{selectedRecord.target || '—'}</Text>
            </Card>

            <Card withBorder radius="md" padding="md" shadow="xs">
              <Text size="sm" c="dimmed">
                Safety Slogan
              </Text>
              <Text fw={500}>{selectedRecord.safetySlogan || '—'}</Text>
            </Card>
          </Stack>
        ) : null}
      </Modal>
    </EhsPageLayout>
  );
};

export default SafetyStatisticsBoardPage;
