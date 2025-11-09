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
import { IconAlertCircle, IconEye, IconInfoCircle, IconPencil, IconPlus, IconPrinter, IconRefresh } from '@tabler/icons-react';
import dayjs from 'dayjs';
import EhsPageLayout from '@/components/ehs/EhsPageLayout';
import { usePermissions } from '@/hooks/usePermissions';
import { useSites } from '@/hooks/useSites';
import { usePPERegisters } from '@/hooks/usePPERegisters';
import { PPEEntryPayload, PPERegisterPayload } from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

const PPE_COLUMNS = [
  { key: 'blueHelmet', label: 'Blue Helmet' },
  { key: 'yellowHelmetMale', label: 'Yellow Helmet (M)' },
  { key: 'yellowHelmetFemale', label: 'Yellow Helmet (F)' },
  { key: 'redHelmet', label: 'Red Helmet' },
  { key: 'blueJacket', label: 'Blue Jacket' },
  { key: 'yellowJacket', label: 'Yellow Jacket' },
  { key: 'orangeJacket', label: 'Orange Jacket' },
  { key: 'safetyShoes', label: 'Safety Shoes' },
  { key: 'gumShoes', label: 'Gum Shoes' },
  { key: 'safetyBelt', label: 'Safety Belt' },
  { key: 'cutResistanceGloves', label: 'Cut resistance gloves' },
  { key: 'cottonGloves', label: 'Cotton Gloves' },
  { key: 'rubberGloves', label: 'Rubber Gloves' },
  { key: 'leatherGloves', label: 'Leather Gloves' },
  { key: 'earPlug', label: 'Ear Plug' },
  { key: 'noseMask', label: 'Nose Mask' },
  { key: 'fallArrestorRope', label: 'Fall Arrestor rope' },
  { key: 'carabinerLock', label: 'Carbinar Lock' },
] as const;

type PPEFormRow = {
  date: Date | null;
  blueHelmet: number;
  yellowHelmetMale: number;
  yellowHelmetFemale: number;
  redHelmet: number;
  blueJacket: number;
  yellowJacket: number;
  orangeJacket: number;
  safetyShoes: number;
  gumShoes: number;
  safetyBelt: number;
  cutResistanceGloves: number;
  cottonGloves: number;
  rubberGloves: number;
  leatherGloves: number;
  earPlug: number;
  noseMask: number;
  fallArrestorRope: number;
  carabinerLock: number;
  remarks: string;
};

type PPERegisterFormValues = {
  contractorName: string;
  siteId?: string;
  entries: PPEFormRow[];
};

const createDefaultEntries = (): PPEFormRow[] =>
  Array.from({ length: 10 }).map(() => ({
    date: null,
    blueHelmet: 0,
    yellowHelmetMale: 0,
    yellowHelmetFemale: 0,
    redHelmet: 0,
    blueJacket: 0,
    yellowJacket: 0,
    orangeJacket: 0,
    safetyShoes: 0,
    gumShoes: 0,
    safetyBelt: 0,
    cutResistanceGloves: 0,
    cottonGloves: 0,
    rubberGloves: 0,
    leatherGloves: 0,
    earPlug: 0,
    noseMask: 0,
    fallArrestorRope: 0,
    carabinerLock: 0,
    remarks: '',
  }));

const defaultValues: PPERegisterFormValues = {
  contractorName: '',
  siteId: undefined,
  entries: createDefaultEntries(),
};

type PPERegisterRecord = ReturnType<typeof usePPERegisters>['records'][number];

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dayjs(date).format('DD.MM.YY');
};

const sumColumn = (entries: PPEEntryPayload[], key: keyof PPEEntryPayload) =>
  entries.reduce((acc, entry) => acc + Number(entry[key] ?? 0), 0);

const renderTotalRow = (entries: PPEEntryPayload[]) =>
  PPE_COLUMNS.map((column) => sumColumn(entries, column.key));

const PpeRegisterPage = () => {
  const { can, loading: permissionsLoading, roles } = usePermissions();
  const { sites, loading: sitesLoading } = useSites();
  const { records, loading, fetchRegisters, createRegister, updateRegister } = usePPERegisters({ limit: 50 });

  const [modalOpened, setModalOpened] = useState(false);
  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PPERegisterRecord | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = roles.includes('SuperAdmin');
  const canView = isSuperAdmin || can('PPERegister', 'view') || roles.length === 0;
  const canCreate = isSuperAdmin || can('PPERegister', 'add') || roles.length === 0;
  const canEdit = isSuperAdmin || can('PPERegister', 'edit');

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PPERegisterFormValues>({
    defaultValues,
  });

  const { fields, replace } = useFieldArray({ control, name: 'entries' });

  useEffect(() => {
    if (!permissionsLoading && canView) {
      fetchRegisters().catch(() => undefined);
    }
  }, [permissionsLoading, canView, fetchRegisters]);

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
      showMessage('You do not have permission to add PPE registers', 'error');
      return;
    }
    reset({ ...defaultValues, entries: createDefaultEntries() });
    replace(createDefaultEntries());
    setEditingId(null);
    setModalOpened(true);
  };

  const handleEdit = useCallback(
    (record: PPERegisterRecord) => {
      if (!canEdit) {
        showMessage('You do not have permission to edit PPE registers', 'error');
        return;
      }
      setEditingId(record._id);
      reset({
        contractorName: record.contractorName ?? '',
        siteId: record.site?.id ?? undefined,
        entries: (record.entries || createDefaultEntries()).map((entry) => ({
          ...entry,
          date: entry.date ? new Date(entry.date) : null,
        })) as PPEFormRow[],
      });
      replace(
        (record.entries || createDefaultEntries()).map((entry) => ({
          ...entry,
          date: entry.date ? new Date(entry.date) : null,
        })) as PPEFormRow[]
      );
      setModalOpened(true);
    },
    [canEdit, reset, replace]
  );

  const handleView = useCallback((record: PPERegisterRecord) => {
    setSelectedRecord(record);
    setViewModalOpened(true);
  }, []);

  const handlePrint = useCallback(
    (record?: PPERegisterRecord) => {
      const target = record || selectedRecord;
      if (!target) return;

      const rows = (target.entries || createDefaultEntries())
        .map((entry, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${entry?.date ? dayjs(entry.date).format('DD.MM.YY') : ''}</td>
            ${PPE_COLUMNS.map((column) => `<td>${entry?.[column.key as keyof typeof entry] ?? 0}</td>`).join('')}
            <td>${entry?.remarks ?? ''}</td>
          </tr>
        `)
        .join('');

      const totals = renderTotalRow(target.entries || []);

      const totalsRow = `
        <tr>
          <td colspan="2" style="font-weight:bold">Total</td>
          ${totals.map((value) => `<td style="font-weight:bold">${value}</td>`).join('')}
          <td></td>
        </tr>
      `;

      const html = `
        <html>
          <head>
            <title>PPE Register</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #000; padding: 4px; font-size: 11px; text-align: center; }
              th { background: #f3f4f6; }
              .meta { margin-bottom: 12px; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="meta"><strong>Contractor Name:</strong> ${target.contractorName || ''}</div>
            <table>
              <thead>
                <tr>
                  <th>Sr. No</th>
                  <th>Date</th>
                  ${PPE_COLUMNS.map((column) => `<th>${column.label}</th>`).join('')}
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>${rows}${totalsRow}</tbody>
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

  const onSubmit = async (values: PPERegisterFormValues) => {
    setSubmitting(true);
    try {
      const payload: PPERegisterPayload = {
        contractorName: values.contractorName,
        siteId: values.siteId,
        entries: values.entries.map((entry) => ({
          ...entry,
          date: entry.date ? entry.date.toISOString() : new Date().toISOString(),
        })),
      };

      if (editingId) {
        await updateRegister(editingId, payload);
      } else {
        await createRegister(payload);
      }

      await fetchRegisters();
      setModalOpened(false);
      setEditingId(null);
      reset(defaultValues);
      replace(createDefaultEntries());
    } catch (error: any) {
      showMessage(error?.message ?? 'Unable to save PPE register', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EhsPageLayout
      title="PPE Register"
      description="Track daily PPE issuances for contractors and maintain totals across equipment."
      actions={
        canCreate ? (
          <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
            Issue / Update PPE
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
          You do not have permission to view PPE registers.
        </Alert>
      ) : (
        <Stack gap="lg">
          <Card withBorder radius="md" padding="lg" shadow="sm">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Registers captured: {records.length}
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
                  onClick={() => fetchRegisters()}
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
                    <Table.Th>Contractor</Table.Th>
                    <Table.Th>Site</Table.Th>
                    <Table.Th>Entries</Table.Th>
                    <Table.Th>Last Updated</Table.Th>
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
                          No PPE register entries yet.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    records.map((record) => (
                      <Table.Tr key={record._id}>
                        <Table.Td>{record.contractorName}</Table.Td>
                        <Table.Td>{record.site?.name || '—'}</Table.Td>
                        <Table.Td>{record.entries?.length || 0}</Table.Td>
                        <Table.Td>{formatDate(record.updatedAt)}</Table.Td>
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
        title={editingId ? 'Edit PPE Register' : 'Issue / Update PPE'}
        size="90%"
        centered
        overlayProps={{ blur: 3 }}
      >
        <ScrollArea h="70vh">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="xl" p="sm">
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                <Controller
                  control={control}
                  name="contractorName"
                  rules={{ required: 'Contractor name is required' }}
                  render={({ field }) => (
                    <TextInput {...field} label="Contractor Name" placeholder="Enter contractor" error={errors.contractorName?.message} />
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
                      <Table.Th style={{ width: 80 }}>Sr. No</Table.Th>
                      <Table.Th style={{ width: 140 }}>Date</Table.Th>
                      {PPE_COLUMNS.map((column) => (
                        <Table.Th key={column.key}>{column.label}</Table.Th>
                      ))}
                      <Table.Th>Remarks</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {fields.map((field, index) => (
                      <Table.Tr key={field.id}>
                        <Table.Td>{index + 1}</Table.Td>
                        <Table.Td>
                          <Controller
                            control={control}
                            name={`entries.${index}.date` as const}
                            render={({ field: dateField }) => (
                              <DateInput value={dateField.value} onChange={dateField.onChange} clearable />
                            )}
                          />
                        </Table.Td>
                        {PPE_COLUMNS.map((column) => (
                          <Table.Td key={column.key}>
                            <Controller
                              control={control}
                              name={`entries.${index}.${column.key}` as const}
                              render={({ field: numField }) => (
                                <NumberInput
                                  value={numField.value}
                                  onChange={(value) => numField.onChange(value || 0)}
                                  min={0}
                                  clampBehavior="strict"
                                />
                              )}
                            />
                          </Table.Td>
                        ))}
                        <Table.Td>
                          <Controller
                            control={control}
                            name={`entries.${index}.remarks` as const}
                            render={({ field: remarkField }) => (
                              <Textarea {...remarkField} minRows={1} autosize />
                            )}
                          />
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>

              <Group justify="space-between">
                <Button variant="default" onClick={() => setModalOpened(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={submitting}>
                  {editingId ? 'Update Register' : 'Save Register'}
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
        title="PPE Register"
        size="90%"
        centered
        keepMounted
      >
        {selectedRecord ? (
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Contractor
                </Text>
                <Text fw={600}>{selectedRecord.contractorName}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Site
                </Text>
                <Text fw={600}>{selectedRecord.site?.name || '—'}</Text>
              </Card>
            </SimpleGrid>

            <ScrollArea h={320}>
              <Table withTableBorder striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Sr. No</Table.Th>
                    <Table.Th>Date</Table.Th>
                    {PPE_COLUMNS.map((column) => (
                      <Table.Th key={column.key}>{column.label}</Table.Th>
                    ))}
                    <Table.Th>Remarks</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {(selectedRecord.entries || []).map((entry, index) => (
                    <Table.Tr key={index}>
                      <Table.Td>{index + 1}</Table.Td>
                      <Table.Td>{formatDate(entry?.date)}</Table.Td>
                      {PPE_COLUMNS.map((column) => (
                        <Table.Td key={`${index}-${column.key}`}>{entry?.[column.key as keyof typeof entry] ?? 0}</Table.Td>
                      ))}
                      <Table.Td>{entry?.remarks || '—'}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            <Card withBorder radius="md" padding="md" shadow="xs">
              <Stack gap="xs">
                <Text fw={600}>Totals</Text>
                <Group gap="xs" wrap="wrap">
                  {PPE_COLUMNS.map((column) => (
                    <Badge key={column.key} color="blue" variant="light">
                      {column.label}: {sumColumn(selectedRecord.entries || [], column.key)}
                    </Badge>
                  ))}
                </Group>
              </Stack>
            </Card>
          </Stack>
        ) : null}
      </Modal>
    </EhsPageLayout>
  );
};

export default PpeRegisterPage;
