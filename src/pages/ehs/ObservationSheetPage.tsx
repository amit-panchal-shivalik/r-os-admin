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
import { useDailyObservations } from '@/hooks/useDailyObservations';
import { DailyObservationPayload } from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';
import shivalikLogo from '@/assets/ehs/Logo.jpeg';

const DEFAULT_ROWS = 12;

type ObservationRowForm = {
  date: Date | null;
  observation: string;
  correctiveAction: string;
  safetyPersonSign: string;
  agencyResponsibleSign: string;
  remarks: string;
};

type ObservationSheetFormValues = {
  projectName: string;
  projectLocation: string;
  contractorName: string;
  frequency: string;
  siteId?: string;
  observations: ObservationRowForm[];
  projectManagerName?: string;
  projectManagerSignature?: string;
  projectManagerDate?: Date | null;
};

const createDefaultRows = (): ObservationRowForm[] =>
  Array.from({ length: DEFAULT_ROWS }).map(() => ({
    date: null,
    observation: '',
    correctiveAction: '',
    safetyPersonSign: '',
    agencyResponsibleSign: '',
    remarks: '',
  }));

const defaultValues: ObservationSheetFormValues = {
  projectName: '',
  projectLocation: '',
  contractorName: '',
  frequency: 'Daily',
  siteId: undefined,
  observations: createDefaultRows(),
  projectManagerName: '',
  projectManagerSignature: '',
  projectManagerDate: null,
};

type DailyObservationRecord = ReturnType<typeof useDailyObservations>['records'][number];

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString();
};

const ObservationSheetPage = () => {
  const { can, loading: permissionsLoading, roles } = usePermissions();
  const { sites, loading: sitesLoading } = useSites();
  const { records, loading, fetchObservations, createObservation, updateObservation } = useDailyObservations({ limit: 50 });

  const [modalOpened, setModalOpened] = useState(false);
  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DailyObservationRecord | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = roles.includes('SuperAdmin');
  const canView = isSuperAdmin || can('DailyObservation', 'view') || roles.length === 0;
  const canCreate = isSuperAdmin || can('DailyObservation', 'add') || roles.length === 0;
  const canEdit = isSuperAdmin || can('DailyObservation', 'edit');

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ObservationSheetFormValues>({
    defaultValues,
  });

  const { fields, replace } = useFieldArray({ control, name: 'observations' });

  const watchedSiteId = watch('siteId');

  useEffect(() => {
    if (!permissionsLoading && canView) {
      fetchObservations().catch(() => undefined);
    }
  }, [permissionsLoading, canView, fetchObservations]);

  useEffect(() => {
    if (!watchedSiteId) return;
    const selectedSite = sites.find((site) => site._id === watchedSiteId);
    if (selectedSite) {
      if (!watch('projectName')) {
        setValue('projectName', selectedSite.name ?? '');
      }
      if (!watch('projectLocation')) {
        setValue('projectLocation', selectedSite.location ?? '');
      }
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
      showMessage('You do not have permission to add observation sheets', 'error');
      return;
    }
    reset({ ...defaultValues, observations: createDefaultRows() });
    replace(createDefaultRows());
    setEditingId(null);
    setModalOpened(true);
  };

  const handleEdit = useCallback(
    (record: DailyObservationRecord) => {
      if (!canEdit) {
        showMessage('You do not have permission to edit observation sheets', 'error');
        return;
      }
      setEditingId(record._id);
      reset({
        projectName: record.projectName ?? '',
        projectLocation: record.projectLocation ?? '',
        contractorName: record.contractorName ?? '',
        frequency: record.frequency ?? 'Daily',
        siteId: record.site?.id ?? undefined,
        observations: (record.observations || createDefaultRows()).map((entry) => ({
          date: entry.date ? new Date(entry.date) : null,
          observation: entry.observation ?? '',
          correctiveAction: entry.correctiveAction ?? '',
          safetyPersonSign: entry.safetyPersonSign ?? '',
          agencyResponsibleSign: entry.agencyResponsibleSign ?? '',
          remarks: entry.remarks ?? '',
        })),
        projectManagerName: record.projectManagerSign?.name ?? '',
        projectManagerSignature: record.projectManagerSign?.signature ?? '',
        projectManagerDate: record.projectManagerSign?.date ? new Date(record.projectManagerSign.date) : null,
      });
      replace(
        (record.observations || createDefaultRows()).map((entry) => ({
          date: entry.date ? new Date(entry.date) : null,
          observation: entry.observation ?? '',
          correctiveAction: entry.correctiveAction ?? '',
          safetyPersonSign: entry.safetyPersonSign ?? '',
          agencyResponsibleSign: entry.agencyResponsibleSign ?? '',
          remarks: entry.remarks ?? '',
        }))
      );
      setModalOpened(true);
    },
    [canEdit, reset, replace]
  );

  const handleView = useCallback((record: DailyObservationRecord) => {
    setSelectedRecord(record);
    setViewModalOpened(true);
  }, []);

  const handlePrint = useCallback(
    (record?: DailyObservationRecord) => {
      const target = record || selectedRecord;
      if (!target) return;

      const rows = (target.observations || createDefaultRows())
        .map((entry, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${entry?.date ? dayjs(entry.date).format('DD.MM.YYYY') : ''}</td>
            <td>${entry?.observation || ''}</td>
            <td>${entry?.correctiveAction || ''}</td>
            <td>${entry?.safetyPersonSign || ''}</td>
            <td>${entry?.agencyResponsibleSign || ''}</td>
            <td>${entry?.remarks || ''}</td>
          </tr>
        `)
        .join('');

      const html = `
        <html>
          <head>
            <title>Daily Observation Sheet</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; background: #1f1f1f; color: #fff; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #4b5563; padding: 6px; font-size: 12px; }
              th { background: #2d2d2d; text-align: left; }
              .header { display: grid; grid-template-columns: 2fr 3fr 1fr; gap: 12px; align-items: center; margin-bottom: 16px; }
              .header-logo { background: #111; display: flex; justify-content: center; align-items: center; padding: 12px; }
              .header-logo img { max-width: 160px; }
              .header-title { display: flex; justify-content: center; align-items: center; font-size: 24px; font-weight: bold; background: #111; }
              .header-meta { background: #111; padding: 12px; font-size: 12px; }
              .info-table { margin-bottom: 12px; }
              .info-table td { border: 1px solid #4b5563; padding: 6px; }
              .sign-row { margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
              .sign-cell { border-top: 1px solid #4b5563; padding-top: 6px; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="header-logo"><img src="${shivalikLogo}" alt="Shivalik" /></div>
              <div class="header-title">Daily Observation Sheet</div>
              <div class="header-meta">
                <div>Format No.: EHS-F-10</div>
                <div>Rev. No.: 00</div>
              </div>
            </div>
            <table class="info-table">
              <tr>
                <td>Project Name:</td>
                <td>${target.projectName || ''}</td>
              </tr>
              <tr>
                <td>Project Location:</td>
                <td>${target.projectLocation || ''}</td>
              </tr>
              <tr>
                <td>Contractor Name:</td>
                <td>${target.contractorName || ''}</td>
              </tr>
            </table>
            <table>
              <thead>
                <tr>
                  <th style="width:50px;">Sr. No.</th>
                  <th style="width:90px;">Date</th>
                  <th>Observation</th>
                  <th>Corrective Action</th>
                  <th style="width:120px;">Safety Person Sign</th>
                  <th style="width:150px;">Agency Responsible person Sign, if required.</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
            <div class="sign-row">
              <div class="sign-cell">Safety Person Sign:</div>
              <div class="sign-cell">Agency Responsible Person Sign:</div>
              <div class="sign-cell">Project Manager Sign: ${target.projectManagerSign?.name || ''}</div>
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

  const onSubmit = async (values: ObservationSheetFormValues) => {
    setSubmitting(true);
    try {
      const payload: DailyObservationPayload = {
        projectName: values.projectName,
        projectLocation: values.projectLocation,
        contractorName: values.contractorName,
        frequency: values.frequency,
        siteId: values.siteId,
        observations: values.observations.map((row) => ({
          date: row.date ? row.date.toISOString() : new Date().toISOString(),
          observation: row.observation,
          correctiveAction: row.correctiveAction,
          safetyPersonSign: row.safetyPersonSign,
          agencyResponsibleSign: row.agencyResponsibleSign,
          remarks: row.remarks,
        })),
        projectManagerSign: values.projectManagerName
          ? {
              name: values.projectManagerName,
              signature: values.projectManagerSignature,
              date: values.projectManagerDate ? values.projectManagerDate.toISOString() : undefined,
            }
          : undefined,
      };

      if (editingId) {
        await updateObservation(editingId, payload);
      } else {
        await createObservation(payload);
      }

      await fetchObservations();
      setModalOpened(false);
      setEditingId(null);
      reset(defaultValues);
      replace(createDefaultRows());
    } catch (error: any) {
      showMessage(error?.message ?? 'Unable to save observation sheet', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EhsPageLayout
      title="Daily Observation Sheet"
      description="Capture daily site observations, corrective actions, and responsible sign-offs."
      actions={
        canCreate ? (
          <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
            Register Observation
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
          You do not have permission to view observation sheets.
        </Alert>
      ) : (
        <Stack gap="lg">
          <Card withBorder radius="md" padding="lg" shadow="sm">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Logged sheets: {records.length}
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
                  onClick={() => fetchObservations()}
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
                    <Table.Th>Project Name</Table.Th>
                    <Table.Th>Location</Table.Th>
                    <Table.Th>Contractor</Table.Th>
                    <Table.Th>Created On</Table.Th>
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
                          No daily observation sheets captured yet.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    records.map((record) => (
                      <Table.Tr key={record._id}>
                        <Table.Td>{record.projectName}</Table.Td>
                        <Table.Td>{record.projectLocation || '—'}</Table.Td>
                        <Table.Td>{record.contractorName || '—'}</Table.Td>
                        <Table.Td>{formatDate(record.createdAt)}</Table.Td>
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
        title={editingId ? 'Edit Observation Sheet' : 'Register Observation'}
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
                    <TextInput {...field} label="Project Name" placeholder="Project" error={errors.projectName?.message} />
                  )}
                />
                <Controller
                  control={control}
                  name="projectLocation"
                  render={({ field }) => <TextInput {...field} label="Project Location" placeholder="Location" />}
                />
                <Controller
                  control={control}
                  name="contractorName"
                  render={({ field }) => <TextInput {...field} label="Contractor Name" placeholder="Contractor" />}
                />
                <Controller
                  control={control}
                  name="frequency"
                  render={({ field }) => <TextInput {...field} label="Frequency" placeholder="Daily" />}
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
                  <Text fw={600}>Daily entries</Text>
                  <Stack gap="md">
                    {fields.map((field, index) => (
                      <Card key={field.id} withBorder radius="md" padding="md" shadow="xs">
                        <Stack gap="sm">
                          <Group justify="space-between" align="flex-start">
                            <Group gap="xs">
                              <Badge color="blue" variant="light">
                                {index + 1}
                              </Badge>
                              <Text fw={600}>Observation</Text>
                            </Group>
                            <HoverCard width={260} shadow="md" withinPortal>
                              <HoverCard.Target>
                                <ActionIcon variant="subtle" color="gray" aria-label="Observation guidance">
                                  <IconInfoCircle size={16} />
                                </ActionIcon>
                              </HoverCard.Target>
                              <HoverCard.Dropdown>
                                <Stack gap="xs">
                                  <Text size="sm" fw={600}>
                                    Tip
                                  </Text>
                                  <Text size="xs" c="dimmed">
                                    Capture unsafe acts/conditions, positive findings, and associated corrective actions. Sign columns can hold initials.
                                  </Text>
                                </Stack>
                              </HoverCard.Dropdown>
                            </HoverCard>
                          </Group>
                          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                            <Controller
                              control={control}
                              name={`observations.${index}.date` as const}
                              render={({ field: dateField }) => (
                                <DateInput label="Date" value={dateField.value} onChange={dateField.onChange} clearable />
                              )}
                            />
                            <Controller
                              control={control}
                              name={`observations.${index}.observation` as const}
                              render={({ field: obsField }) => (
                                <TextInput {...obsField} label="Observation" placeholder="Observation detail" />
                              )}
                            />
                            <Controller
                              control={control}
                              name={`observations.${index}.correctiveAction` as const}
                              render={({ field: caField }) => (
                                <TextInput {...caField} label="Corrective Action" placeholder="Action planned" />
                              )}
                            />
                          </SimpleGrid>
                          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                            <Controller
                              control={control}
                              name={`observations.${index}.safetyPersonSign` as const}
                              render={({ field: safetyField }) => (
                                <TextInput {...safetyField} label="Safety Person Sign" placeholder="Initials" />
                              )}
                            />
                            <Controller
                              control={control}
                              name={`observations.${index}.agencyResponsibleSign` as const}
                              render={({ field: agencyField }) => (
                                <TextInput {...agencyField} label="Agency Responsible Sign" placeholder="Initials" />
                              )}
                            />
                            <Controller
                              control={control}
                              name={`observations.${index}.remarks` as const}
                              render={({ field: remarkField }) => (
                                <TextInput {...remarkField} label="Remarks" placeholder="Remarks" />
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
                  <Text fw={600}>Sign-offs</Text>
                  <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                    <Controller
                      control={control}
                      name="projectManagerName"
                      render={({ field }) => <TextInput {...field} label="Project Manager Name" placeholder="Name" />}
                    />
                    <Controller
                      control={control}
                      name="projectManagerSignature"
                      render={({ field }) => <TextInput {...field} label="Project Manager Signature" placeholder="Signature" />}
                    />
                    <Controller
                      control={control}
                      name="projectManagerDate"
                      render={({ field }) => (
                        <DateInput label="Project Manager Date" value={field.value} onChange={field.onChange} clearable />
                      )}
                    />
                  </SimpleGrid>
                </Stack>
              </Card>

              <Group justify="space-between">
                <Button variant="default" onClick={() => setModalOpened(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={submitting}>
                  {editingId ? 'Update Observation Sheet' : 'Save Observation Sheet'}
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
        title="Observation Sheet"
        size="85%"
        centered
        keepMounted
      >
        {selectedRecord ? (
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Project Name
                </Text>
                <Text fw={600}>{selectedRecord.projectName}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Project Location
                </Text>
                <Text fw={600}>{selectedRecord.projectLocation || '—'}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Contractor
                </Text>
                <Text fw={600}>{selectedRecord.contractorName || '—'}</Text>
              </Card>
            </SimpleGrid>

            <ScrollArea h={320}>
              <Table withTableBorder striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Sr. No.</Table.Th>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>Observation</Table.Th>
                    <Table.Th>Corrective Action</Table.Th>
                    <Table.Th>Safety Person Sign</Table.Th>
                    <Table.Th>Agency Responsible Sign</Table.Th>
                    <Table.Th>Remarks</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {(selectedRecord.observations || createDefaultRows()).map((entry, index) => (
                    <Table.Tr key={index}>
                      <Table.Td>{index + 1}</Table.Td>
                      <Table.Td>{entry?.date ? dayjs(entry.date).format('DD.MM.YYYY') : '—'}</Table.Td>
                      <Table.Td>{entry?.observation || '—'}</Table.Td>
                      <Table.Td>{entry?.correctiveAction || '—'}</Table.Td>
                      <Table.Td>{entry?.safetyPersonSign || '—'}</Table.Td>
                      <Table.Td>{entry?.agencyResponsibleSign || '—'}</Table.Td>
                      <Table.Td>{entry?.remarks || '—'}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            <Card withBorder radius="md" padding="md" shadow="xs">
              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  Project Manager Sign
                </Text>
                <Text fw={600}>{selectedRecord.projectManagerSign?.name || '—'}</Text>
                <Text size="sm" c="dimmed">
                  {selectedRecord.projectManagerSign?.date
                    ? dayjs(selectedRecord.projectManagerSign.date).format('DD.MM.YYYY')
                    : ''}
                </Text>
              </Stack>
            </Card>
          </Stack>
        ) : null}
      </Modal>
    </EhsPageLayout>
  );
};

export default ObservationSheetPage;
