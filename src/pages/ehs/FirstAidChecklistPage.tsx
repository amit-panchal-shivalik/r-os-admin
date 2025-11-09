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
import { DateInput } from '@mantine/dates';
import { IconAlertCircle, IconEye, IconPencil, IconPlus, IconPrinter, IconRefresh } from '@tabler/icons-react';
import dayjs from 'dayjs';
import EhsPageLayout from '@/components/ehs/EhsPageLayout';
import { usePermissions } from '@/hooks/usePermissions';
import { useSites } from '@/hooks/useSites';
import { useFirstAidChecklists } from '@/hooks/useFirstAidChecklists';
import { FirstAidChecklistPayload, FirstAidChecklistMonth } from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';
import logo from '@/assets/ehs/Logo.jpeg';

const MONTHS: FirstAidChecklistMonth[] = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const DEFAULT_ITEMS = [
  'Eye/Ear Drops',
  'Small, Medium and Large Sterilized Dressings gauze pad',
  'Sterilised Cotton Wool',
  'Antiseptic solution',
  'Dettol',
  'Scissors',
  'Adhesive Plaster (6cm x 1 mtr)',
  'Adhesive tape',
  'Sterilized Eye Pads',
  'Bandage 10 cms wide',
  'Bandage 5 cms wide',
  'Tourniquet',
  'Safety Pins',
  'Sterilized Latex Gloves',
  'Betadin Cream',
  'Burnol Cream',
  'Pain killer Spray/Iodex',
  'First Aid bandage',
];

const createEntry = (item: string) => ({
  item,
  months: MONTHS.reduce<Record<FirstAidChecklistMonth, boolean>>((acc, month) => {
    acc[month] = false;
    return acc;
  }, {} as Record<FirstAidChecklistMonth, boolean>),
});

type ChecklistEntryFormValue = ReturnType<typeof createEntry>;

type FirstAidFormValues = {
  siteId?: string;
  responsibility: string;
  location: string;
  year: number;
  checkedBy: string;
  checkedOn: Date | null;
  projectIncharge: string;
  checklistEntries: ChecklistEntryFormValue[];
  notes: string;
};

const DEFAULT_VALUES: FirstAidFormValues = {
  siteId: undefined,
  responsibility: '',
  location: '',
  year: new Date().getFullYear(),
  checkedBy: '',
  checkedOn: new Date(),
  projectIncharge: '',
  checklistEntries: DEFAULT_ITEMS.map((item) => createEntry(item)),
  notes: '',
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dayjs(date).format('DD/MM/YYYY');
};

const buildPrintHtml = (record: any) => {
  const rows = (record.checklistEntries || []).map((entry: any, index: number) => {
    const monthCells = MONTHS.map((month) => {
      const checked = entry.months?.[month];
      return `<td style="border:1px solid #000;padding:6px;text-align:center;">${checked ? '✔' : ''}</td>`;
    }).join('');
    return `
      <tr>
        <td style="border:1px solid #000;padding:6px;text-align:center;">${index + 1}</td>
        <td style="border:1px solid #000;padding:6px;">${entry.item ?? ''}</td>
        ${monthCells}
      </tr>`;
  });

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>First Aid Check List</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #fff; color: #000; }
          .sheet { border: 2px solid #0b9446; padding: 20px; }
          .header { display: grid; grid-template-columns: 2fr 3fr 1.2fr; gap: 12px; align-items: stretch; margin-bottom: 16px; }
          .logo { border: 1px solid #000; display: flex; align-items: center; justify-content: center; padding: 12px; background: #fff; }
          .title { border: 1px solid #000; background: #f2fff6; display: flex; align-items: center; justify-content: center; text-transform: uppercase; font-size: 22px; font-weight: 700; }
          .meta { border: 1px solid #000; background: #f3f3f3; padding: 12px; font-size: 12px; line-height: 1.4; }
          table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
          th, td { border: 1px solid #000; padding: 6px; }
          th { background: #f3f3f3; }
          .row-info td { border: none; }
          .footer { margin-top: 16px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="header">
            <div class="logo"><img src="${logo}" alt="Shivalik" style="max-width:150px;max-height:60px;object-fit:contain;" /></div>
            <div class="title">First Aid Check List</div>
            <div class="meta">
              <div>Format No.: EHS-F-18</div>
              <div>Rev. No.: 00</div>
            </div>
          </div>

          <table style="margin-bottom:8px;">
            <tbody>
              <tr class="row-info">
                <td style="font-weight:600;">Site :</td>
                <td>${record.siteSnapshot?.name || '—'}</td>
                <td style="font-weight:600;">Location :</td>
                <td>${record.location || record.siteSnapshot?.location || '—'}</td>
                <td style="font-weight:600;">Responsibility :</td>
                <td>${record.responsibility || '—'}</td>
              </tr>
              <tr class="row-info">
                <td style="font-weight:600;">Year :</td>
                <td>${record.year || ''}</td>
                <td style="font-weight:600;">Checked By :</td>
                <td>${record.checkedBy || ''}</td>
                <td style="font-weight:600;">Checked On :</td>
                <td>${formatDate(record.checkedOn)}</td>
              </tr>
            </tbody>
          </table>

          <table>
            <thead>
              <tr>
                <th style="width:50px;">SR. NO.</th>
                <th>ITEM</th>
                ${MONTHS.map((month) => `<th style="width:50px;text-transform:uppercase;">${month.slice(0, 3).toUpperCase()}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Checked by sign And Date: ______________________________</p>
            <p>Project In Charge Sign: ________________________________</p>
            <p>All requirements found OK ☑ &nbsp;&nbsp;&nbsp; Requirement is not fulfilled □</p>
            <p>Note: This First Aid kit should be stocked with the recommended minimum statutory contents at all times as per your Site Requirement. It is important to check product expiry dates on a regular basis.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return html;
};

const FirstAidChecklistPage = () => {
  const { can, loading: permissionsLoading, roles } = usePermissions();
  const { sites, loading: sitesLoading } = useSites();
  const { records, loading, fetchChecklists, createChecklist, updateChecklist } = useFirstAidChecklists({ limit: 50 });

  const [formOpened, setFormOpened] = useState(false);
  const [viewOpened, setViewOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = roles.includes('SuperAdmin');
  const canView = isSuperAdmin || can('FirstAidChecklist', 'view') || roles.length === 0;
  const canCreate = isSuperAdmin || can('FirstAidChecklist', 'add') || roles.length === 0;
  const canEdit = isSuperAdmin || can('FirstAidChecklist', 'edit');

  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FirstAidFormValues>({ defaultValues: DEFAULT_VALUES });

  const { fields, replace } = useFieldArray({ control, name: 'checklistEntries' });
  const watchedSiteId = watch('siteId');

  useEffect(() => {
    if (!permissionsLoading && canView) {
      fetchChecklists().catch(() => undefined);
    }
  }, [permissionsLoading, canView, fetchChecklists]);

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
      showMessage('You do not have permission to record first aid checklists', 'error');
      return;
    }
    reset(DEFAULT_VALUES);
    replace(DEFAULT_VALUES.checklistEntries);
    setEditingId(null);
    setFormOpened(true);
  };

  const handleEdit = (record: any) => {
    if (!canEdit) {
      showMessage('You do not have permission to edit first aid checklists', 'error');
      return;
    }
    setEditingId(record._id);
    setFormOpened(true);
    reset({
      siteId: record.siteSnapshot?.id ?? undefined,
      responsibility: record.responsibility ?? '',
      location: record.location ?? record.siteSnapshot?.location ?? '',
      year: record.year ?? new Date().getFullYear(),
      checkedBy: record.checkedBy ?? '',
      checkedOn: record.checkedOn ? new Date(record.checkedOn) : new Date(),
      projectIncharge: record.projectIncharge ?? '',
      notes: record.notes ?? '',
      checklistEntries: (record.checklistEntries || DEFAULT_VALUES.checklistEntries).map((entry: any) => ({
        item: entry.item ?? '',
        months: MONTHS.reduce<Record<FirstAidChecklistMonth, boolean>>((acc, month) => {
          acc[month] = Boolean(entry.months?.[month]);
          return acc;
        }, {} as Record<FirstAidChecklistMonth, boolean>),
      })),
    });
    replace(
      (record.checklistEntries || DEFAULT_VALUES.checklistEntries).map((entry: any) => ({
        item: entry.item ?? '',
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
      showMessage('Select a checklist to print', 'info');
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

  const onSubmit = async (values: FirstAidFormValues) => {
    const payload: FirstAidChecklistPayload = {
      siteId: values.siteId || undefined,
      responsibility: values.responsibility || undefined,
      year: values.year,
      checkedBy: values.checkedBy || undefined,
      checkedOn: values.checkedOn ? values.checkedOn.toISOString() : undefined,
      projectIncharge: values.projectIncharge || undefined,
      notes: values.notes || undefined,
      checklistEntries: values.checklistEntries.map((entry) => ({
        item: entry.item,
        months: entry.months,
      })),
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await updateChecklist(editingId, payload);
      } else {
        await createChecklist(payload);
      }
      await fetchChecklists();
      setFormOpened(false);
      setEditingId(null);
      reset(DEFAULT_VALUES);
      replace(DEFAULT_VALUES.checklistEntries);
    } catch (error: any) {
      showMessage(error?.message ?? 'Unable to save first aid checklist', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EhsPageLayout
      title="First Aid Box Checklist"
      description="Audit first aid boxes for replenishment, expiry tracking, and compliance with statutory item lists."
      actions={
        <Group>
          <Button
            variant="light"
            color="gray"
            leftSection={<IconRefresh size={16} />}
            onClick={() => fetchChecklists()}
            loading={loading}
          >
            Refresh
          </Button>
          {canCreate ? (
            <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
              Record Checklist
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
          You do not have permission to view first aid checklists.
        </Alert>
      ) : (
        <Stack gap="lg">
          <Card withBorder radius="md" padding="lg" shadow="sm">
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <Text size="sm" c="dimmed">
                  Checklists recorded: {records.length}
                </Text>
              </Group>
              <ScrollArea>
                <Table highlightOnHover striped withColumnBorders>
                  <thead>
                    <tr>
                      <th>Site</th>
                      <th>Year</th>
                      <th>Responsibility</th>
                      <th>Checked by</th>
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
                          <td>{record.responsibility || '—'}</td>
                          <td>{record.checkedBy || '—'}</td>
                          <td>
                            <Badge color="teal" variant="light">
                              {record.checklistEntries?.length ?? 0}
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
                        <td colSpan={6}>
                          <Text size="sm" c="dimmed" ta="center">
                            No first aid box inspections recorded yet.
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
                <Text fw={600}>Checklist preview</Text>
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
                      <th>SR</th>
                      <th>Item</th>
                      {MONTHS.map((month) => (
                        <th key={month}>{month.slice(0, 3).toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRecord.checklistEntries?.length ? (
                      selectedRecord.checklistEntries.map((entry: any, index: number) => (
                        <tr key={`${entry.item}-${index}`}>
                          <td>{index + 1}</td>
                          <td>{entry.item || '—'}</td>
                          {MONTHS.map((month) => (
                            <td key={month} style={{ textAlign: 'center' }}>{entry.months?.[month] ? '✔' : ''}</td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={14}>
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
        title={editingId ? 'Edit First Aid Checklist' : 'Record First Aid Checklist'}
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
                  <TextInput label="Location" placeholder="Site location" {...register('location')} />
                  <TextInput label="Responsibility" placeholder="Responsible person" {...register('responsibility')} />
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
                  <TextInput label="Checked by" placeholder="Auditor" {...register('checkedBy')} />
                  <Controller
                    control={control}
                    name="checkedOn"
                    render={({ field }) => (
                      <DateInput label="Checked on" value={field.value} onChange={field.onChange} valueFormat="DD MMM YYYY" />
                    )}
                  />
                  <TextInput label="Project in charge" placeholder="Project manager" {...register('projectIncharge')} />
                  <Textarea label="Notes" minRows={2} autosize {...register('notes')} />
                </SimpleGrid>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <ScrollArea offsetScrollbars>
                  <Table withColumnBorders horizontalSpacing="sm" verticalSpacing="sm">
                    <thead>
                      <tr>
                        <th style={{ width: 60 }}>SR</th>
                        <th>Item</th>
                        {MONTHS.map((month) => (
                          <th key={month} style={{ width: 60 }}>{month.slice(0, 3).toUpperCase()}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((field, index) => (
                        <tr key={field.id}>
                          <td>{index + 1}</td>
                          <td>
                            <TextInput
                              placeholder="Item name"
                              {...register(`checklistEntries.${index}.item` as const, {
                                required: 'Item required',
                              })}
                              error={errors.checklistEntries?.[index]?.item?.message}
                            />
                          </td>
                          {MONTHS.map((month) => (
                            <td key={month} style={{ textAlign: 'center' }}>
                              <Controller
                                control={control}
                                name={`checklistEntries.${index}.months.${month}` as const}
                                render={({ field: checkboxField }) => (
                                  <Checkbox
                                    checked={checkboxField.value}
                                    onChange={(event) => checkboxField.onChange(event.currentTarget.checked)}
                                    aria-label={`${field.item} ${month}`}
                                  />
                                )}
                              />
                            </td>
                          ))}
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
                  {editingId ? 'Update checklist' : 'Save checklist'}
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
        title="First Aid Checklist"
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
                <Text size="xs" c="dimmed">{selectedRecord.location || selectedRecord.siteSnapshot?.location || ''}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Responsibility
                </Text>
                <Text fw={600}>{selectedRecord.responsibility || '—'}</Text>
                <Text size="xs" c="dimmed">Year: {selectedRecord.year || '—'}</Text>
              </Card>
            </SimpleGrid>
            <ScrollArea h={320}>
              <Table withColumnBorders striped>
                <thead>
                  <tr>
                    <th>SR</th>
                    <th>Item</th>
                    {MONTHS.map((month) => (
                      <th key={month}>{month.slice(0, 3).toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedRecord.checklistEntries?.length ? (
                    selectedRecord.checklistEntries.map((entry: any, index: number) => (
                      <tr key={`${entry.item}-${index}`}>
                        <td>{index + 1}</td>
                        <td>{entry.item || '—'}</td>
                        {MONTHS.map((month) => (
                          <td key={month} style={{ textAlign: 'center' }}>{entry.months?.[month] ? '✔' : ''}</td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={14}>
                        <Text size="sm" c="dimmed" ta="center">
                          No entries logged.
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

export default FirstAidChecklistPage;
