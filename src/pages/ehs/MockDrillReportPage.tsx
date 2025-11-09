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
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { DateInput, TimeInput } from '@mantine/dates';
import { IconAlertCircle, IconEye, IconPencil, IconPlus, IconPrinter, IconRefresh, IconTrash } from '@tabler/icons-react';
import dayjs from 'dayjs';
import EhsPageLayout from '@/components/ehs/EhsPageLayout';
import { usePermissions } from '@/hooks/usePermissions';
import { useSites } from '@/hooks/useSites';
import { useMockDrillReports } from '@/hooks/useMockDrillReports';
import { MockDrillReportPayload } from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';
import logo from '@/assets/ehs/Logo.jpeg';

type ObserverFormValue = {
  name: string;
};

type MockDrillReportFormValues = {
  siteId?: string;
  mockDrillNumber: string;
  mockDrillDate: Date | null;
  time: string;
  typeOfEmergency: string;
  location: string;
  shift: string;
  observers: ObserverFormValue[];
  observations: string;
  usageOfExtinguishers: string;
  disposalOfAsh: string;
  headCount: string;
  actionPlan: string;
  preparedBy: string;
  checkedBy: string;
  chargeSign: string;
  projectInCharge: string;
  notes: string;
};

const createObserver = (): ObserverFormValue => ({ name: '' });

const DEFAULT_VALUES: MockDrillReportFormValues = {
  siteId: undefined,
  mockDrillNumber: '',
  mockDrillDate: new Date(),
  time: '10:00',
  typeOfEmergency: '',
  location: '',
  shift: '',
  observers: [createObserver(), createObserver(), createObserver()],
  observations: '',
  usageOfExtinguishers: '',
  disposalOfAsh: '',
  headCount: '',
  actionPlan: '',
  preparedBy: '',
  checkedBy: '',
  chargeSign: '',
  projectInCharge: '',
  notes: '',
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dayjs(date).format('DD/MM/YYYY');
};

const buildPrintHtml = (record: any) => {
  const observerRows = (record.observers || []).map((name: string) => `<div>${name || ''}</div>`).join('');

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Mock drill Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #fff; color: #000; }
          .sheet { border: 2px solid #000; padding: 20px; }
          .header { display: grid; grid-template-columns: 2fr 3fr 1.2fr; gap: 12px; align-items: stretch; margin-bottom: 16px; }
          .logo { border: 1px solid #000; display: flex; align-items: center; justify-content: center; padding: 12px; background: #fff; }
          .title { border: 1px solid #000; background: #f3f3f3; display: flex; align-items: center; justify-content: center; text-transform: uppercase; font-size: 22px; font-weight: 700; }
          .meta { border: 1px solid #000; background: #f3f3f3; padding: 12px; font-size: 12px; line-height: 1.4; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #000; padding: 6px; }
          th { background: #f3f3f3; text-align: left; }
          .section-title { font-weight: 600; margin-top: 12px; }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="header">
            <div class="logo"><img src="${logo}" alt="Shivalik" style="max-width:150px;max-height:60px;object-fit:contain;" /></div>
            <div class="title">Mock drill Report</div>
            <div class="meta">
              <div>Format no:- EHS-F-20</div>
              <div>Rev no:- 00</div>
            </div>
          </div>

          <table>
            <tbody>
              <tr><th style="width:20%;">Mock Drill No. :</th><td colspan="3">${record.mockDrillNumber || ''}</td></tr>
              <tr><th>Mock Drill Date :</th><td>${formatDate(record.mockDrillDate)}</td><th>Time :</th><td>${record.time || ''}</td></tr>
              <tr><th>Type of Emergency :</th><td colspan="3">${record.typeOfEmergency || ''}</td></tr>
              <tr><th>Location :</th><td>${record.location || ''}</td><th>Shift :</th><td>${record.shift || ''}</td></tr>
              <tr><th>Observers :</th><td colspan="3">${observerRows || ''}</td></tr>
              <tr><th>Observations :</th><td colspan="3" style="height:160px;vertical-align:top;">${(record.observations || '').replace(/\n/g, '<br />')}</td></tr>
            </tbody>
          </table>

          <table style="margin-top:12px;">
            <tbody>
              <tr><th>Usage of fire extinguishers during mock drill :</th><td>${record.usageOfExtinguishers || ''}</td></tr>
              <tr><th>Disposal of ash :</th><td>${record.disposalOfAsh || ''}</td></tr>
              <tr><th>Head count:</th><td>${record.headCount || ''}</td></tr>
              <tr><th>Action plan for improvement :</th><td>${record.actionPlan || ''}</td></tr>
            </tbody>
          </table>

          <table style="margin-top:12px;">
            <tbody>
              <tr><th style="width:25%;">Prepared by:</th><td>${record.preparedBy || ''}</td></tr>
              <tr><th>Checked by:</th><td>${record.checkedBy || ''}</td></tr>
              <tr><th>Charge Sign:</th><td>${record.chargeSign || ''}</td></tr>
              <tr><th>Project In Charge:</th><td>${record.projectInCharge || ''}</td></tr>
            </tbody>
          </table>
        </div>
      </body>
    </html>
  `;

  return html;
};

const MockDrillReportPage = () => {
  const { can, loading: permissionsLoading, roles } = usePermissions();
  const { sites, loading: sitesLoading } = useSites();
  const { records, loading, fetchReports, createReport, updateReport } = useMockDrillReports({ limit: 50 });

  const [formOpened, setFormOpened] = useState(false);
  const [viewOpened, setViewOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = roles.includes('SuperAdmin');
  const canView = isSuperAdmin || can('MockDrillReport', 'view') || roles.length === 0;
  const canCreate = isSuperAdmin || can('MockDrillReport', 'add') || roles.length === 0;
  const canEdit = isSuperAdmin || can('MockDrillReport', 'edit');

  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MockDrillReportFormValues>({ defaultValues: DEFAULT_VALUES });

  const { fields: observerFields, append, remove, replace } = useFieldArray({ control, name: 'observers' });
  const watchedSiteId = watch('siteId');

  useEffect(() => {
    if (!permissionsLoading && canView) {
      fetchReports().catch(() => undefined);
    }
  }, [permissionsLoading, canView, fetchReports]);

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
      showMessage('You do not have permission to submit mock drill reports', 'error');
      return;
    }
    reset(DEFAULT_VALUES);
    replace(DEFAULT_VALUES.observers);
    setEditingId(null);
    setFormOpened(true);
  };

  const handleEdit = (record: any) => {
    if (!canEdit) {
      showMessage('You do not have permission to edit mock drill reports', 'error');
      return;
    }
    setEditingId(record._id);
    setFormOpened(true);
    reset({
      siteId: record.siteSnapshot?.id ?? undefined,
      mockDrillNumber: record.mockDrillNumber ?? '',
      mockDrillDate: record.mockDrillDate ? new Date(record.mockDrillDate) : new Date(),
      time: record.time ?? '10:00',
      typeOfEmergency: record.typeOfEmergency ?? '',
      location: record.location ?? record.siteSnapshot?.location ?? '',
      shift: record.shift ?? '',
      observers: (record.observers && record.observers.length ? record.observers : DEFAULT_VALUES.observers.map(() => '')).map((name: string) => ({ name })),
      observations: record.observations ?? '',
      usageOfExtinguishers: record.usageOfExtinguishers ?? '',
      disposalOfAsh: record.disposalOfAsh ?? '',
      headCount: record.headCount ?? '',
      actionPlan: record.actionPlan ?? '',
      preparedBy: record.preparedBy ?? '',
      checkedBy: record.checkedBy ?? '',
      chargeSign: record.chargeSign ?? '',
      projectInCharge: record.projectInCharge ?? '',
      notes: record.notes ?? '',
    });
    replace(
      (record.observers && record.observers.length ? record.observers : DEFAULT_VALUES.observers.map(() => '')).map((name: string) => ({ name }))
    );
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

  const onSubmit = async (values: MockDrillReportFormValues) => {
    if (!values.mockDrillDate) {
      showMessage('Mock drill date is required', 'error');
      return;
    }
    const payload: MockDrillReportPayload = {
      siteId: values.siteId || undefined,
      mockDrillNumber: values.mockDrillNumber || undefined,
      mockDrillDate: values.mockDrillDate.toISOString(),
      time: values.time || undefined,
      typeOfEmergency: values.typeOfEmergency || undefined,
      location: values.location || undefined,
      shift: values.shift || undefined,
      observers: values.observers.map((observer) => observer.name).filter(Boolean),
      observations: values.observations || undefined,
      usageOfExtinguishers: values.usageOfExtinguishers || undefined,
      disposalOfAsh: values.disposalOfAsh || undefined,
      headCount: values.headCount || undefined,
      actionPlan: values.actionPlan || undefined,
      preparedBy: values.preparedBy || undefined,
      checkedBy: values.checkedBy || undefined,
      chargeSign: values.chargeSign || undefined,
      projectInCharge: values.projectInCharge || undefined,
      notes: values.notes || undefined,
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
      reset(DEFAULT_VALUES);
      replace(DEFAULT_VALUES.observers);
    } catch (error: any) {
      showMessage(error?.message ?? 'Unable to save mock drill report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EhsPageLayout
      title="Mock Drill Report"
      description="Capture outcomes, response timelines, and improvement points from completed emergency drills."
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
              Submit Drill Report
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
          You do not have permission to view mock drill reports.
        </Alert>
      ) : (
        <Stack gap="lg">
          <Card withBorder radius="md" padding="lg" shadow="sm">
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <Text size="sm" c="dimmed">
                  Reports logged: {records.length}
                </Text>
              </Group>
              <ScrollArea>
                <Table highlightOnHover striped withColumnBorders>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Emergency Type</th>
                      <th>Location</th>
                      <th>Prepared By</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length ? (
                      records.map((record) => (
                        <tr key={record._id}>
                          <td>{formatDate(record.mockDrillDate)}</td>
                          <td>{record.typeOfEmergency || '—'}</td>
                          <td>{record.location || '—'}</td>
                          <td>{record.preparedBy || '—'}</td>
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
                            No drill reports submitted yet.
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
                <Text fw={600}>Report preview</Text>
                <Group gap="sm">
                  <Button variant="light" color="gray" leftSection={<IconPrinter size={16} />} onClick={() => handlePrint(selectedRecord)}>
                    Print
                  </Button>
                  <Button variant="default" onClick={() => setSelectedRecord(null)}>
                    Close
                  </Button>
                </Group>
              </Group>
              <Stack gap="md">
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                  <Card withBorder radius="md" padding="md" shadow="xs">
                    <Text size="sm" c="dimmed">
                      Date
                    </Text>
                    <Text fw={600}>{formatDate(selectedRecord.mockDrillDate)}</Text>
                    <Text size="xs" c="dimmed">Time: {selectedRecord.time || '—'}</Text>
                  </Card>
                  <Card withBorder radius="md" padding="md" shadow="xs">
                    <Text size="sm" c="dimmed">
                      Type of emergency
                    </Text>
                    <Text fw={600}>{selectedRecord.typeOfEmergency || '—'}</Text>
                    <Text size="xs" c="dimmed">Location: {selectedRecord.location || '—'}</Text>
                  </Card>
                </SimpleGrid>
                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Text size="sm" c="dimmed">
                    Observers
                  </Text>
                  <Text>{(selectedRecord.observers || []).join(', ') || '—'}</Text>
                </Card>
                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Text size="sm" c="dimmed">
                    Observations
                  </Text>
                  <Text>{selectedRecord.observations || '—'}</Text>
                </Card>
              </Stack>
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
        size="85%"
        radius="md"
        title={editingId ? 'Edit Mock Drill Report' : 'Submit Mock Drill Report'}
        overlayProps={{ blur: 3 }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea offsetScrollbars h="70vh">
            <Stack gap="lg" py="xs">
              <Card withBorder radius="md" padding="lg" shadow="xs">
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
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
                  <TextInput label="Mock Drill No." placeholder="MD-01" {...register('mockDrillNumber')} />
                  <Controller
                    control={control}
                    name="mockDrillDate"
                    rules={{ required: 'Date required' }}
                    render={({ field }) => (
                      <DateInput
                        label="Mock Drill Date"
                        value={field.value}
                        onChange={field.onChange}
                        valueFormat="DD MMM YYYY"
                        error={errors.mockDrillDate ? 'Required' : undefined}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="time"
                    render={({ field }) => (
                      <TimeInput label="Time" value={field.value} onChange={field.onChange} format="24" />
                    )}
                  />
                  <TextInput label="Type of Emergency" placeholder="Fire evacuation" {...register('typeOfEmergency')} />
                  <TextInput label="Location" placeholder="Area / Building" {...register('location')} />
                  <TextInput label="Shift" placeholder="Day/Night" {...register('shift')} />
                  <TextInput label="Head count" placeholder="Number of participants" {...register('headCount')} />
                </SimpleGrid>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Stack gap="sm">
                  <Text fw={600}>Observers</Text>
                  <Stack gap="sm">
                    {observerFields.map((field, index) => (
                      <Group key={field.id} align="flex-end" gap="sm">
                        <TextInput
                          label={`Observer ${index + 1}`}
                          placeholder="Name"
                          {...register(`observers.${index}.name` as const)}
                        />
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => remove(index)}
                          disabled={observerFields.length === 1}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    ))}
                  </Stack>
                  <Button variant="subtle" leftSection={<IconPlus size={14} />} onClick={() => append(createObserver())}>
                    Add observer
                  </Button>
                </Stack>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Textarea label="Observations" minRows={6} autosize {...register('observations')} />
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                  <Textarea label="Usage of fire extinguishers" minRows={2} autosize {...register('usageOfExtinguishers')} />
                  <Textarea label="Disposal of ash" minRows={2} autosize {...register('disposalOfAsh')} />
                  <Textarea label="Action plan for improvement" minRows={2} autosize {...register('actionPlan')} />
                  <Textarea label="Notes" minRows={2} autosize {...register('notes')} />
                  <TextInput label="Prepared by" {...register('preparedBy')} />
                  <TextInput label="Checked by" {...register('checkedBy')} />
                  <TextInput label="Charge Sign" {...register('chargeSign')} />
                  <TextInput label="Project In Charge" {...register('projectInCharge')} />
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
        size="85%"
        radius="md"
        title="Mock Drill Report"
        overlayProps={{ blur: 3 }}
      >
        {selectedRecord ? (
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Drill number
                </Text>
                <Text fw={600}>{selectedRecord.mockDrillNumber || '—'}</Text>
                <Text size="xs" c="dimmed">Date: {formatDate(selectedRecord.mockDrillDate)}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Emergency type
                </Text>
                <Text fw={600}>{selectedRecord.typeOfEmergency || '—'}</Text>
                <Text size="xs" c="dimmed">Location: {selectedRecord.location || '—'}</Text>
              </Card>
            </SimpleGrid>
            <Card withBorder radius="md" padding="md" shadow="xs">
              <Text size="sm" c="dimmed">
                Observers
              </Text>
              <Text>{(selectedRecord.observers || []).join(', ') || '—'}</Text>
            </Card>
            <Card withBorder radius="md" padding="md" shadow="xs">
              <Text size="sm" c="dimmed">
                Observations
              </Text>
              <Text>{selectedRecord.observations || '—'}</Text>
            </Card>
          </Stack>
        ) : null}
      </Modal>
    </EhsPageLayout>
  );
};

export default MockDrillReportPage;
