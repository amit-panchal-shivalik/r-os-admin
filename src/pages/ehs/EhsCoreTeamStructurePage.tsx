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
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconAlertCircle, IconEye, IconPencil, IconPlus, IconPrinter, IconRefresh, IconTrash } from '@tabler/icons-react';
import dayjs from 'dayjs';
import EhsPageLayout from '@/components/ehs/EhsPageLayout';
import { usePermissions } from '@/hooks/usePermissions';
import { useSites } from '@/hooks/useSites';
import { useEhsCoreTeams } from '@/hooks/useEhsCoreTeams';
import { EhsCoreTeamPayload } from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';
import logo from '@/assets/ehs/Logo.jpeg';

const DEFAULT_MEMBER_ROWS = 12;

const createMember = () => ({
  name: '',
  designation: '',
  department: '',
  contactNumber: '',
});

type MemberFormValue = ReturnType<typeof createMember>;

type CoreTeamFormValues = {
  siteId?: string;
  lastReviewDate: Date | null;
  members: MemberFormValue[];
  preparedBy: string;
  approvedBy: string;
};

const DEFAULT_VALUES: CoreTeamFormValues = {
  siteId: undefined,
  lastReviewDate: new Date(),
  members: Array.from({ length: DEFAULT_MEMBER_ROWS }).map(() => createMember()),
  preparedBy: '',
  approvedBy: '',
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dayjs(date).format('DD/MM/YYYY');
};

const buildPrintHtml = (record: any) => {
  const rows = (record.members || []).map((member: any, index: number) => `
      <tr>
        <td style="border:1px solid #000;padding:6px;text-align:center;width:60px;">${index + 1}</td>
        <td style="border:1px solid #000;padding:6px;">${member.name ?? ''}</td>
        <td style="border:1px solid #000;padding:6px;">${member.designation ?? ''}</td>
        <td style="border:1px solid #000;padding:6px;">${member.department ?? ''}</td>
        <td style="border:1px solid #000;padding:6px;">${member.contactNumber ?? ''}</td>
      </tr>
    `);

  const blankRow = `
      <tr>
        <td style="border:1px solid #000;padding:6px;height:28px;">&nbsp;</td>
        <td style="border:1px solid #000;padding:6px;">&nbsp;</td>
        <td style="border:1px solid #000;padding:6px;">&nbsp;</td>
        <td style="border:1px solid #000;padding:6px;">&nbsp;</td>
        <td style="border:1px solid #000;padding:6px;">&nbsp;</td>
      </tr>`;

  while (rows.length < DEFAULT_MEMBER_ROWS) {
    rows.push(blankRow);
  }

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>EHS Core Team Structure</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #fff; color: #000; }
          table { border-collapse: collapse; width: 100%; font-size: 12px; }
          th, td { border: 1px solid #000; padding: 6px; }
          th { background: #f3f3f3; text-transform: uppercase; font-size: 11px; }
          .sheet { border: 2px solid #000; padding: 16px; }
          .header { display: grid; grid-template-columns: 2fr 3fr 1.2fr; gap: 12px; align-items: stretch; margin-bottom: 16px; }
          .logo { border:1px solid #000; display:flex; align-items:center; justify-content:center; padding:12px; background:#fff; }
          .title { border:1px solid #000; background:#f3f3f3; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:700; }
          .meta { border:1px solid #000; background:#f3f3f3; padding:12px; font-size:12px; line-height:1.4; }
          .info-row { display:flex; gap:16px; margin-bottom:12px; font-size:13px; }
          .sign-row { display:flex; justify-content:space-between; margin-top:16px; font-size:13px; }
          .sign-row div { border:1px solid #000; padding:10px 12px; flex:1; }
          .sign-row div + div { margin-left:12px; }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="header">
            <div class="logo"><img src="${logo}" alt="Shivalik" style="max-width:150px;max-height:60px;object-fit:contain;" /></div>
            <div class="title">EHS Core Team Structure</div>
            <div class="meta">
              <div>Format No.: EHS-F-24</div>
              <div>Rev. 00</div>
            </div>
          </div>

          <div class="info-row">
            <div>Site: <strong>${record.siteSnapshot?.name ?? ''}</strong></div>
            <div>Last Review date: <strong>${formatDate(record.lastReviewDate)}</strong></div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Name</th>
                <th>Designation</th>
                <th>Dept.</th>
                <th>Contact No.</th>
              </tr>
            </thead>
            <tbody>
              ${rows.join('')}
            </tbody>
          </table>

          <div class="sign-row">
            <div>Prepared by: ${record.preparedBy ?? ''}</div>
            <div>Approved by Project In Charge: ${record.approvedBy ?? ''}</div>
          </div>
        </div>
      </body>
    </html>
  `;

  return html;
};

const EhsCoreTeamStructurePage = () => {
  const { can, loading: permissionsLoading, roles } = usePermissions();
  const { sites, loading: sitesLoading } = useSites();
  const { records, loading, fetchTeams, createTeam, updateTeam } = useEhsCoreTeams({ limit: 50 });

  const [formOpened, setFormOpened] = useState(false);
  const [viewOpened, setViewOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = roles.includes('SuperAdmin');
  const canView = isSuperAdmin || can('EhsCoreTeam', 'view') || roles.length === 0;
  const canCreate = isSuperAdmin || can('EhsCoreTeam', 'add') || roles.length === 0;
  const canEdit = isSuperAdmin || can('EhsCoreTeam', 'edit');

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CoreTeamFormValues>({ defaultValues: DEFAULT_VALUES });

  const { fields, append, remove, replace } = useFieldArray({ control, name: 'members' });
  const watchedSiteId = watch('siteId');

  useEffect(() => {
    if (!permissionsLoading && canView) {
      fetchTeams().catch(() => undefined);
    }
  }, [permissionsLoading, canView, fetchTeams]);

  useEffect(() => {
    if (!watchedSiteId) return;
    const site = sites.find((item) => item._id === watchedSiteId);
    if (site && !watch('preparedBy')) {
      setValue('preparedBy', site.name ?? '', { shouldDirty: false });
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
      showMessage('You do not have permission to edit EHS core teams', 'error');
      return;
    }
    reset(DEFAULT_VALUES);
    replace(DEFAULT_VALUES.members);
    setEditingId(null);
    setFormOpened(true);
  };

  const handleEdit = (record: any) => {
    if (!canEdit) {
      showMessage('You do not have permission to edit EHS core teams', 'error');
      return;
    }
    setEditingId(record._id);
    const members = (record.members || []).map((member: any) => ({
      name: member.name ?? '',
      designation: member.designation ?? '',
      department: member.department ?? '',
      contactNumber: member.contactNumber ?? '',
    }));
    while (members.length < DEFAULT_MEMBER_ROWS) {
      members.push(createMember());
    }
    reset({
      siteId: record.siteSnapshot?.id ?? undefined,
      lastReviewDate: record.lastReviewDate ? new Date(record.lastReviewDate) : new Date(),
      members,
      preparedBy: record.preparedBy ?? '',
      approvedBy: record.approvedBy ?? '',
    });
    replace(members);
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

  const onSubmit = async (values: CoreTeamFormValues) => {
    const payload: EhsCoreTeamPayload = {
      siteId: values.siteId || undefined,
      lastReviewDate: values.lastReviewDate ? values.lastReviewDate.toISOString() : undefined,
      members: values.members.map((member) => ({
        name: member.name,
        designation: member.designation || undefined,
        department: member.department || undefined,
        contactNumber: member.contactNumber || undefined,
      })),
      preparedBy: values.preparedBy || undefined,
      approvedBy: values.approvedBy || undefined,
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await updateTeam(editingId, payload);
      } else {
        await createTeam(payload);
      }
      await fetchTeams();
      setFormOpened(false);
      setEditingId(null);
      reset(DEFAULT_VALUES);
      replace(DEFAULT_VALUES.members);
    } catch (error: any) {
      showMessage(error?.message ?? 'Unable to save EHS core team', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EhsPageLayout
      title="EHS Core Team Structure"
      description="Maintain contact matrix, roles, and last review date for the site EHS core team."
      actions={
        <Group>
          <Button
            variant="light"
            color="gray"
            leftSection={<IconRefresh size={16} />}
            onClick={() => fetchTeams()}
            loading={loading}
          >
            Refresh
          </Button>
          {canCreate ? (
            <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
              Update Team Structure
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
          You do not have permission to view EHS core teams.
        </Alert>
      ) : (
        <Stack gap="lg">
          <Card withBorder radius="md" padding="lg" shadow="sm">
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <Text size="sm" c="dimmed">
                  Records tracked: {records.length}
                </Text>
              </Group>
              <ScrollArea>
                <Table highlightOnHover striped withColumnBorders>
                  <thead>
                    <tr>
                      <th>Site</th>
                      <th>Last Review Date</th>
                      <th>Members</th>
                      <th>Prepared by</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length ? (
                      records.map((record) => (
                        <tr key={record._id}>
                          <td>{record.siteSnapshot?.name || '—'}</td>
                          <td>{formatDate(record.lastReviewDate)}</td>
                          <td>
                            <Badge color="teal" variant="light">
                              {record.members?.length ?? 0}
                            </Badge>
                          </td>
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
                            No core team data available.
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
                <Text fw={600}>Team Preview</Text>
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
                    Site
                  </Text>
                  <Text fw={600}>{selectedRecord.siteSnapshot?.name || '—'}</Text>
                </Card>
                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Text size="sm" c="dimmed">
                    Last review date
                  </Text>
                  <Text fw={600}>{formatDate(selectedRecord.lastReviewDate)}</Text>
                </Card>
              </SimpleGrid>
              <ScrollArea h={280} mt="md">
                <Table withColumnBorders striped>
                  <thead>
                    <tr>
                      <th>Sr</th>
                      <th>Name</th>
                      <th>Designation</th>
                      <th>Dept.</th>
                      <th>Contact No.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRecord.members?.length ? (
                      selectedRecord.members.map((member: any, index: number) => (
                        <tr key={`${member.name}-${index}`}>
                          <td>{index + 1}</td>
                          <td>{member.name || '—'}</td>
                          <td>{member.designation || '—'}</td>
                          <td>{member.department || '—'}</td>
                          <td>{member.contactNumber || '—'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5}>
                          <Text size="sm" c="dimmed" ta="center">
                            No members listed.
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
        title={editingId ? 'Edit EHS Core Team' : 'Update EHS Core Team'}
        overlayProps={{ blur: 3 }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea offsetScrollbars h="70vh">
            <Stack gap="lg" py="xs">
              <Card withBorder radius="md" padding="lg" shadow="xs">
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
                    name="lastReviewDate"
                    rules={{ required: 'Review date required' }}
                    render={({ field }) => (
                      <DateInput
                        label="Last review date"
                        value={field.value}
                        onChange={field.onChange}
                        valueFormat="DD MMM YYYY"
                        error={errors.lastReviewDate?.message}
                      />
                    )}
                  />
                  <TextInput label="Prepared by" placeholder="Coordinator" {...register('preparedBy')} />
                  <TextInput label="Approved by Project In Charge" placeholder="Project in charge" {...register('approvedBy')} />
                </SimpleGrid>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <ScrollArea offsetScrollbars>
                  <Table withColumnBorders>
                    <thead>
                      <tr>
                        <th style={{ width: 60 }}>Sr</th>
                        <th>Name</th>
                        <th>Designation</th>
                        <th>Dept.</th>
                        <th>Contact No.</th>
                        <th style={{ width: 40 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((field, index) => (
                        <tr key={field.id}>
                          <td>{index + 1}</td>
                          <td>
                            <TextInput
                              placeholder="Member name"
                              {...register(`members.${index}.name` as const, {
                                required: 'Required',
                              })}
                              error={errors.members?.[index]?.name?.message}
                            />
                          </td>
                          <td>
                            <TextInput placeholder="Designation" {...register(`members.${index}.designation` as const)} />
                          </td>
                          <td>
                            <TextInput placeholder="Department" {...register(`members.${index}.department` as const)} />
                          </td>
                          <td>
                            <TextInput placeholder="Contact" {...register(`members.${index}.contactNumber` as const)} />
                          </td>
                          <td>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => remove(index)}
                              disabled={fields.length <= 1}
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
                  <Button variant="subtle" leftSection={<IconPlus size={14} />} onClick={() => append(createMember())}>
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
                  {editingId ? 'Update team' : 'Save team'}
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
        title="EHS Core Team Structure"
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
                  Last review date
                </Text>
                <Text fw={600}>{formatDate(selectedRecord.lastReviewDate)}</Text>
              </Card>
            </SimpleGrid>
            <ScrollArea h={320}>
              <Table withColumnBorders striped>
                <thead>
                  <tr>
                    <th>Sr</th>
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Dept.</th>
                    <th>Contact No.</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRecord.members?.length ? (
                    selectedRecord.members.map((member: any, index: number) => (
                      <tr key={`${member.name}-${index}`}>
                        <td>{index + 1}</td>
                        <td>{member.name || '—'}</td>
                        <td>{member.designation || '—'}</td>
                        <td>{member.department || '—'}</td>
                        <td>{member.contactNumber || '—'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5}>
                        <Text size="sm" c="dimmed" ta="center">
                          No members listed.
                        </Text>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </ScrollArea>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Prepared by
                </Text>
                <Text fw={600}>{selectedRecord.preparedBy || '—'}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Approved by Project In Charge
                </Text>
                <Text fw={600}>{selectedRecord.approvedBy || '—'}</Text>
              </Card>
            </SimpleGrid>
          </Stack>
        ) : null}
      </Modal>
    </EhsPageLayout>
  );
};

export default EhsCoreTeamStructurePage;
