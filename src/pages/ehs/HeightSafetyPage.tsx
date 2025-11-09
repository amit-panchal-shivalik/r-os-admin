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
import { IconAlertCircle, IconEye, IconPencil, IconPlus, IconPrinter, IconRefresh } from '@tabler/icons-react';
import dayjs from 'dayjs';
import EhsPageLayout from '@/components/ehs/EhsPageLayout';
import { usePermissions } from '@/hooks/usePermissions';
import { useSites } from '@/hooks/useSites';
import { useHeightSafety } from '@/hooks/useHeightSafety';
import { HeightSafetyPayload } from '@/apis/ehs';
import logo from '@/assets/ehs/Logo.jpeg';
import { showMessage } from '@/utils/Constant';

const CHECK_ITEMS = [
  {
    key: 'pulse',
    label: 'Pulse',
    standard: '60~100 beats per minute(bpm) at wrist or neck',
    actualField: 'pulseActual',
    conditionField: 'pulseCondition',
  },
  {
    key: 'fits',
    label: 'Fits or Blackouts',
    standard: 'Should not be happening',
    actualField: 'fitsActual',
    conditionField: 'fitsCondition',
  },
  {
    key: 'vision',
    label: 'Impaired Vision',
    standard: 'Should not be happening',
    actualField: 'visionActual',
    conditionField: 'visionCondition',
  },
  {
    key: 'fear',
    label: 'Fear of height',
    standard: 'Should not be happening',
    actualField: 'fearActual',
    conditionField: 'fearCondition',
  },
  {
    key: 'dizziness',
    label: 'Dizziness',
    standard: 'Should not be happening',
    actualField: 'dizzinessActual',
    conditionField: 'dizzinessCondition',
  },
  {
    key: 'awareness',
    label: 'Impairment of awareness & Concentration',
    standard: 'Should not be happening',
    actualField: 'awarenessActual',
    conditionField: 'awarenessCondition',
  },
];

type CheckItemForm = {
  key: string;
  standard: string;
  actual: string;
};

type HeightSafetyFormValues = {
  siteId?: string;
  date: Date | null;
  contractorName: string;
  personName: string;
  inductionNumber: string;
  department: string;
  shift: string;
  checkedBy: string;
  projectInCharge: string;
  conclusion: string;
  notes: string;
  points: CheckItemForm[];
};

const DEFAULT_CONCLUSION =
  'The person was allowed to work on a platform prepared at height of 10 feet and 6 feet long with proper safety precautions for 10 minutes. Above set parameters were checked after that and it is declared that the above person is fit to work on height.';

const DEFAULT_VALUES: HeightSafetyFormValues = {
  siteId: undefined,
  date: new Date(),
  contractorName: '',
  personName: '',
  inductionNumber: '',
  department: '',
  shift: '',
  checkedBy: '',
  projectInCharge: '',
  conclusion: DEFAULT_CONCLUSION,
  notes: '',
  points: CHECK_ITEMS.map((item) => ({ key: item.key, standard: item.standard, actual: '' })),
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dayjs(date).format('DD/MM/YYYY');
};

const buildPrintHtml = (record: any) => {
  const rows = CHECK_ITEMS.map((item) => {
    const standard = record?.[item.conditionField] ?? item.standard;
    const actual = record?.[item.actualField] ?? '';
    return `
      <tr>
        <td style="border:1px solid #000;padding:8px;">${item.label}</td>
        <td style="border:1px solid #000;padding:8px;">${standard || ''}</td>
        <td style="border:1px solid #000;padding:8px;">${actual || ''}</td>
      </tr>`;
  }).join('');

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Height Safety</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; background: #fff; padding: 24px; }
          .sheet { border: 2px solid #000; padding: 16px; }
          .header { display: grid; grid-template-columns: 2fr 3fr 1.3fr; gap: 12px; align-items: stretch; margin-bottom: 16px; }
          .logo { border:1px solid #000; display:flex; align-items:center; justify-content:center; padding:12px; background:#fff; }
          .title { border:1px solid #000; background:#f3f3f3; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:700; }
          .meta { border:1px solid #000; background:#f3f3f3; padding:12px; font-size:12px; line-height:1.5; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #000; padding: 8px; vertical-align: top; }
          th { background: #f3f3f3; font-weight: 600; }
          .details { border:1px solid #000; margin-bottom:16px; }
          .details-row { display:grid; grid-template-columns: repeat(2, 1fr); border-bottom:1px solid #000; }
          .details-row div { padding:6px 8px; border-right:1px solid #000; font-size:12px; }
          .details-row div:last-child { border-right:none; }
          .details-row:last-child { border-bottom:none; }
          .footer { display:grid; grid-template-columns:1fr 1fr; border:1px solid #000; margin-top:16px; }
          .footer div { padding:8px; border-right:1px solid #000; font-size:12px; font-weight:600; }
          .footer div:last-child { border-right:none; }
          .conclusion { border:1px solid #000; padding:10px; font-size:12px; margin-top:12px; }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="header">
            <div class="logo"><img src="${logo}" alt="Shivalik" style="max-width:150px;max-height:60px;object-fit:contain;" /></div>
            <div class="title">Height Safety</div>
            <div class="meta">
              <div>Format No.: EHS-F-22</div>
              <div>Rev. 00</div>
            </div>
          </div>

          <div class="details">
            <div class="details-row">
              <div>Date: ${formatDate(record?.date)}</div>
              <div>Contractor Name: ${record?.contractorName ?? ''}</div>
            </div>
            <div class="details-row">
              <div>Person Name and Induction Number: ${(record?.personName ?? '') + (record?.inductionNumber ? ` (${record.inductionNumber})` : '')}</div>
              <div>Department: ${record?.department ?? ''}</div>
            </div>
            <div class="details-row">
              <div>Shift: ${record?.shift ?? ''}</div>
              <div>Site: ${record?.siteSnapshot?.name ?? ''}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Points to be checked</th>
                <th>Standard Condition</th>
                <th>Actual Condition</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <div class="footer">
            <div>Checked by: ${record?.checkedBy ?? ''}</div>
            <div>Project In Charge Sign: ${record?.projectInCharge ?? ''}</div>
          </div>

          <div class="conclusion">
            <strong>Conclusion:</strong> ${record?.conclusion ?? ''}
          </div>
        </div>
      </body>
    </html>
  `;

  return html;
};

const HeightSafetyPage = () => {
  const { can, loading: permissionsLoading, roles } = usePermissions();
  const { sites, loading: sitesLoading } = useSites();
  const { records, loading, fetchAssessments, createAssessment, updateAssessment } = useHeightSafety({ limit: 50 });

  const [formOpened, setFormOpened] = useState(false);
  const [viewOpened, setViewOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = roles.includes('SuperAdmin');
  const canView = isSuperAdmin || can('HeightSafety', 'view') || roles.length === 0;
  const canCreate = isSuperAdmin || can('HeightSafety', 'add') || roles.length === 0;
  const canEdit = isSuperAdmin || can('HeightSafety', 'edit');

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<HeightSafetyFormValues>({ defaultValues: DEFAULT_VALUES });

  const { fields, replace } = useFieldArray({ control, name: 'points' });
  const watchedSiteId = watch('siteId');

  useEffect(() => {
    if (!permissionsLoading && canView) {
      fetchAssessments().catch(() => undefined);
    }
  }, [permissionsLoading, canView, fetchAssessments]);

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
      showMessage('You do not have permission to log height safety assessment', 'error');
      return;
    }
    reset(DEFAULT_VALUES);
    replace(DEFAULT_VALUES.points);
    setEditingId(null);
    setFormOpened(true);
  };

  const handleEdit = (record: any) => {
    if (!canEdit) {
      showMessage('You do not have permission to edit height safety assessment', 'error');
      return;
    }
    setEditingId(record._id);
    reset({
      siteId: record.siteSnapshot?.id ?? undefined,
      date: record.date ? new Date(record.date) : new Date(),
      contractorName: record.contractorName ?? '',
      personName: record.personName ?? '',
      inductionNumber: record.inductionNumber ?? '',
      department: record.department ?? '',
      shift: record.shift ?? '',
      checkedBy: record.checkedBy ?? '',
      projectInCharge: record.projectInCharge ?? '',
      conclusion: record.conclusion ?? DEFAULT_CONCLUSION,
      notes: record.notes ?? '',
      points: CHECK_ITEMS.map((item) => ({
        key: item.key,
        standard: record[item.conditionField] ?? item.standard,
        actual: record[item.actualField] ?? '',
      })),
    });
    replace(
      CHECK_ITEMS.map((item) => ({
        key: item.key,
        standard: record[item.conditionField] ?? item.standard,
        actual: record[item.actualField] ?? '',
      }))
    );
    setFormOpened(true);
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

  const onSubmit = async (values: HeightSafetyFormValues) => {
    if (!values.date) {
      showMessage('Assessment date is required', 'error');
      return;
    }

    const payload: HeightSafetyPayload = {
      siteId: values.siteId || undefined,
      date: values.date.toISOString(),
      contractorName: values.contractorName || undefined,
      personName: values.personName || undefined,
      inductionNumber: values.inductionNumber || undefined,
      department: values.department || undefined,
      shift: values.shift || undefined,
      conclusion: values.conclusion || undefined,
      checkedBy: values.checkedBy || undefined,
      projectInCharge: values.projectInCharge || undefined,
      notes: values.notes || undefined,
    };

    values.points.forEach((point) => {
      const item = CHECK_ITEMS.find((entry) => entry.key === point.key);
      if (!item) return;
      payload[item.conditionField as keyof HeightSafetyPayload] = point.standard || item.standard;
      payload[item.actualField as keyof HeightSafetyPayload] = point.actual || undefined;
    });

    setSubmitting(true);
    try {
      if (editingId) {
        await updateAssessment(editingId, payload);
      } else {
        await createAssessment(payload);
      }
      await fetchAssessments();
      setFormOpened(false);
      setEditingId(null);
      reset(DEFAULT_VALUES);
      replace(DEFAULT_VALUES.points);
    } catch (error: any) {
      showMessage(error?.message ?? 'Unable to save height safety assessment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EhsPageLayout
      title="Height Safety"
      description="Record medical readiness checks for personnel working at height and verify parameters before deployment."
      actions={
        <Group>
          <Button
            variant="light"
            color="gray"
            leftSection={<IconRefresh size={16} />}
            onClick={() => fetchAssessments()}
            loading={loading}
          >
            Refresh
          </Button>
          {canCreate ? (
            <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
              Log Height Safety Check
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
          You do not have permission to view height safety assessments.
        </Alert>
      ) : (
        <Stack gap="lg">
          <Card withBorder radius="md" padding="lg" shadow="sm">
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <Text size="sm" c="dimmed">
                  Assessments recorded: {records.length}
                </Text>
              </Group>
              <ScrollArea>
                <Table highlightOnHover striped withColumnBorders>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Person</th>
                      <th>Contractor</th>
                      <th>Site</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length ? (
                      records.map((record) => (
                        <tr key={record._id}>
                          <td>{formatDate(record.date)}</td>
                          <td>{record.personName || '—'}</td>
                          <td>{record.contractorName || '—'}</td>
                          <td>{record.siteSnapshot?.name || '—'}</td>
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
                            No height safety entries recorded.
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
                <Text fw={600}>Assessment Preview</Text>
                <Group gap="sm">
                  <Button variant="light" color="gray" leftSection={<IconPrinter size={16} />} onClick={() => handlePrint(selectedRecord)}>
                    Print
                  </Button>
                  <Button variant="default" onClick={() => setSelectedRecord(null)}>
                    Close
                  </Button>
                </Group>
              </Group>
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Text size="sm" c="dimmed">
                    Date
                  </Text>
                  <Text fw={600}>{formatDate(selectedRecord.date)}</Text>
                </Card>
                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Text size="sm" c="dimmed">
                    Contractor
                  </Text>
                  <Text fw={600}>{selectedRecord.contractorName || '—'}</Text>
                </Card>
                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Text size="sm" c="dimmed">
                    Person & Induction No.
                  </Text>
                  <Text fw={600}>
                    {selectedRecord.personName || '—'}
                    {selectedRecord.inductionNumber ? ` (${selectedRecord.inductionNumber})` : ''}
                  </Text>
                </Card>
                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Text size="sm" c="dimmed">
                    Department
                  </Text>
                  <Text fw={600}>{selectedRecord.department || '—'}</Text>
                </Card>
              </SimpleGrid>
              <ScrollArea h={240}>
                <Table withColumnBorders striped>
                  <thead>
                    <tr>
                      <th>Points to be checked</th>
                      <th>Standard Condition</th>
                      <th>Actual Condition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CHECK_ITEMS.map((item) => (
                      <tr key={item.key}>
                        <td>{item.label}</td>
                        <td>{selectedRecord[item.conditionField] || item.standard}</td>
                        <td>{selectedRecord[item.actualField] || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </ScrollArea>
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mt="md">
                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Text size="sm" c="dimmed">
                    Checked by
                  </Text>
                  <Text fw={600}>{selectedRecord.checkedBy || '—'}</Text>
                </Card>
                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Text size="sm" c="dimmed">
                    Project In Charge Sign
                  </Text>
                  <Text fw={600}>{selectedRecord.projectInCharge || '—'}</Text>
                </Card>
              </SimpleGrid>
              <Card withBorder radius="md" padding="md" shadow="xs" mt="md">
                <Text size="sm" c="dimmed">
                  Conclusion
                </Text>
                <Text>{selectedRecord.conclusion || '—'}</Text>
              </Card>
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
        title={editingId ? 'Edit Height Safety Assessment' : 'Log Height Safety Assessment'}
        overlayProps={{ blur: 3 }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea offsetScrollbars h="70vh">
            <Stack gap="lg" py="xs">
              <Card withBorder radius="md" padding="lg" shadow="xs">
                <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing="md">
                  <Controller
                    control={control}
                    name="date"
                    rules={{ required: 'Assessment date required' }}
                    render={({ field }) => (
                      <DateInput
                        label="Date"
                        value={field.value}
                        onChange={field.onChange}
                        valueFormat="DD MMM YYYY"
                        error={errors.date?.message}
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
                        onChange={(value) => field.onChange(value ?? undefined)}
                        searchable
                        clearable
                      />
                    )}
                  />
                  <TextInput label="Contractor Name" placeholder="Contractor" {...register('contractorName')} />
                  <TextInput label="Department" placeholder="Department" {...register('department')} />
                  <TextInput label="Person Name" placeholder="Worker name" {...register('personName')} />
                  <TextInput label="Induction Number" placeholder="IND-001" {...register('inductionNumber')} />
                  <TextInput label="Shift" placeholder="A / B / General" {...register('shift')} />
                  <TextInput label="Checked by" placeholder="Supervisor name" {...register('checkedBy')} />
                  <TextInput label="Project In Charge" placeholder="Project manager" {...register('projectInCharge')} />
                  <Textarea label="Conclusion" minRows={3} autosize {...register('conclusion')} />
                  <Textarea label="Additional notes" minRows={3} autosize {...register('notes')} />
                </SimpleGrid>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <ScrollArea offsetScrollbars>
                  <Table withColumnBorders>
                    <thead>
                      <tr>
                        <th>Points to be checked</th>
                        <th>Standard Condition</th>
                        <th>Actual Condition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((field, index) => (
                        <tr key={field.id}>
                          <td>{CHECK_ITEMS[index]?.label ?? field.key}</td>
                          <td>
                            <Textarea
                              autosize
                              minRows={1}
                              {...register(`points.${index}.standard` as const)}
                            />
                          </td>
                          <td>
                            <Textarea
                              autosize
                              minRows={1}
                              placeholder="Observation"
                              {...register(`points.${index}.actual` as const)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </ScrollArea>
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
                  {editingId ? 'Update assessment' : 'Save assessment'}
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
        title="Height Safety Assessment"
        overlayProps={{ blur: 3 }}
      >
        {selectedRecord ? (
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Date
                </Text>
                <Text fw={600}>{formatDate(selectedRecord.date)}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Contractor
                </Text>
                <Text fw={600}>{selectedRecord.contractorName || '—'}</Text>
              </Card>
            </SimpleGrid>
            <ScrollArea h={300}>
              <Table withColumnBorders striped>
                <thead>
                  <tr>
                    <th>Points to be checked</th>
                    <th>Standard Condition</th>
                    <th>Actual Condition</th>
                  </tr>
                </thead>
                <tbody>
                  {CHECK_ITEMS.map((item) => (
                    <tr key={item.key}>
                      <td>{item.label}</td>
                      <td>{selectedRecord[item.conditionField] || item.standard}</td>
                      <td>{selectedRecord[item.actualField] || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </ScrollArea>
            <Card withBorder radius="md" padding="md" shadow="xs">
              <Text size="sm" c="dimmed">
                Conclusion
              </Text>
              <Text>{selectedRecord.conclusion || '—'}</Text>
            </Card>
          </Stack>
        ) : null}
      </Modal>
    </EhsPageLayout>
  );
};

export default HeightSafetyPage;
