import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
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
import { IconAlertCircle, IconEye, IconPencil, IconPlus, IconPrinter, IconRefresh, IconTrash } from '@tabler/icons-react';
import dayjs from 'dayjs';
import EhsPageLayout from '@/components/ehs/EhsPageLayout';
import { usePermissions } from '@/hooks/usePermissions';
import { useSites } from '@/hooks/useSites';
import { useMockDrillSchedules } from '@/hooks/useMockDrillSchedules';
import { MockDrillSchedulePayload, FirstAidChecklistMonth } from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';
import logo from '@/assets/ehs/Logo.jpeg';

const MONTHS: FirstAidChecklistMonth[] = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const createEntry = (order: number) => ({
  emergencyType: '',
  status: 'P',
  months: MONTHS.reduce<Record<FirstAidChecklistMonth, boolean>>((acc, month) => {
    acc[month] = false;
    return acc;
  }, {} as Record<FirstAidChecklistMonth, boolean>),
});

type DrillEntryFormValue = ReturnType<typeof createEntry>;

type MockDrillFormValues = {
  siteId?: string;
  year: number;
  preparedBy: string;
  checkedBy: string;
  chargeSign: string;
  projectInCharge: string;
  notes: string;
  entries: DrillEntryFormValue[];
};

const DEFAULT_VALUES: MockDrillFormValues = {
  siteId: undefined,
  year: new Date().getFullYear(),
  preparedBy: '',
  checkedBy: '',
  chargeSign: '',
  projectInCharge: '',
  notes: '',
  entries: Array.from({ length: 6 }).map((_, index) => createEntry(index + 1)),
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dayjs(date).format('DD/MM/YYYY');
};

const buildPrintHtml = (record: any) => {
  const rows = (record.entries || []).map((entry: any, index: number) => {
    const monthCells = MONTHS.map((month) => `<td style="border:1px solid #000;padding:6px;text-align:center;">${entry.months?.[month] ? '✔' : ''}</td>`).join('');
    return `
      <tr>
        <td style="border:1px solid #000;padding:6px;text-align:center;">${index + 1}</td>
        <td style="border:1px solid #000;padding:6px;">${entry.emergencyType ?? ''}</td>
        <td style="border:1px solid #000;padding:6px;text-align:center;">${entry.status ?? ''}</td>
        ${monthCells}
      </tr>`;
  });

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Mock Drill Schedule</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #fff; color: #000; }
          .sheet { border: 2px solid #149b6d; padding: 20px; }
          .header { display: grid; grid-template-columns: 2fr 3fr 1.2fr; gap: 12px; align-items: stretch; margin-bottom: 16px; }
          .logo { border: 1px solid #000; display: flex; align-items: center; justify-content: center; padding: 12px; background: #fff; }
          .title { border: 1px solid #000; background: #f2fff7; display: flex; align-items: center; justify-content: center; text-transform: uppercase; font-size: 22px; font-weight: 700; }
          .meta { border: 1px solid #000; background: #f3f3f3; padding: 12px; font-size: 12px; line-height: 1.4; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #000; padding: 6px; }
          th { background: #d9d9d9; }
          .footer { margin-top: 16px; font-size: 12px; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="header">
            <div class="logo"><img src="${logo}" alt="Shivalik" style="max-width:150px;max-height:60px;object-fit:contain;" /></div>
            <div class="title">Mock Drill Schedule</div>
            <div class="meta">
              <div>Format no.: EHS-F-19</div>
              <div>Rev No.: 00</div>
            </div>
          </div>

          <table style="margin-bottom:8px;">
            <tbody>
              <tr>
                <td style="font-weight:600;">Site :</td>
                <td>${record.siteSnapshot?.name || '—'}</td>
                <td style="font-weight:600;">Year:</td>
                <td>${record.year || ''}</td>
              </tr>
            </tbody>
          </table>

          <table>
            <thead>
              <tr>
                <th style="width:50px;">Sr.No</th>
                <th>Type of emergency</th>
                <th style="width:60px;">P/A</th>
                ${MONTHS.map((month) => `<th style="width:55px;">${month.slice(0, 3).toUpperCase()}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.join('')}
            </tbody>
          </table>

          <div class="footer">
            <div>
              <div>Prepared by: ${record.preparedBy || '_______________'}</div>
            </div>
            <div>
              <div>Checked by: ${record.checkedBy || '_______________'}</div>
              <div>Charge Sign: ${record.chargeSign || '_______________'}</div>
            </div>
            <div>
              <div>Project In Charge: ${record.projectInCharge || '_______________'}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return html;
};

const MockDrillSchedulePage = () => {
  const { can, loading: permissionsLoading, roles } = usePermissions();
  const { sites, loading: sitesLoading } = useSites();
  const { records, loading, fetchSchedules, createSchedule, updateSchedule } = useMockDrillSchedules({ limit: 50 });

  const [formOpened, setFormOpened] = useState(false);
  const [viewOpened, setViewOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = roles.includes('SuperAdmin');
  const canView = isSuperAdmin || can('MockDrillSchedule', 'view') || roles.length === 0;
  const canCreate = isSuperAdmin || can('MockDrillSchedule', 'add') || roles.length === 0;
  const canEdit = isSuperAdmin || can('MockDrillSchedule', 'edit');

  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MockDrillFormValues>({ defaultValues: DEFAULT_VALUES });

  const { fields, append, remove, replace } = useFieldArray({ control, name: 'entries' });
  const watchedSiteId = watch('siteId');

  useEffect(() => {
    if (!permissionsLoading && canView) {
      fetchSchedules().catch(() => undefined);
    }
  }, [permissionsLoading, canView, fetchSchedules]);

  useEffect(() => {
    if (!watchedSiteId) return;
    const site = sites.find((item) => item._id === watchedSiteId);
    if (site && !watch('projectInCharge')) {
      setValue('projectInCharge', site.name ?? '', { shouldDirty: false });
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
      showMessage('You do not have permission to create mock drill schedules', 'error');
      return;
    }
    reset(DEFAULT_VALUES);
    replace(DEFAULT_VALUES.entries);
    setEditingId(null);
    setFormOpened(true);
  };

  const handleEdit = (record: any) => {
    if (!canEdit) {
      showMessage('You do not have permission to edit mock drill schedules', 'error');
      return;
    }
    setEditingId(record._id);
    setFormOpened(true);
    reset({
      siteId: record.siteSnapshot?.id ?? undefined,
      year: record.year ?? new Date().getFullYear(),
      preparedBy: record.preparedBy ?? '',
      checkedBy: record.checkedBy ?? '',
      chargeSign: record.chargeSign ?? '',
      projectInCharge: record.projectInCharge ?? '',
      notes: record.notes ?? '',
      entries: (record.entries || DEFAULT_VALUES.entries).map((entry: any) => ({
        emergencyType: entry.emergencyType ?? '',
        status: entry.status ?? 'P',
        months: MONTHS.reduce<Record<FirstAidChecklistMonth, boolean>>((acc, month) => {
          acc[month] = Boolean(entry.months?.[month]);
          return acc;
        }, {} as Record<FirstAidChecklistMonth, boolean>),
      })),
    });
    replace(
      (record.entries || DEFAULT_VALUES.entries).map((entry: any) => ({
        emergencyType: entry.emergencyType ?? '',
        status: entry.status ?? 'P',
        months: MONTHS.reduce<Record<FirstAidChecklistMonth, boolean>>((acc, month) => {
          acc[month] = Boolean(entry.months?.[month]);
          return acc;
        }, {} as Record<FirstAidChecklistMonth, boolean>),
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
      showMessage('Select a schedule to print', 'info');
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

  const onSubmit = async (values: MockDrillFormValues) => {
    const payload: MockDrillSchedulePayload = {
      siteId: values.siteId || undefined,
      year: values.year,
      preparedBy: values.preparedBy || undefined,
      checkedBy: values.checkedBy || undefined,
      chargeSign: values.chargeSign || undefined,
      projectInCharge: values.projectInCharge || undefined,
      notes: values.notes || undefined,
      entries: values.entries.map((entry) => ({
        emergencyType: entry.emergencyType,
        status: entry.status || undefined,
        months: entry.months,
      })),
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await updateSchedule(editingId, payload);
      } else {
        await createSchedule(payload);
      }
      await fetchSchedules();
      setFormOpened(false);
      setEditingId(null);
      reset(DEFAULT_VALUES);
      replace(DEFAULT_VALUES.entries);
    } catch (error: any) {
      showMessage(error?.message ?? 'Unable to save mock drill schedule', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EhsPageLayout
      title="Mock Drill Schedule"
      description="Plan upcoming emergency drills with scenario details, participating teams, and resource readiness."
      actions={
        <Group>
          <Button
            variant="light"
            color="gray"
            leftSection={<IconRefresh size={16} />}
            onClick={() => fetchSchedules()}
            loading={loading}
          >
            Refresh
          </Button>
          {canCreate ? (
            <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
              Plan New Drill
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
          You do not have permission to view mock drill schedules.
        </Alert>
      ) : (
        <Stack gap="lg">
          <Card withBorder radius="md" padding="lg" shadow="sm">
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <Text size="sm" c="dimmed">
                  Schedules planned: {records.length}
                </Text>
              </Group>
              <ScrollArea>
                <Table highlightOnHover striped withColumnBorders>
                  <thead>
                    <tr>
                      <th>Site</th>
                      <th>Year</th>
                      <th>Prepared by</th>
                      <th>Entries</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length ? (
                      records.map((record) => (
                        <tr key={record._id}>
                          <td>{record.siteSnapshot?.name || '—'}</td>
                          <td>{record.year || '—'}</td>
                          <td>{record.preparedBy || '—'}</td>
                          <td>
                            <Badge color="teal" variant="light">
                              {record.entries?.length ?? 0}
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
                            No drills scheduled yet.
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
                <Text fw={600}>Schedule preview</Text>
                <Group gap="sm">
                  <Button variant="light" color="gray" leftSection={<IconPrinter size={16} />} onClick={() => handlePrint(selectedRecord)}>
                    Print
                  </Button>
                  <Button variant="default" onClick={() => setSelectedRecord(null)}>
                    Close
                  </Button>
                </Group>
              </Group>
              <ScrollArea h={320}>
                <Table withColumnBorders striped>
                  <thead>
                    <tr>
                      <th>Sr</th>
                      <th>Type of emergency</th>
                      <th>P/A</th>
                      {MONTHS.map((month) => (
                        <th key={month}>{month.slice(0, 3).toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRecord.entries?.length ? (
                      selectedRecord.entries.map((entry: any, index: number) => (
                        <tr key={`${entry.emergencyType}-${index}`}>
                          <td>{index + 1}</td>
                          <td>{entry.emergencyType || '—'}</td>
                          <td style={{ textAlign: 'center' }}>{entry.status || '—'}</td>
                          {MONTHS.map((month) => (
                            <td key={month} style={{ textAlign: 'center' }}>{entry.months?.[month] ? '✔' : ''}</td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={15}>
                          <Text size="sm" c="dimmed" ta="center">
                            No entries available.
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
        size="95%"
        radius="md"
        title={editingId ? 'Edit Mock Drill Schedule' : 'Plan Mock Drill'}
        overlayProps={{ blur: 3 }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea offsetScrollbars h="70vh">
            <Stack gap="lg" py="xs">
              <Card withBorder radius="md" padding="lg" shadow="xs">
                <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing="md">
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
                    name="year"
                    render={({ field }) => (
                      <NumberInput
                        label="Year"
                        value={field.value}
                        min={2000}
                        max={2100}
                        onChange={(val) => field.onChange(Number(val) || new Date().getFullYear())}
                      />
                    )}
                  />
                  <TextInput label="Prepared by" placeholder="Name" {...register('preparedBy')} />
                  <TextInput label="Checked by" placeholder="Name" {...register('checkedBy')} />
                  <TextInput label="Charge sign" placeholder="Charge signatory" {...register('chargeSign')} />
                  <TextInput label="Project In Charge" placeholder="Project manager" {...register('projectInCharge')} />
                  <Textarea label="Notes" minRows={2} autosize {...register('notes')} />
                </SimpleGrid>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <ScrollArea offsetScrollbars>
                  <Table withColumnBorders horizontalSpacing="sm" verticalSpacing="sm">
                    <thead>
                      <tr>
                        <th style={{ width: 60 }}>Sr</th>
                        <th>Type of emergency</th>
                        <th style={{ width: 80 }}>P/A</th>
                        {MONTHS.map((month) => (
                          <th key={month} style={{ width: 55 }}>{month.slice(0, 3).toUpperCase()}</th>
                        ))}
                        <th style={{ width: 60 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((field, index) => (
                        <tr key={field.id}>
                          <td>{index + 1}</td>
                          <td>
                            <TextInput
                              placeholder="Emergency scenario"
                              {...register(`entries.${index}.emergencyType` as const, {
                                required: 'Required',
                              })}
                              error={errors.entries?.[index]?.emergencyType?.message}
                            />
                          </td>
                          <td>
                            <Controller
                              control={control}
                              name={`entries.${index}.status` as const}
                              render={({ field: statusField }) => (
                                <Select
                                  data={[{ value: 'P', label: 'Planned (P)' }, { value: 'A', label: 'Actual (A)' }]}
                                  value={statusField.value}
                                  onChange={(value) => statusField.onChange(value ?? 'P')}
                                  allowDeselect={false}
                                />
                              )}
                            />
                          </td>
                          {MONTHS.map((month) => (
                            <td key={month} style={{ textAlign: 'center' }}>
                              <Controller
                                control={control}
                                name={`entries.${index}.months.${month}` as const}
                                render={({ field: checkboxField }) => (
                                  <Checkbox
                                    checked={checkboxField.value}
                                    onChange={(event) => checkboxField.onChange(event.currentTarget.checked)}
                                    aria-label={`${field.emergencyType} ${month}`}
                                  />
                                )}
                              />
                            </td>
                          ))}
                          <td>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => remove(index)}
                              disabled={fields.length === 1}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </ScrollArea>
                <Group justify="flex-end" mt="md">
                  <Button variant="subtle" leftSection={<IconPlus size={14} />} onClick={() => append(createEntry(fields.length + 1))}>
                    Add row
                  </Button>
                </Group>
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
                  {editingId ? 'Update schedule' : 'Save schedule'}
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
        title="Mock Drill Schedule"
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
                  Year
                </Text>
                <Text fw={600}>{selectedRecord.year || '—'}</Text>
              </Card>
            </SimpleGrid>
            <ScrollArea h={320}>
              <Table withColumnBorders striped>
                <thead>
                  <tr>
                    <th>Sr</th>
                    <th>Type of emergency</th>
                    <th>P/A</th>
                    {MONTHS.map((month) => (
                      <th key={month}>{month.slice(0, 3).toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedRecord.entries?.length ? (
                    selectedRecord.entries.map((entry: any, index: number) => (
                      <tr key={`${entry.emergencyType}-${index}`}>
                        <td>{index + 1}</td>
                        <td>{entry.emergencyType || '—'}</td>
                        <td style={{ textAlign: 'center' }}>{entry.status || '—'}</td>
                        {MONTHS.map((month) => (
                          <td key={month} style={{ textAlign: 'center' }}>{entry.months?.[month] ? '✔' : ''}</td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={15}>
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

export default MockDrillSchedulePage;
