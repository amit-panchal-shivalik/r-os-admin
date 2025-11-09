import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Card,
  Group,
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
import { useSafetyViolationDebitNotes, SafetyViolationDebitNoteRecord } from '@/hooks/useSafetyViolationDebitNotes';
import { SafetyViolationDebitNotePayload } from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';
import logo from '@/assets/ehs/Logo.jpeg';

const formatCurrency = (amount?: number, currency = 'INR') => {
  if (amount === undefined || amount === null || Number.isNaN(Number(amount))) return '—';
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    return `${currency} ${amount}`;
  }
};

type DebitNoteFormValues = {
  noteNumber: string;
  date: Date | null;
  time: string;
  amount: number | null;
  companyOrStaff: string;
  subContractor: string;
  siteId?: string;
  site: string;
  location: string;
  violationNote: string;
  additionalNotes: string;
  responsiblePerson: string;
  contractorRepresentative: string;
  safetyOfficer: string;
  projectManager: string;
};

const DEFAULT_VALUES: DebitNoteFormValues = {
  noteNumber: '',
  date: new Date(),
  time: dayjs().format('HH:mm'),
  amount: null,
  companyOrStaff: '',
  subContractor: '',
  siteId: undefined,
  site: '',
  location: '',
  violationNote: '',
  additionalNotes: '',
  responsiblePerson: '',
  contractorRepresentative: '',
  safetyOfficer: '',
  projectManager: '',
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dayjs(date).format('DD/MM/YYYY');
};

const buildPrintHtml = (record: SafetyViolationDebitNoteRecord) => {
  const dateLabel = formatDate(record.date);
  const timeLabel = record.time || '';
  const amountLabel = formatCurrency(record.amount, record.currency);
  const company = record.companyOrStaff ?? '';
  const subContractor = record.subContractor ?? '';
  const site = record.site ?? record.siteSnapshot?.name ?? '';
  const location = record.location ?? record.siteSnapshot?.location ?? '';

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Safety Violation Debit Note</title>
        <style>
          body { font-family: 'Arial', sans-serif; margin: 0; padding: 24px; background: #fff; color: #000; }
          .sheet { border: 2px solid #d0d0d0; padding: 24px; }
          .header { display: grid; grid-template-columns: 2fr 3fr 1.2fr; gap: 12px; align-items: stretch; margin-bottom: 24px; }
          .logo { border: 1px solid #000; display: flex; align-items: center; justify-content: center; padding: 12px; background: #fff; }
          .title { border: 1px solid #000; background: #f5f5f5; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 600; text-transform: uppercase; }
          .meta { border: 1px solid #000; background: #f5f5f5; padding: 12px; font-size: 12px; line-height: 1.5; }
          .body { font-size: 14px; line-height: 1.6; }
          .body strong { font-weight: 700; }
          .line { display: block; border-bottom: 1px dotted #000; margin-top: 4px; margin-bottom: 12px; }
          .signature-row { display: flex; justify-content: space-between; margin-top: 48px; font-weight: 600; }
          .signature-col { width: 32%; }
          .spacing { margin: 12px 0; }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="header">
            <div class="logo"><img src="${logo}" alt="Shivalik" style="max-height:60px;max-width:140px;object-fit:contain;" /></div>
            <div class="title">Debit Note</div>
            <div class="meta">
              <div>Format No.: EHS-F-16</div>
              <div>Rev. No.: 00</div>
            </div>
          </div>

          <div style="text-align:right;font-size:14px;margin-bottom:24px;">
            <div>Date: ${dateLabel}</div>
            <div>Time: ${timeLabel}</div>
          </div>

          <div class="body">
            <p>To,</p>
            <p><strong>Account Department / HR</strong><br />
            <strong>Shivalik Group,</strong></p>

            <p>Sub: - Amount of Rs <strong>${record.amount ?? ''}</strong> /- Debit from his/her bill or salary for safety violation.</p>

            <p><strong>Name of Company or Staff:</strong><br />${company || '____________________________'}</p>

            <p><strong>Name of Sub-Contractor (If any):</strong><br />${subContractor || '____________________________'}</p>

            <p><strong>Site & Location:</strong><br />${[site, location].filter(Boolean).join(' - ') || '____________________________'}</p>

            <p><strong>Activity / Violation Note:</strong></p>
            <p>${(record.violationNote || '').replace(/\n/g, '<br />')}</p>

            ${record.additionalNotes ? `<p>${record.additionalNotes.replace(/\n/g, '<br />')}</p>` : ''}

            <div class="signature-row">
              <div class="signature-col">
                Contractor/Contractor responsible person:<br />
                <div class="line">${record.contractorRepresentative || ''}</div>
              </div>
              <div class="signature-col">
                Signature of Safety Officer:<br />
                <div class="line">${record.safetyOfficer || ''}</div>
              </div>
              <div class="signature-col">
                Signature of Project Manager:<br />
                <div class="line">${record.projectManager || ''}</div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return html;
};

const SafetyViolationDebitNotePage = () => {
  const { can, loading: permissionsLoading, roles } = usePermissions();
  const { sites, loading: sitesLoading } = useSites();
  const { records, loading, fetchDebitNotes, createDebitNote, updateDebitNote } = useSafetyViolationDebitNotes({ limit: 50 });

  const [formOpened, setFormOpened] = useState(false);
  const [viewOpened, setViewOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SafetyViolationDebitNoteRecord | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = roles.includes('SuperAdmin');
  const canView = isSuperAdmin || can('SafetyViolationDebitNote', 'view') || roles.length === 0;
  const canCreate = isSuperAdmin || can('SafetyViolationDebitNote', 'add') || roles.length === 0;
  const canEdit = isSuperAdmin || can('SafetyViolationDebitNote', 'edit');

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DebitNoteFormValues>({ defaultValues: DEFAULT_VALUES });

  const watchedSiteId = watch('siteId');

  useEffect(() => {
    if (!permissionsLoading && canView) {
      fetchDebitNotes().catch(() => undefined);
    }
  }, [permissionsLoading, canView, fetchDebitNotes]);

  useEffect(() => {
    if (!watchedSiteId) return;
    const site = sites.find((item) => item._id === watchedSiteId);
    if (site) {
      setValue('site', site.name ?? '', { shouldDirty: true });
      setValue('location', site.location ?? '', { shouldDirty: true });
    }
  }, [watchedSiteId, sites, setValue]);

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
      showMessage('You do not have permission to raise debit notes', 'error');
      return;
    }
    reset(DEFAULT_VALUES);
    setEditingId(null);
    setFormOpened(true);
  };

  const handleEdit = (record: SafetyViolationDebitNoteRecord) => {
    if (!canEdit) {
      showMessage('You do not have permission to edit debit notes', 'error');
      return;
    }
    setEditingId(record._id);
    setFormOpened(true);
    reset({
      noteNumber: record.noteNumber ?? '',
      date: record.date ? new Date(record.date) : null,
      time: record.time ?? '',
      amount: typeof record.amount === 'number' ? record.amount : null,
      companyOrStaff: record.companyOrStaff ?? '',
      subContractor: record.subContractor ?? '',
      siteId: record.siteSnapshot?.id ?? undefined,
      site: record.site ?? record.siteSnapshot?.name ?? '',
      location: record.location ?? record.siteSnapshot?.location ?? '',
      violationNote: record.violationNote ?? '',
      additionalNotes: record.additionalNotes ?? '',
      responsiblePerson: record.responsiblePerson ?? '',
      contractorRepresentative: record.contractorRepresentative ?? '',
      safetyOfficer: record.safetyOfficer ?? '',
      projectManager: record.projectManager ?? '',
    });
  };

  const handleView = (record: SafetyViolationDebitNoteRecord) => {
    setSelectedRecord(record);
    setViewOpened(true);
  };

  const handlePrint = useCallback((record?: SafetyViolationDebitNoteRecord) => {
    const target = record || selectedRecord;
    if (!target) {
      showMessage('Select a debit note to print', 'info');
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

  const onSubmit = async (values: DebitNoteFormValues) => {
    if (!values.date) {
      showMessage('Please provide a debit note date', 'error');
      return;
    }
    if (values.amount === null || values.amount === undefined) {
      showMessage('Please enter debit amount', 'error');
      return;
    }

    const payload: SafetyViolationDebitNotePayload = {
      noteNumber: values.noteNumber || undefined,
      date: values.date.toISOString(),
      time: values.time || undefined,
      amount: values.amount,
      companyOrStaff: values.companyOrStaff,
      subContractor: values.subContractor || undefined,
      site: values.site || undefined,
      location: values.location || undefined,
      violationNote: values.violationNote || undefined,
      additionalNotes: values.additionalNotes || undefined,
      responsiblePerson: values.responsiblePerson || undefined,
      contractorRepresentative: values.contractorRepresentative || undefined,
      safetyOfficer: values.safetyOfficer || undefined,
      projectManager: values.projectManager || undefined,
      siteId: values.siteId || undefined,
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await updateDebitNote(editingId, payload);
      } else {
        await createDebitNote(payload);
      }
      await fetchDebitNotes();
      setFormOpened(false);
      setEditingId(null);
      reset(DEFAULT_VALUES);
    } catch (error: any) {
      showMessage(error?.message ?? 'Unable to save debit note', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EhsPageLayout
      title="Safety Violation Debit Note"
      description="Issue and track debit notes raised against contractors or staff for safety violations."
      actions={
        <Group>
          <Button
            variant="light"
            color="gray"
            leftSection={<IconRefresh size={16} />}
            onClick={() => fetchDebitNotes()}
            loading={loading}
          >
            Refresh
          </Button>
          {canCreate ? (
            <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
              Raise Debit Note
            </Button>
          ) : null}
        </Group>
      }
    >
      {permissionsLoading ? (
        <Group justify="center" py="xl">
          <Text c="dimmed">Loading permissions...</Text>
        </Group>
      ) : !canView ? (
        <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />} title="Access restricted">
          You do not have permission to view safety violation debit notes.
        </Alert>
      ) : (
        <Stack gap="lg">
          <Card withBorder radius="md" padding="lg" shadow="sm">
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <div>
                  <Text size="sm" c="dimmed">
                    Debit notes issued: {records.length}
                  </Text>
                </div>
              </Group>
              <ScrollArea>
                <Table highlightOnHover striped withColumnBorders>
                  <thead>
                    <tr>
                      <th>Debit Note</th>
                      <th>Date</th>
                      <th>Company / Staff</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length ? (
                      records.map((record) => (
                        <tr key={record._id}>
                          <td>{record.noteNumber || '—'}</td>
                          <td>{formatDate(record.date)}</td>
                          <td>{record.companyOrStaff || '—'}</td>
                          <td>{formatCurrency(record.amount)}</td>
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
                            No debit notes have been recorded yet.
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
              <Group justify="space-between" mb="md">
                <Text fw={600}>Debit note summary</Text>
                <Group gap="sm">
                  <Button variant="light" color="gray" leftSection={<IconPrinter size={16} />} onClick={() => handlePrint(selectedRecord)}>
                    Print
                  </Button>
                  <Button variant="default" onClick={() => setSelectedRecord(null)}>
                    Close
                  </Button>
                </Group>
              </Group>
              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" mb="md">
                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Text size="sm" c="dimmed">
                    Note Number
                  </Text>
                  <Text fw={600}>{selectedRecord.noteNumber || '—'}</Text>
                </Card>
                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Text size="sm" c="dimmed">
                    Date
                  </Text>
                  <Text fw={600}>{formatDate(selectedRecord.date)}</Text>
                </Card>
                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Text size="sm" c="dimmed">
                    Amount
                  </Text>
                  <Text fw={600}>{formatCurrency(selectedRecord.amount)}</Text>
                </Card>
              </SimpleGrid>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Stack gap={8}>
                  <Text size="sm" c="dimmed">Company / Staff</Text>
                  <Text fw={500}>{selectedRecord.companyOrStaff || '—'}</Text>
                  <Text size="sm" c="dimmed">Sub-Contractor</Text>
                  <Text fw={500}>{selectedRecord.subContractor || '—'}</Text>
                  <Text size="sm" c="dimmed">Site & Location</Text>
                  <Text fw={500}> {[selectedRecord.site || selectedRecord.siteSnapshot?.name, selectedRecord.location || selectedRecord.siteSnapshot?.location].filter(Boolean).join(' - ') || '—'}</Text>
                </Stack>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs" mt="md">
                <Text size="sm" c="dimmed">Violation note</Text>
                <Text>{selectedRecord.violationNote || '—'}</Text>
              </Card>
              {selectedRecord.additionalNotes ? (
                <Card withBorder radius="md" padding="md" shadow="xs" mt="md">
                  <Text size="sm" c="dimmed">Additional notes</Text>
                  <Text>{selectedRecord.additionalNotes}</Text>
                </Card>
              ) : null}
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
        size="80%"
        radius="md"
        title={editingId ? 'Edit Debit Note' : 'Raise Debit Note'}
        overlayProps={{ blur: 3 }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea offsetScrollbars h="70vh">
            <Stack gap="lg" py="xs">
              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Stack gap="md">
                  <Text fw={600}>Debit note details</Text>
                  <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                    <TextInput label="Debit note number" placeholder="DN/2025/01" {...register('noteNumber')} />
                    <Controller
                      control={control}
                      name="date"
                      rules={{ required: 'Date is required' }}
                      render={({ field }) => (
                        <DateInput
                          label="Date"
                          value={field.value}
                          onChange={field.onChange}
                          valueFormat="DD MMM YYYY"
                          error={errors.date ? 'Date required' : undefined}
                        />
                      )}
                    />
                    <TextInput label="Time" placeholder="HH:MM" {...register('time')} />
                    <Controller
                      control={control}
                      name="amount"
                      rules={{ required: 'Amount is required' }}
                      render={({ field }) => (
                        <NumberInput
                          label="Amount (₹)"
                          value={field.value ?? undefined}
                          min={0}
                          thousandSeparator="," 
                          decimalSeparator="."
                          onChange={(value) => field.onChange(typeof value === 'number' ? value : null)}
                          error={errors.amount ? 'Enter amount' : undefined}
                        />
                      )}
                    />
                  </SimpleGrid>
                </Stack>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Stack gap="md">
                  <Text fw={600}>Parties</Text>
                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    <TextInput
                      label="Company / Staff"
                      placeholder="Name of company or staff"
                      {...register('companyOrStaff', { required: 'Required' })}
                      error={errors.companyOrStaff?.message}
                    />
                    <TextInput label="Sub-Contractor (if any)" placeholder="Sub-contractor name" {...register('subContractor')} />
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
                          nothingFoundMessage="No site found"
                        />
                      )}
                    />
                    <TextInput label="Site" placeholder="Site name" {...register('site')} />
                    <TextInput label="Location" placeholder="Site location" {...register('location')} />
                  </SimpleGrid>
                </Stack>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Stack gap="md">
                  <Text fw={600}>Violation details</Text>
                  <Textarea label="Violation note" placeholder="Describe the safety violation" minRows={4} autosize {...register('violationNote')} />
                  <Textarea label="Additional notes" placeholder="Any additional remarks" minRows={3} autosize {...register('additionalNotes')} />
                </Stack>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Stack gap="md">
                  <Text fw={600}>Signatories</Text>
                  <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
                    <TextInput label="Contractor responsible person" placeholder="Name" {...register('contractorRepresentative')} />
                    <TextInput label="Safety officer" placeholder="Safety officer name" {...register('safetyOfficer')} />
                    <TextInput label="Project manager" placeholder="Project manager name" {...register('projectManager')} />
                  </SimpleGrid>
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
                  {editingId ? 'Update debit note' : 'Save debit note'}
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
        size="80%"
        radius="md"
        title="Debit note preview"
        overlayProps={{ blur: 3 }}
      >
        {selectedRecord ? (
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={600}>{selectedRecord.noteNumber || 'Debit note'}</Text>
              <Group gap="sm">
                <Button variant="light" color="gray" leftSection={<IconPrinter size={16} />} onClick={() => handlePrint(selectedRecord)}>
                  Print
                </Button>
                <Button variant="default" onClick={() => setViewOpened(false)}>
                  Close
                </Button>
              </Group>
            </Group>
            <Box style={{ border: '1px solid #d6d6d6', borderRadius: 8, padding: 16, background: '#fff' }}>
              <Text fw={600}>Date: {formatDate(selectedRecord.date)}</Text>
              <Text fw={600}>Time: {selectedRecord.time || '—'}</Text>
              <Text mt="sm">Amount: {formatCurrency(selectedRecord.amount)}</Text>
              <Text mt="sm">Company / Staff: {selectedRecord.companyOrStaff || '—'}</Text>
              <Text mt="sm">Sub-Contractor: {selectedRecord.subContractor || '—'}</Text>
              <Text mt="sm">Site & Location: {[selectedRecord.site || selectedRecord.siteSnapshot?.name, selectedRecord.location || selectedRecord.siteSnapshot?.location].filter(Boolean).join(' - ') || '—'}</Text>
              <Text mt="sm" fw={600}>Violation note</Text>
              <Text>{selectedRecord.violationNote || '—'}</Text>
              {selectedRecord.additionalNotes ? (
                <>
                  <Text mt="sm" fw={600}>Additional notes</Text>
                  <Text>{selectedRecord.additionalNotes}</Text>
                </>
              ) : null}
            </Box>
          </Stack>
        ) : null}
      </Modal>
    </EhsPageLayout>
  );
};

export default SafetyViolationDebitNotePage;
