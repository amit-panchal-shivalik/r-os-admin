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
import { useEhsCommitteeMoms } from '@/hooks/useEhsCommitteeMoms';
import { EhsCommitteeMomPayload } from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';
import logo from '@/assets/ehs/Logo.jpeg';

const AGENDA_TITLES = [
  'Pending points of last EHS committee meeting',
  'Unsafe conditions, locations and equipments on the site',
  'Availability, condition & usage of PPEs',
  'Level of implementation of operational controls including work permit',
  'Compliance to EHS requirements by external agencies / contractors working on site',
  'Incidents (Accidents/ First Aid / Near-Miss) cases reported and investigation',
  'Abnormal findings in survey visit',
  'Safety Trainings of employees/ compliance & effectiveness',
  'Key changes (implemented or proposed) in the org. that affects safety risk level',
  'Rewards and recognition to the employees',
  'Review of employee’s suggestions',
  'Compliance to Legal and other requirements',
  'Any other points of relevant',
];

const createParticipant = () => ({
  name: '',
  designation: '',
});

const createAgenda = (title: string) => ({
  title,
  discussion: '',
  responsible: '',
  targetDate: '',
});

type ParticipantFormValue = ReturnType<typeof createParticipant>;

type AgendaFormValue = ReturnType<typeof createAgenda>;

type MomFormValues = {
  siteId?: string;
  nameOfMeeting: string;
  meetingNumber: string;
  meetingDate: Date | null;
  financialYear: string;
  membersPresent: ParticipantFormValue[];
  membersAbsent: ParticipantFormValue[];
  agendaItems: AgendaFormValue[];
  preparedBy: string;
  projectInChargeSign: string;
  notes: string;
};

const DEFAULT_VALUES: MomFormValues = {
  siteId: undefined,
  nameOfMeeting: 'Safety Committee Meeting',
  meetingNumber: '',
  meetingDate: new Date(),
  financialYear: dayjs().format('YYYY-YY'),
  membersPresent: Array.from({ length: 10 }).map(() => createParticipant()),
  membersAbsent: Array.from({ length: 10 }).map(() => createParticipant()),
  agendaItems: AGENDA_TITLES.map((title) => createAgenda(title)),
  preparedBy: '',
  projectInChargeSign: '',
  notes: '',
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dayjs(date).format('DD/MM/YYYY');
};

const buildPrintHtml = (record: any) => {
  const presentRows = [...(record.membersPresent || [])];
  const absentRows = [...(record.membersAbsent || [])];
  while (presentRows.length < 10) presentRows.push({});
  while (absentRows.length < 10) absentRows.push({});

  const agendaRowsPage1 = (record.agendaItems || []).slice(0, 7);
  const agendaRowsPage2 = (record.agendaItems || []).slice(7);

  const renderAgenda = (rows: any[]) =>
    rows
      .map(
        (item: any, index: number) => `
        <tr>
          <td style="border:1px solid #000;padding:6px;text-align:center;width:50px;">${item.order ?? index + 1}</td>
          <td style="border:1px solid #000;padding:6px;">${item.title ?? ''}</td>
          <td style="border:1px solid #000;padding:6px;min-height:80px;">${item.discussion ?? ''}</td>
          <td style="border:1px solid #000;padding:6px;width:120px;">${item.responsible ?? ''}</td>
          <td style="border:1px solid #000;padding:6px;width:120px;">${item.targetDate ?? ''}</td>
        </tr>`
      )
      .join('');

  const pageHeader = `
    <div class="header">
      <div class="logo"><img src="${logo}" alt="Shivalik" style="max-width:150px;max-height:60px;object-fit:contain;" /></div>
      <div class="title">Minutes of Safety Committee Meeting</div>
      <div class="meta">
        <div>Format No.: EHS-F-25</div>
        <div>Rev. No.: 00</div>
      </div>
    </div>`;

  const firstPage = `
    <div class="sheet">
      ${pageHeader}
      <table class="info-table">
        <tr>
          <td colspan="2">Name of Meeting</td>
          <td colspan="2">${record.nameOfMeeting ?? ''}</td>
          <td colspan="2">Meeting No.</td>
          <td colspan="2">${record.meetingNumber ?? ''}</td>
        </tr>
        <tr>
          <td colspan="2">Date of Meeting</td>
          <td colspan="2">${formatDate(record.meetingDate)}</td>
          <td colspan="2">Financial Year</td>
          <td colspan="2">${record.financialYear ?? ''}</td>
        </tr>
      </table>

      <div class="two-column">
        <table>
          <thead>
            <tr><th colspan="2">Members Present</th></tr>
          </thead>
          <tbody>
            ${presentRows
              .map(
                (member: any, index: number) => `
                <tr>
                  <td style="border:1px solid #000;padding:6px;width:40px;">${index + 1}</td>
                  <td style="border:1px solid #000;padding:6px;">${member.name ?? ''}${member.designation ? `, ${member.designation}` : ''}</td>
                </tr>`
              )
              .join('')}
          </tbody>
        </table>
        <table>
          <thead>
            <tr><th colspan="2">Members Absent</th></tr>
          </thead>
          <tbody>
            ${absentRows
              .map(
                (member: any, index: number) => `
                <tr>
                  <td style="border:1px solid #000;padding:6px;width:40px;">${index + 1}</td>
                  <td style="border:1px solid #000;padding:6px;">${member.name ?? ''}${member.designation ? `, ${member.designation}` : ''}</td>
                </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <div class="agenda-header">Agenda of the EHS committee meeting</div>
      <table class="agenda-table">
        ${AGENDA_TITLES.map(
          (title, index) =>
            `<tr><td style="border:1px solid #000;padding:6px;width:40px;text-align:center;">${index + 1}.</td><td style="border:1px solid #000;padding:6px;">${title}</td></tr>`
        ).join('')}
      </table>

      <div class="agenda-header">Minutes of meeting</div>
      <table class="minutes-table">
        <thead>
          <tr>
            <th>Sr. No.</th>
            <th>Agenda</th>
            <th>Discussion and action planned</th>
            <th>Resp.</th>
            <th>Target date</th>
          </tr>
        </thead>
        <tbody>
          ${renderAgenda(agendaRowsPage1)}
        </tbody>
      </table>
    </div>`;

  const secondPage = `
    <div class="sheet">
      ${pageHeader}
      <table class="minutes-table">
        <thead>
          <tr>
            <th>Sr. No.</th>
            <th>Agenda</th>
            <th>Discussion and action planned</th>
            <th>Resp.</th>
            <th>Target date</th>
          </tr>
        </thead>
        <tbody>
          ${renderAgenda(agendaRowsPage2)}
        </tbody>
      </table>
      <table class="sign-table">
        <tr>
          <td>Prepared by</td>
          <td>${record.preparedBy ?? ''}</td>
        </tr>
        <tr>
          <td>Project In Charge Sign:</td>
          <td>${record.projectInChargeSign ?? ''}</td>
        </tr>
      </table>
      <div class="notes">${record.notes ?? ''}</div>
    </div>`;

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Minutes of Safety Committee Meeting</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #fff; color: #000; }
          .sheet { border: 2px solid #000; padding: 16px; page-break-after: always; }
          .sheet:last-child { page-break-after: auto; }
          .header { display: grid; grid-template-columns: 2fr 3fr 1.2fr; gap: 12px; align-items: stretch; margin-bottom: 16px; }
          .logo { border:1px solid #000; display:flex; align-items:center; justify-content:center; padding:12px; background:#fff; }
          .title { border:1px solid #000; background:#f3f3f3; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:700; }
          .meta { border:1px solid #000; background:#f3f3f3; padding:12px; font-size:12px; line-height:1.4; }
          table { border-collapse: collapse; width: 100%; font-size: 12px; }
          th, td { border: 1px solid #000; padding: 6px; }
          th { background: #f3f3f3; }
          .info-table td { width: 12.5%; }
          .two-column { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 16px 0; }
          .agenda-header { font-weight: 600; margin-top: 12px; margin-bottom: 4px; }
          .minutes-table td { min-height: 60px; }
          .sign-table { margin-top: 16px; }
          .notes { margin-top: 12px; min-height: 100px; border: 1px solid #000; padding: 10px; }
        </style>
      </head>
      <body>
        ${firstPage}
        ${secondPage}
      </body>
    </html>
  `;

  return html;
};

const EhsCommitteeMomPage = () => {
  const { can, loading: permissionsLoading, roles } = usePermissions();
  const { sites, loading: sitesLoading } = useSites();
  const { records, loading, fetchMoms, createMom, updateMom } = useEhsCommitteeMoms({ limit: 50 });

  const [formOpened, setFormOpened] = useState(false);
  const [viewOpened, setViewOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = roles.includes('SuperAdmin');
  const canView = isSuperAdmin || can('EhsCommitteeMom', 'view') || roles.length === 0;
  const canCreate = isSuperAdmin || can('EhsCommitteeMom', 'add') || roles.length === 0;
  const canEdit = isSuperAdmin || can('EhsCommitteeMom', 'edit');

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MomFormValues>({ defaultValues: DEFAULT_VALUES });

  const membersPresentArray = useFieldArray({ control, name: 'membersPresent' });
  const membersAbsentArray = useFieldArray({ control, name: 'membersAbsent' });
  const agendaArray = useFieldArray({ control, name: 'agendaItems' });

  const watchedSiteId = watch('siteId');

  useEffect(() => {
    if (!permissionsLoading && canView) {
      fetchMoms().catch(() => undefined);
    }
  }, [permissionsLoading, canView, fetchMoms]);

  useEffect(() => {
    if (!watchedSiteId) return;
    const site = sites.find((item) => item._id === watchedSiteId);
    if (site && !watch('meetingNumber')) {
      setValue('meetingNumber', `${dayjs().format('YYYY')}/${site.code ?? ''}`, { shouldDirty: false });
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
      showMessage('You do not have permission to record minutes', 'error');
      return;
    }
    reset(DEFAULT_VALUES);
    membersPresentArray.replace(DEFAULT_VALUES.membersPresent);
    membersAbsentArray.replace(DEFAULT_VALUES.membersAbsent);
    agendaArray.replace(DEFAULT_VALUES.agendaItems);
    setEditingId(null);
    setFormOpened(true);
  };

  const ensureRows = <T,>(rows: T[], createRow: () => T, length: number) => {
    const cloned = [...rows];
    while (cloned.length < length) cloned.push(createRow());
    return cloned;
  };

  const handleEdit = (record: any) => {
    if (!canEdit) {
      showMessage('You do not have permission to edit minutes', 'error');
      return;
    }
    setEditingId(record._id);
    reset({
      siteId: record.siteSnapshot?.id ?? undefined,
      nameOfMeeting: record.nameOfMeeting ?? 'Safety Committee Meeting',
      meetingNumber: record.meetingNumber ?? '',
      meetingDate: record.meetingDate ? new Date(record.meetingDate) : new Date(),
      financialYear: record.financialYear ?? dayjs().format('YYYY-YY'),
      membersPresent: ensureRows(record.membersPresent || [], createParticipant, 10),
      membersAbsent: ensureRows(record.membersAbsent || [], createParticipant, 10),
      agendaItems: ensureRows(record.agendaItems || [], () => createAgenda(''), 13).map((agenda: any, index: number) => ({
        title: agenda.title || AGENDA_TITLES[index] || '',
        discussion: agenda.discussion ?? '',
        responsible: agenda.responsible ?? '',
        targetDate: agenda.targetDate ?? '',
      })),
      preparedBy: record.preparedBy ?? '',
      projectInChargeSign: record.projectInChargeSign ?? '',
      notes: record.notes ?? '',
    });
    membersPresentArray.replace(ensureRows(record.membersPresent || [], createParticipant, 10));
    membersAbsentArray.replace(ensureRows(record.membersAbsent || [], createParticipant, 10));
    agendaArray.replace(
      ensureRows(record.agendaItems || [], () => createAgenda(''), 13).map((agenda: any, index: number) => ({
        title: agenda.title || AGENDA_TITLES[index] || '',
        discussion: agenda.discussion ?? '',
        responsible: agenda.responsible ?? '',
        targetDate: agenda.targetDate ?? '',
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
      showMessage('Select minutes to print', 'info');
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

  const onSubmit = async (values: MomFormValues) => {
    const payload: EhsCommitteeMomPayload = {
      siteId: values.siteId || undefined,
      nameOfMeeting: values.nameOfMeeting || undefined,
      meetingNumber: values.meetingNumber || undefined,
      meetingDate: values.meetingDate ? values.meetingDate.toISOString() : undefined,
      financialYear: values.financialYear || undefined,
      membersPresent: values.membersPresent.map((member) => ({
        name: member.name,
        designation: member.designation || undefined,
      })),
      membersAbsent: values.membersAbsent.map((member) => ({
        name: member.name,
        designation: member.designation || undefined,
      })),
      agendaItems: values.agendaItems.map((item) => ({
        title: item.title,
        discussion: item.discussion || undefined,
        responsible: item.responsible || undefined,
        targetDate: item.targetDate || undefined,
      })),
      preparedBy: values.preparedBy || undefined,
      projectInChargeSign: values.projectInChargeSign || undefined,
      notes: values.notes || undefined,
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await updateMom(editingId, payload);
      } else {
        await createMom(payload);
      }
      await fetchMoms();
      setFormOpened(false);
      setEditingId(null);
      reset(DEFAULT_VALUES);
      membersPresentArray.replace(DEFAULT_VALUES.membersPresent);
      membersAbsentArray.replace(DEFAULT_VALUES.membersAbsent);
      agendaArray.replace(DEFAULT_VALUES.agendaItems);
    } catch (error: any) {
      showMessage(error?.message ?? 'Unable to save minutes', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EhsPageLayout
      title="EHS Committee Meeting - Minutes"
      description="Document agenda, deliberations, and action items from safety committee meetings."
      actions={
        <Group>
          <Button
            variant="light"
            color="gray"
            leftSection={<IconRefresh size={16} />}
            onClick={() => fetchMoms()}
            loading={loading}
          >
            Refresh
          </Button>
          {canCreate ? (
            <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
              Record Meeting Minutes
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
          You do not have permission to view committee minutes.
        </Alert>
      ) : (
        <Stack gap="lg">
          <Card withBorder radius="md" padding="lg" shadow="sm">
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <Text size="sm" c="dimmed">
                  Meetings recorded: {records.length}
                </Text>
              </Group>
              <ScrollArea>
                <Table highlightOnHover striped withColumnBorders>
                  <thead>
                    <tr>
                      <th>Meeting</th>
                      <th>Date</th>
                      <th>Site</th>
                      <th>Prepared by</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length ? (
                      records.map((record) => (
                        <tr key={record._id}>
                          <td>{record.meetingNumber || '—'}</td>
                          <td>{formatDate(record.meetingDate)}</td>
                          <td>{record.siteSnapshot?.name || '—'}</td>
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
                            No meeting records captured.
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
                <Text fw={600}>Meeting Preview</Text>
                <Group gap="sm">
                  <Button variant="light" color="gray" leftSection={<IconPrinter size={16} />} onClick={() => handlePrint(selectedRecord)}>
                    Print
                  </Button>
                  <Button variant="default" onClick={() => setSelectedRecord(null)}>
                    Close
                  </Button>
                </Group>
              </Group>
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Text size="sm" c="dimmed">
                    Meeting No.
                  </Text>
                  <Text fw={600}>{selectedRecord.meetingNumber || '—'}</Text>
                </Card>
                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Text size="sm" c="dimmed">
                    Date
                  </Text>
                  <Text fw={600}>{formatDate(selectedRecord.meetingDate)}</Text>
                </Card>
              </SimpleGrid>
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mt="md">
                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Text size="sm" c="dimmed">
                    Members present
                  </Text>
                  <Text>{(selectedRecord.membersPresent || []).map((member: any) => member.name).filter(Boolean).join(', ') || '—'}</Text>
                </Card>
                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Text size="sm" c="dimmed">
                    Members absent
                  </Text>
                  <Text>{(selectedRecord.membersAbsent || []).map((member: any) => member.name).filter(Boolean).join(', ') || '—'}</Text>
                </Card>
              </SimpleGrid>
              <ScrollArea h={260} mt="md">
                <Table withColumnBorders striped>
                  <thead>
                    <tr>
                      <th>Agenda</th>
                      <th>Discussion & action planned</th>
                      <th>Resp.</th>
                      <th>Target date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRecord.agendaItems?.length ? (
                      selectedRecord.agendaItems.map((item: any, index: number) => (
                        <tr key={`${item.title}-${index}`}>
                          <td>{item.title || `Agenda ${index + 1}`}</td>
                          <td>{item.discussion || '—'}</td>
                          <td>{item.responsible || '—'}</td>
                          <td>{item.targetDate || '—'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4}>
                          <Text size="sm" c="dimmed" ta="center">
                            No agenda items.
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
        title={editingId ? 'Edit Meeting Minutes' : 'Record Meeting Minutes'}
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
                  <TextInput label="Name of Meeting" placeholder="Safety Committee Meeting" {...register('nameOfMeeting')} />
                  <TextInput label="Meeting Number" placeholder="EHS/2025/01" {...register('meetingNumber')} />
                  <Controller
                    control={control}
                    name="meetingDate"
                    rules={{ required: 'Meeting date required' }}
                    render={({ field }) => (
                      <DateInput
                        label="Meeting Date"
                        value={field.value}
                        onChange={field.onChange}
                        valueFormat="DD MMM YYYY"
                        error={errors.meetingDate?.message}
                      />
                    )}
                  />
                  <TextInput label="Financial Year" placeholder="2024-25" {...register('financialYear')} />
                  <TextInput label="Prepared by" placeholder="Secretary" {...register('preparedBy')} />
                  <TextInput label="Project In Charge Sign" placeholder="Signature" {...register('projectInChargeSign')} />
                </SimpleGrid>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                  <Stack gap="sm">
                    <Text fw={600}>Members Present</Text>
                    <ScrollArea h={260} offsetScrollbars>
                      <Table withColumnBorders>
                        <thead>
                          <tr>
                            <th style={{ width: 50 }}>Sr</th>
                            <th>Name</th>
                            <th>Designation</th>
                            <th style={{ width: 40 }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {membersPresentArray.fields.map((field, index) => (
                            <tr key={field.id}>
                              <td>{index + 1}</td>
                              <td>
                                <TextInput
                                  placeholder="Member name"
                                  {...register(`membersPresent.${index}.name` as const, {
                                    required: 'Required',
                                  })}
                                  error={errors.membersPresent?.[index]?.name?.message}
                                />
                              </td>
                              <td>
                                <TextInput placeholder="Designation" {...register(`membersPresent.${index}.designation` as const)} />
                              </td>
                              <td>
                                <ActionIcon
                                  variant="subtle"
                                  color="red"
                                  onClick={() => membersPresentArray.remove(index)}
                                  disabled={membersPresentArray.fields.length <= 1}
                                >
                                  <IconTrash size={16} />
                                </ActionIcon>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </ScrollArea>
                    <Group justify="flex-end">
                      <Button variant="subtle" leftSection={<IconPlus size={14} />} onClick={() => membersPresentArray.append(createParticipant())}>
                        Add present member
                      </Button>
                    </Group>
                  </Stack>

                  <Stack gap="sm">
                    <Text fw={600}>Members Absent</Text>
                    <ScrollArea h={260} offsetScrollbars>
                      <Table withColumnBorders>
                        <thead>
                          <tr>
                            <th style={{ width: 50 }}>Sr</th>
                            <th>Name</th>
                            <th>Designation</th>
                            <th style={{ width: 40 }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {membersAbsentArray.fields.map((field, index) => (
                            <tr key={field.id}>
                              <td>{index + 1}</td>
                              <td>
                                <TextInput
                                  placeholder="Member name"
                                  {...register(`membersAbsent.${index}.name` as const)}
                                />
                              </td>
                              <td>
                                <TextInput placeholder="Designation" {...register(`membersAbsent.${index}.designation` as const)} />
                              </td>
                              <td>
                                <ActionIcon
                                  variant="subtle"
                                  color="red"
                                  onClick={() => membersAbsentArray.remove(index)}
                                  disabled={membersAbsentArray.fields.length <= 1}
                                >
                                  <IconTrash size={16} />
                                </ActionIcon>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </ScrollArea>
                    <Group justify="flex-end">
                      <Button variant="subtle" leftSection={<IconPlus size={14} />} onClick={() => membersAbsentArray.append(createParticipant())}>
                        Add absent member
                      </Button>
                    </Group>
                  </Stack>
                </SimpleGrid>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Text fw={600} mb="sm">
                  Minutes of meeting
                </Text>
                <ScrollArea h={320} offsetScrollbars>
                  <Table withColumnBorders>
                    <thead>
                      <tr>
                        <th style={{ width: 50 }}>Sr</th>
                        <th>Agenda</th>
                        <th>Discussion and action planned</th>
                        <th style={{ width: 160 }}>Responsible</th>
                        <th style={{ width: 120 }}>Target date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agendaArray.fields.map((field, index) => (
                        <tr key={field.id}>
                          <td>{index + 1}</td>
                          <td>
                            <Textarea
                              autosize
                              minRows={2}
                              {...register(`agendaItems.${index}.title` as const)}
                            />
                          </td>
                          <td>
                            <Textarea
                              autosize
                              minRows={3}
                              placeholder="Discussion, actions, follow-up"
                              {...register(`agendaItems.${index}.discussion` as const)}
                            />
                          </td>
                          <td>
                            <TextInput placeholder="Responsible" {...register(`agendaItems.${index}.responsible` as const)} />
                          </td>
                          <td>
                            <TextInput placeholder="Target date" {...register(`agendaItems.${index}.targetDate` as const)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </ScrollArea>
                <Group justify="flex-end" mt="md">
                  <Button variant="subtle" leftSection={<IconPlus size={14} />} onClick={() => agendaArray.append(createAgenda(`Agenda ${agendaArray.fields.length + 1}`))}>
                    Add agenda item
                  </Button>
                </Group>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Textarea label="Additional notes" minRows={3} autosize {...register('notes')} />
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
                  {editingId ? 'Update minutes' : 'Save minutes'}
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
        title="Minutes of Safety Committee Meeting"
        overlayProps={{ blur: 3 }}
      >
        {selectedRecord ? (
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Meeting No.
                </Text>
                <Text fw={600}>{selectedRecord.meetingNumber || '—'}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Date
                </Text>
                <Text fw={600}>{formatDate(selectedRecord.meetingDate)}</Text>
              </Card>
            </SimpleGrid>
            <ScrollArea h={320}>
              <Table withColumnBorders striped>
                <thead>
                  <tr>
                    <th>Agenda</th>
                    <th>Discussion & action planned</th>
                    <th>Resp.</th>
                    <th>Target date</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRecord.agendaItems?.length ? (
                    selectedRecord.agendaItems.map((item: any, index: number) => (
                      <tr key={`${item.title}-${index}`}>
                        <td>{item.title || `Agenda ${index + 1}`}</td>
                        <td>{item.discussion || '—'}</td>
                        <td>{item.responsible || '—'}</td>
                        <td>{item.targetDate || '—'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4}>
                        <Text size="sm" c="dimmed" ta="center">
                          No agenda items recorded.
                        </Text>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </ScrollArea>
          </Stack>
        ) : null}
      </Modal>
    </EhsPageLayout>
  );
};

export default EhsCommitteeMomPage;
