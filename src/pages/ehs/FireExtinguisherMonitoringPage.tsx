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
import { DateInput } from '@mantine/dates';
import { IconAlertCircle, IconEye, IconPencil, IconPlus, IconPrinter, IconRefresh, IconTrash } from '@tabler/icons-react';
import dayjs from 'dayjs';
import EhsPageLayout from '@/components/ehs/EhsPageLayout';
import { usePermissions } from '@/hooks/usePermissions';
import { useSites } from '@/hooks/useSites';
import { useFireExtinguisherMonitoring } from '@/hooks/useFireExtinguisherMonitoring';
import { FireExtinguisherMonitoringPayload } from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';
import logo from '@/assets/ehs/Logo.jpeg';

const DEFAULT_CHECKPOINTS =
  'Check Point: (1) Lock Pin (2) Safety Clip (3) Hose pipe condition (4) Discharge Horn (5) Weight of Fire Extinguisher (6) Pressure Guage (7) Inspection Tag';

type ExtinguisherEntryFormValue = {
  extinguisherId: string;
  location: string;
  type: string;
  capacity: string;
  hydrotestDoneOn: Date | null;
  hydrotestDueOn: Date | null;
  refillingDate: Date | null;
  refillingDueDate: Date | null;
  inspectionDate: Date | null;
  checkedBy: string;
  remarks: string;
};

type FireExtinguisherFormValues = {
  siteId?: string;
  lastUpdatedOn: Date | null;
  projectIncharge: string;
  checkpointsNote: string;
  extinguishers: ExtinguisherEntryFormValue[];
};

const createEntry = (): ExtinguisherEntryFormValue => ({
  extinguisherId: '',
  location: '',
  type: '',
  capacity: '',
  hydrotestDoneOn: null,
  hydrotestDueOn: null,
  refillingDate: null,
  refillingDueDate: null,
  inspectionDate: null,
  checkedBy: '',
  remarks: '',
});

const DEFAULT_VALUES: FireExtinguisherFormValues = {
  siteId: undefined,
  lastUpdatedOn: new Date(),
  projectIncharge: '',
  checkpointsNote: DEFAULT_CHECKPOINTS,
  extinguishers: Array.from({ length: 10 }).map(() => createEntry()),
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dayjs(date).format('DD/MM/YYYY');
};

const buildPrintHtml = (record: any) => {
  const siteName = record.siteSnapshot?.name || record.site || '';
  const siteLocation = record.siteSnapshot?.location ? `, ${record.siteSnapshot.location}` : ''; // not part of schema but safe
  const rows = (record.extinguishers || []).map((row: any, index: number) => `
        <tr>
          <td style="border:1px solid #000;padding:6px;text-align:center;">${index + 1}</td>
          <td style="border:1px solid #000;padding:6px;">${row.extinguisherId ?? ''}</td>
          <td style="border:1px solid #000;padding:6px;">${row.location ?? ''}</td>
          <td style="border:1px solid #000;padding:6px;">${row.type ?? ''}</td>
          <td style="border:1px solid #000;padding:6px;text-align:center;">${row.capacity ?? ''}</td>
          <td style="border:1px solid #000;padding:6px;text-align:center;">${formatDate(row.hydrotestDoneOn)}</td>
          <td style="border:1px solid #000;padding:6px;text-align:center;">${formatDate(row.hydrotestDueOn)}</td>
          <td style="border:1px solid #000;padding:6px;text-align:center;">${formatDate(row.refillingDate)}</td>
          <td style="border:1px solid #000;padding:6px;text-align:center;">${formatDate(row.refillingDueDate)}</td>
          <td style="border:1px solid #000;padding:6px;text-align:center;">${formatDate(row.inspectionDate)}</td>
          <td style="border:1px solid #000;padding:6px;">${row.checkedBy ?? ''}</td>
          <td style="border:1px solid #000;padding:6px;">${row.remarks ?? ''}</td>
        </tr>
      `);

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Fire Extinguishers Monitoring & Check Sheet</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #fff; color: #000; }
          .sheet { border: 2px solid #0338a6; padding: 20px; }
          .header { display: grid; grid-template-columns: 2fr 3fr 1.2fr; gap: 12px; align-items: stretch; margin-bottom: 16px; }
          .logo { border: 1px solid #000; display: flex; align-items: center; justify-content: center; padding: 12px; background: #fff; }
          .title { border: 1px solid #000; background: #f3f3f3; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 700; text-transform: uppercase; text-align: center; }
          .meta { border: 1px solid #000; background: #f3f3f3; padding: 12px; font-size: 12px; line-height: 1.4; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #000; padding: 6px; }
          th { background: #f3f3f3; }
          .section-title { font-weight: 600; margin-top: 12px; }
          .signature { margin-top: 24px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="header">
            <div class="logo"><img src="${logo}" alt="Shivalik" style="max-width:150px;max-height:60px;object-fit:contain;" /></div>
            <div class="title">Fire Extinguishers Monitoring & Check Sheet</div>
            <div class="meta">
              <div>Format No.: EHS-F-17</div>
              <div>Rev. No.: 00</div>
            </div>
          </div>

          <table>
            <tbody>
              <tr>
                <td style="width:20%;font-weight:600;">Site Name:</td>
                <td colspan="3">${siteName}${siteLocation}</td>
              </tr>
              <tr>
                <td style="font-weight:600;">Last Updated On:</td>
                <td colspan="3">${formatDate(record.lastUpdatedOn)}</td>
              </tr>
            </tbody>
          </table>

          <div class="section-title">${record.checkpointsNote || DEFAULT_CHECKPOINTS}</div>

          <table style="margin-top:8px;">
            <thead>
              <tr>
                <th style="width:45px;">Sr. No.</th>
                <th>Fire Ext. ID</th>
                <th>Location</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Hydrotest done on</th>
                <th>Hydrotest due on</th>
                <th>Refilling date</th>
                <th>Refilling due date</th>
                <th>Inspection date</th>
                <th>Checked by</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${rows.length ? rows.join('') : `<tr><td colspan="12" style="text-align:center;padding:12px;">No extinguisher entries recorded</td></tr>`}
            </tbody>
          </table>

          <div class="signature">Project Site Incharge Sign: _______________________________</div>
        </div>
      </body>
    </html>
  `;

  return html;
};

const FireExtinguisherMonitoringPage = () => {
  const { can, loading: permissionsLoading, roles } = usePermissions();
  const { sites, loading: sitesLoading } = useSites();
  const { records, loading, fetchRecords, createRecord, updateRecord } = useFireExtinguisherMonitoring({ limit: 50 });

  const [formOpened, setFormOpened] = useState(false);
  const [viewOpened, setViewOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = roles.includes('SuperAdmin');
  const canView = isSuperAdmin || can('FireExtinguisherMonitoring', 'view') || roles.length === 0;
  const canCreate = isSuperAdmin || can('FireExtinguisherMonitoring', 'add') || roles.length === 0;
  const canEdit = isSuperAdmin || can('FireExtinguisherMonitoring', 'edit');

  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FireExtinguisherFormValues>({ defaultValues: DEFAULT_VALUES });

  const { fields, append, remove, replace } = useFieldArray({ control, name: 'extinguishers' });
  const watchedSiteId = watch('siteId');

  useEffect(() => {
    if (!permissionsLoading && canView) {
      fetchRecords().catch(() => undefined);
    }
  }, [permissionsLoading, canView, fetchRecords]);

  useEffect(() => {
    if (!watchedSiteId) return;
    const site = sites.find((item) => item._id === watchedSiteId);
    if (site && !watch('projectIncharge')) {
      setValue('projectIncharge', site.name ?? '', { shouldDirty: false });
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
      showMessage('You do not have permission to log extinguisher checks', 'error');
      return;
    }
    reset(DEFAULT_VALUES);
    replace(DEFAULT_VALUES.extinguishers);
    setEditingId(null);
    setFormOpened(true);
  };

  const handleEdit = (record: any) => {
    if (!canEdit) {
      showMessage('You do not have permission to edit extinguisher checks', 'error');
      return;
    }
    setEditingId(record._id);
    setFormOpened(true);
    reset({
      siteId: record.siteSnapshot?.id ?? undefined,
      lastUpdatedOn: record.lastUpdatedOn ? new Date(record.lastUpdatedOn) : new Date(),
      projectIncharge: record.projectIncharge ?? '',
      checkpointsNote: record.checkpointsNote ?? DEFAULT_CHECKPOINTS,
      extinguishers: (record.extinguishers || DEFAULT_VALUES.extinguishers).map((entry: any) => ({
        extinguisherId: entry.extinguisherId ?? '',
        location: entry.location ?? '',
        type: entry.type ?? '',
        capacity: entry.capacity ?? '',
        hydrotestDoneOn: entry.hydrotestDoneOn ? new Date(entry.hydrotestDoneOn) : null,
        hydrotestDueOn: entry.hydrotestDueOn ? new Date(entry.hydrotestDueOn) : null,
        refillingDate: entry.refillingDate ? new Date(entry.refillingDate) : null,
        refillingDueDate: entry.refillingDueDate ? new Date(entry.refillingDueDate) : null,
        inspectionDate: entry.inspectionDate ? new Date(entry.inspectionDate) : null,
        checkedBy: entry.checkedBy ?? '',
        remarks: entry.remarks ?? '',
      })),
    });
    replace(
      (record.extinguishers || DEFAULT_VALUES.extinguishers).map((entry: any) => ({
        extinguisherId: entry.extinguisherId ?? '',
        location: entry.location ?? '',
        type: entry.type ?? '',
        capacity: entry.capacity ?? '',
        hydrotestDoneOn: entry.hydrotestDoneOn ? new Date(entry.hydrotestDoneOn) : null,
        hydrotestDueOn: entry.hydrotestDueOn ? new Date(entry.hydrotestDueOn) : null,
        refillingDate: entry.refillingDate ? new Date(entry.refillingDate) : null,
        refillingDueDate: entry.refillingDueDate ? new Date(entry.refillingDueDate) : null,
        inspectionDate: entry.inspectionDate ? new Date(entry.inspectionDate) : null,
        checkedBy: entry.checkedBy ?? '',
        remarks: entry.remarks ?? '',
      }))
    );
  };

  const handleView = (record: any) => {
    setSelectedRecord(record);
    setViewOpened(true);
  };

  const handlePrint = useCallback((record?: any) => {
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

  const onSubmit = async (values: FireExtinguisherFormValues) => {
    if (!values.lastUpdatedOn) {
      showMessage('Select last updated date', 'error');
      return;
    }
    const payload: FireExtinguisherMonitoringPayload = {
      siteId: values.siteId || undefined,
      lastUpdatedOn: values.lastUpdatedOn.toISOString(),
      checkpointsNote: values.checkpointsNote || undefined,
      projectIncharge: values.projectIncharge || undefined,
      extinguishers: values.extinguishers.map((entry) => ({
        extinguisherId: entry.extinguisherId,
        location: entry.location || undefined,
        type: entry.type || undefined,
        capacity: entry.capacity || undefined,
        hydrotestDoneOn: entry.hydrotestDoneOn ? entry.hydrotestDoneOn.toISOString() : undefined,
        hydrotestDueOn: entry.hydrotestDueOn ? entry.hydrotestDueOn.toISOString() : undefined,
        refillingDate: entry.refillingDate ? entry.refillingDate.toISOString() : undefined,
        refillingDueDate: entry.refillingDueDate ? entry.refillingDueDate.toISOString() : undefined,
        inspectionDate: entry.inspectionDate ? entry.inspectionDate.toISOString() : undefined,
        checkedBy: entry.checkedBy || undefined,
        remarks: entry.remarks || undefined,
      })),
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await updateRecord(editingId, payload);
      } else {
        await createRecord(payload);
      }
      await fetchRecords();
      setFormOpened(false);
      setEditingId(null);
      reset(DEFAULT_VALUES);
      replace(DEFAULT_VALUES.extinguishers);
    } catch (error: any) {
      showMessage(error?.message ?? 'Unable to save fire extinguisher record', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EhsPageLayout
      title="Fire Extinguisher Monitoring"
      description="Track monthly inspection, hydro testing, and refilling compliance for site fire extinguishers."
      actions={
        <Group>
          <Button
            variant="light"
            color="gray"
            leftSection={<IconRefresh size={16} />}
            onClick={() => fetchRecords()}
            loading={loading}
          >
            Refresh
          </Button>
          {canCreate ? (
            <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
              Log Extinguisher Check
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
          You do not have permission to view fire extinguisher monitoring records.
        </Alert>
      ) : (
        <Stack gap="lg">
          <Card withBorder radius="md" padding="lg" shadow="sm">
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <Text size="sm" c="dimmed">
                  Records logged: {records.length}
                </Text>
              </Group>
              <ScrollArea>
                <Table highlightOnHover striped withColumnBorders>
                  <thead>
                    <tr>
                      <th>Site</th>
                      <th>Last Updated</th>
                      <th>Project Incharge</th>
                      <th>Entries</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length ? (
                      records.map((record) => (
                        <tr key={record._id}>
                          <td>{record.siteSnapshot?.name || '—'}</td>
                          <td>{formatDate(record.lastUpdatedOn)}</td>
                          <td>{record.projectIncharge || '—'}</td>
                          <td>
                            <Badge color="teal" variant="light">
                              {record.extinguishers?.length ?? 0}
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
                            No fire extinguisher monitoring records yet.
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
                <Text fw={600}>Record preview</Text>
                <Group gap="sm">
                  <Button variant="light" color="gray" leftSection={<IconPrinter size={16} />} onClick={() => handlePrint(selectedRecord)}>
                    Print
                  </Button>
                  <Button variant="default" onClick={() => setSelectedRecord(null)}>
                    Close
                  </Button>
                </Group>
              </Group>
              <ScrollArea h={300}>
                <Table withColumnBorders striped>
                  <thead>
                    <tr>
                      <th>Sr</th>
                      <th>Fire Ext. ID</th>
                      <th>Location</th>
                      <th>Type</th>
                      <th>Capacity</th>
                      <th>Hydrotest done</th>
                      <th>Hydrotest due</th>
                      <th>Refilling</th>
                      <th>Refilling due</th>
                      <th>Inspection</th>
                      <th>Checked by</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRecord.extinguishers?.length ? (
                      selectedRecord.extinguishers.map((entry: any, index: number) => (
                        <tr key={`${entry.extinguisherId}-${index}`}>
                          <td>{index + 1}</td>
                          <td>{entry.extinguisherId || '—'}</td>
                          <td>{entry.location || '—'}</td>
                          <td>{entry.type || '—'}</td>
                          <td>{entry.capacity || '—'}</td>
                          <td>{formatDate(entry.hydrotestDoneOn)}</td>
                          <td>{formatDate(entry.hydrotestDueOn)}</td>
                          <td>{formatDate(entry.refillingDate)}</td>
                          <td>{formatDate(entry.refillingDueDate)}</td>
                          <td>{formatDate(entry.inspectionDate)}</td>
                          <td>{entry.checkedBy || '—'}</td>
                          <td>{entry.remarks || '—'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={12}>
                          <Text size="sm" c="dimmed" ta="center">
                            No entries recorded.
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
        title={editingId ? 'Edit Fire Extinguisher Record' : 'Log Fire Extinguisher Check'}
        overlayProps={{ blur: 3 }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea offsetScrollbars h="70vh">
            <Stack gap="lg" py="xs">
              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Stack gap="md">
                  <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
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
                    <Controller
                      control={control}
                      name="lastUpdatedOn"
                      rules={{ required: 'Last updated date is required' }}
                      render={({ field }) => (
                        <DateInput
                          label="Last updated on"
                          value={field.value}
                          onChange={field.onChange}
                          valueFormat="DD MMM YYYY"
                          error={errors.lastUpdatedOn ? 'Required' : undefined}
                        />
                      )}
                    />
                    <TextInput
                      label="Project site incharge"
                      placeholder="Name"
                      {...register('projectIncharge')}
                    />
                  </SimpleGrid>
                  <Textarea label="Check points" minRows={3} autosize {...register('checkpointsNote')} />
                </Stack>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Stack gap="md">
                  <Group justify="space-between" align="center">
                    <Text fw={600}>Extinguisher entries</Text>
                    <Button variant="subtle" leftSection={<IconPlus size={14} />} onClick={() => append(createEntry())}>
                      Add row
                    </Button>
                  </Group>
                  <Stack gap="md">
                    {fields.map((field, index) => (
                      <Card key={field.id} withBorder radius="md" padding="md" shadow="xs">
                        <Group justify="space-between" align="center" mb="sm">
                          <Text fw={600}>Entry #{index + 1}</Text>
                          <ActionIcon variant="subtle" color="red" onClick={() => remove(index)} disabled={fields.length === 1}>
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
                          <TextInput
                            label="Fire Ext. ID"
                            placeholder="Tag number"
                            {...register(`extinguishers.${index}.extinguisherId` as const, {
                              required: index === 0 ? 'Required' : false,
                            })}
                            error={errors.extinguishers?.[index]?.extinguisherId?.message}
                          />
                          <TextInput label="Location" placeholder="Area" {...register(`extinguishers.${index}.location` as const)} />
                          <TextInput label="Type" placeholder="ABC 6kg" {...register(`extinguishers.${index}.type` as const)} />
                          <TextInput label="Capacity" placeholder="6 kg" {...register(`extinguishers.${index}.capacity` as const)} />
                          <Controller
                            control={control}
                            name={`extinguishers.${index}.hydrotestDoneOn` as const}
                            render={({ field: fieldCtrl }) => (
                              <DateInput label="Hydrotest done on" value={fieldCtrl.value} onChange={fieldCtrl.onChange} valueFormat="DD MMM YYYY" />
                            )}
                          />
                          <Controller
                            control={control}
                            name={`extinguishers.${index}.hydrotestDueOn` as const}
                            render={({ field: fieldCtrl }) => (
                              <DateInput label="Hydrotest due on" value={fieldCtrl.value} onChange={fieldCtrl.onChange} valueFormat="DD MMM YYYY" />
                            )}
                          />
                          <Controller
                            control={control}
                            name={`extinguishers.${index}.refillingDate` as const}
                            render={({ field: fieldCtrl }) => (
                              <DateInput label="Refilling date" value={fieldCtrl.value} onChange={fieldCtrl.onChange} valueFormat="DD MMM YYYY" />
                            )}
                          />
                          <Controller
                            control={control}
                            name={`extinguishers.${index}.refillingDueDate` as const}
                            render={({ field: fieldCtrl }) => (
                              <DateInput label="Refilling due date" value={fieldCtrl.value} onChange={fieldCtrl.onChange} valueFormat="DD MMM YYYY" />
                            )}
                          />
                          <Controller
                            control={control}
                            name={`extinguishers.${index}.inspectionDate` as const}
                            render={({ field: fieldCtrl }) => (
                              <DateInput label="Inspection date" value={fieldCtrl.value} onChange={fieldCtrl.onChange} valueFormat="DD MMM YYYY" />
                            )}
                          />
                          <TextInput label="Checked by" placeholder="Inspector" {...register(`extinguishers.${index}.checkedBy` as const)} />
                          <Textarea label="Remarks" minRows={2} autosize {...register(`extinguishers.${index}.remarks` as const)} />
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
                  {editingId ? 'Update record' : 'Save record'}
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
        title="Fire Extinguisher Check Sheet"
        overlayProps={{ blur: 3 }}
      >
        {selectedRecord ? (
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Site
                </Text>
                <Text fw={600}>{selectedRecord.siteSnapshot?.name || '—'}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Last updated on
                </Text>
                <Text fw={600}>{formatDate(selectedRecord.lastUpdatedOn)}</Text>
              </Card>
            </SimpleGrid>
            <Card withBorder radius="md" padding="md" shadow="xs">
              <Text size="sm" c="dimmed">
                Check points
              </Text>
              <Text>{selectedRecord.checkpointsNote || DEFAULT_CHECKPOINTS}</Text>
            </Card>
            <ScrollArea h={320}>
              <Table withColumnBorders striped>
                <thead>
                  <tr>
                    <th>Sr</th>
                    <th>Fire Ext. ID</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Capacity</th>
                    <th>Hydrotest done</th>
                    <th>Hydrotest due</th>
                    <th>Refilling</th>
                    <th>Refilling due</th>
                    <th>Inspection</th>
                    <th>Checked by</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRecord.extinguishers?.length ? (
                    selectedRecord.extinguishers.map((entry: any, index: number) => (
                      <tr key={`${entry.extinguisherId}-${index}`}>
                        <td>{index + 1}</td>
                        <td>{entry.extinguisherId || '—'}</td>
                        <td>{entry.location || '—'}</td>
                        <td>{entry.type || '—'}</td>
                        <td>{entry.capacity || '—'}</td>
                        <td>{formatDate(entry.hydrotestDoneOn)}</td>
                        <td>{formatDate(entry.hydrotestDueOn)}</td>
                        <td>{formatDate(entry.refillingDate)}</td>
                        <td>{formatDate(entry.refillingDueDate)}</td>
                        <td>{formatDate(entry.inspectionDate)}</td>
                        <td>{entry.checkedBy || '—'}</td>
                        <td>{entry.remarks || '—'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={12}>
                        <Text size="sm" c="dimmed" ta="center">
                          No entries available.
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

export default FireExtinguisherMonitoringPage;
