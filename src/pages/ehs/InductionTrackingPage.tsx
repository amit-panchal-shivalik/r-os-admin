import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Alert,
  Badge,
  Button,
  Card,
  Divider,
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
  ActionIcon,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {
  IconActivity,
  IconCalendarStats,
  IconEye,
  IconPencil,
  IconPlus,
  IconPrinter,
  IconRefresh,
  IconUserCheck,
  IconUsers,
} from '@tabler/icons-react';
import { showMessage } from '@/utils/Constant';
import EhsPageLayout from '@/components/ehs/EhsPageLayout';
import { useSites } from '@/hooks/useSites';
import { useContractors } from '@/hooks/useContractors';
import { usePermissions } from '@/hooks/usePermissions';
import {
  createInductionTrackingRecord,
  listInductionTrackingRecords,
  InductionTrackingPayload,
  fetchWorkerProfile,
  updateInductionTrackingRecord,
} from '@/apis/ehs';

const GENDER_OPTIONS = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Other', value: 'Other' },
];

const SKILL_OPTIONS = [
  { label: 'Skilled', value: 'Skilled' },
  { label: 'Unskilled', value: 'Unskilled' },
];

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const getNextReinductionDate = (record: any) => {
  const dates = [
    record.firstReinductionDate,
    record.secondReinductionDate,
    record.thirdReinductionDate,
    record.fourthReinductionDate,
  ]
    .map((value) => (value ? new Date(value) : null))
    .filter((value): value is Date => !!value && !Number.isNaN(value.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  return dates.length ? dates[0] : null;
};

const countDueWithin = (records: any[], days: number) =>
  records.filter((record) => {
    const next = getNextReinductionDate(record);
    if (!next) return false;
    const diff = (next.getTime() - Date.now()) / DAY_IN_MS;
    return diff >= 0 && diff <= days;
  }).length;

const countOverdue = (records: any[]) =>
  records.filter((record) => {
    const next = getNextReinductionDate(record);
    return next ? next.getTime() < Date.now() : false;
  }).length;

const METRICS = [
  {
    title: 'Active Records',
    icon: IconUsers,
    value: (records: any[]) => records.length,
    trendLabel: (records: any[]) => `${records.length} workers tracked`,
    trendColor: 'blue',
  },
  {
    title: 'Re-Induction Due (≤7 days)',
    icon: IconCalendarStats,
    value: (records: any[]) => countDueWithin(records, 7),
    trendLabel: (records: any[]) => `${countDueWithin(records, 7)} due soon`,
    trendColor: 'orange',
  },
  {
    title: 'Overdue Re-Inductions',
    icon: IconActivity,
    value: (records: any[]) => countOverdue(records),
    trendLabel: (records: any[]) => `${countOverdue(records)} overdue`,
    trendColor: 'red',
  },
];

type InductionTrackingFormValues = {
  formNo?: string;
  revisionNo?: string;
  siteId?: string;
  contractorId?: string;
  siteName?: string;
  companyName?: string;
  location?: string;
  name: string;
  age?: number;
  gender?: string;
  contractorName?: string;
  designation?: string;
  skillLevel?: 'Skilled' | 'Unskilled';
  govIdType?: string;
  govIdNumber?: string;
  emergencyContactNumber?: string;
  inductionNumber?: string;
  firstReinductionDate: Date | null;
  secondReinductionDate: Date | null;
  thirdReinductionDate: Date | null;
  fourthReinductionDate: Date | null;
  remark?: string;
};

type ContractorFormValues = {
  name: string;
  companyName?: string;
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
};

const defaultValues: InductionTrackingFormValues = {
  formNo: 'EHS-F-02',
  revisionNo: '00',
  siteId: undefined,
  contractorId: undefined,
  siteName: '',
  companyName: '',
  location: '',
  name: '',
  age: undefined,
  gender: 'Male',
  contractorName: '',
  designation: '',
  skillLevel: 'Skilled',
  govIdType: 'AADHAR',
  govIdNumber: '',
  emergencyContactNumber: '',
  inductionNumber: '',
  firstReinductionDate: null,
  secondReinductionDate: null,
  thirdReinductionDate: null,
  fourthReinductionDate: null,
  remark: '',
};

const toIsoString = (value: Date | null | undefined) => {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  const parsed = new Date(value as unknown as string);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const formatDate = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString();
};

const InductionTrackingPage = () => {
  const [modalOpened, setModalOpened] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const { sites, loading: sitesLoading } = useSites();
  const { contractors, loading: contractorsLoading, createNewContractor } = useContractors();
  const { can, loading: permissionsLoading, roles } = usePermissions();

  const canView = can('InductionTracking', 'view');
  const canCreate = can('InductionTracking', 'add');
  const isSuperAdmin = roles.includes('SuperAdmin');

  const { control, handleSubmit, reset, setValue, getValues, formState: { errors } } = useForm<InductionTrackingFormValues>({
    defaultValues,
  });
  const [contractorModalOpened, setContractorModalOpened] = useState(false);
  const {
    control: contractorControl,
    handleSubmit: handleContractorSubmit,
    reset: resetContractorForm,
    getFieldState: getContractorFieldState,
    formState: { isSubmitting: contractorSubmitting },
  } = useForm<ContractorFormValues>({
    defaultValues: {
      name: '',
      companyName: '',
      contactPerson: '',
      contactNumber: '',
      email: '',
      address: '',
    },
  });

  const siteOptions = useMemo(
    () =>
      sites.map((site) => ({
        value: site._id,
        label: site.name,
        description: site.location ?? '',
      })),
    [sites]
  );

  const contractorOptions = useMemo(
    () =>
      contractors.map((contractor) => ({
        value: contractor._id,
        label: contractor.name,
        description: contractor.companyName ?? contractor.contactPerson ?? '',
      })),
    [contractors]
  );

  const fetchRecords = useCallback(async () => {
    if (!canView) {
      setRecords([]);
      return;
    }
    setLoadingRecords(true);
    try {
      const response = await listInductionTrackingRecords({ limit: 10, page: 1 });
      setRecords(response?.result?.records ?? []);
    } catch (error: any) {
      showMessage(error?.message ?? 'Unable to load records', 'error');
    } finally {
      setLoadingRecords(false);
    }
  }, [canView]);

  useEffect(() => {
    if (!permissionsLoading && canView) {
    fetchRecords();
    }
  }, [fetchRecords, permissionsLoading, canView]);

  const metrics = useMemo(() => {
    const total = records.length;
    const now = new Date();
    const upcoming = records.filter((record) => {
      if (!record.firstReinductionDate) return false;
      const date = new Date(record.firstReinductionDate);
      if (Number.isNaN(date.getTime())) return false;
      const diff = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7;
    }).length;

    const overdue = records.filter((record) => {
      const dates = [
        record.firstReinductionDate,
        record.secondReinductionDate,
        record.thirdReinductionDate,
        record.fourthReinductionDate,
      ].filter(Boolean);
      if (dates.length === 0) return false;
      return dates.some((value: string) => {
        const date = new Date(value);
        return !Number.isNaN(date.getTime()) && date < now;
      });
    }).length;

    return {
      total,
      upcoming,
      overdue,
    };
  }, [records]);

  const openCreateModal = () => {
    if (!canCreate) {
      showMessage('You do not have permission to create induction tracking entries', 'error');
      return;
    }
    reset(defaultValues);
    setIsEditMode(false);
    setEditingRecordId(null);
    setModalOpened(true);
  };

  const closeFormModal = useCallback(() => {
    setModalOpened(false);
    setIsEditMode(false);
    setEditingRecordId(null);
  }, []);

  const setFormValuesFromRecord = useCallback(
    (record: any) => {
      reset({
        formNo: record.formNo ?? 'EHS-F-02',
        revisionNo: record.revisionNo ?? '00',
        siteId: record.site?.id ?? undefined,
        contractorId: record.contractor?.id ?? undefined,
        siteName: record.siteName ?? record.site?.name ?? '',
        companyName: record.companyName ?? record.site?.companyName ?? '',
        location: record.location ?? record.site?.location ?? '',
        name: record.name ?? '',
        age: record.age ?? undefined,
        gender: record.gender ?? 'Male',
        contractorName: record.contractorName ?? record.contractor?.name ?? '',
        designation: record.designation ?? '',
        skillLevel: record.skillLevel ?? 'Skilled',
        govIdType: record.govIdType ?? 'AADHAR',
        govIdNumber: record.govIdNumber ?? '',
        emergencyContactNumber: record.emergencyContactNumber ?? '',
        inductionNumber: record.inductionNumber ?? '',
        firstReinductionDate: record.firstReinductionDate ? new Date(record.firstReinductionDate) : null,
        secondReinductionDate: record.secondReinductionDate ? new Date(record.secondReinductionDate) : null,
        thirdReinductionDate: record.thirdReinductionDate ? new Date(record.thirdReinductionDate) : null,
        fourthReinductionDate: record.fourthReinductionDate ? new Date(record.fourthReinductionDate) : null,
        remark: record.remark ?? '',
      });
    },
    [reset]
  );

  const handleEditRecord = useCallback(
    (record: any) => {
      if (!isSuperAdmin) return;
      setIsEditMode(true);
      setEditingRecordId(record._id);
      setFormValuesFromRecord(record);
      setModalOpened(true);
    },
    [isSuperAdmin, setFormValuesFromRecord]
  );

  const handleViewRecord = useCallback((record: any) => {
    if (!isSuperAdmin) return;
    setSelectedRecord(record);
    setViewModalOpened(true);
  }, [isSuperAdmin]);

  const closeViewModal = useCallback(() => {
    setSelectedRecord(null);
    setViewModalOpened(false);
  }, []);

  const onCreateContractor = async (values: ContractorFormValues) => {
    try {
      const contractor = await createNewContractor(values);
      if (contractor?._id) {
        setValue('contractorId', contractor._id);
        setValue('contractorName', contractor.name ?? '');
      }
      setContractorModalOpened(false);
      resetContractorForm({
        name: '',
        companyName: '',
        contactPerson: '',
        contactNumber: '',
        email: '',
        address: '',
      });
    } catch {
      // toast handled in hook
    }
  };

  const handleFetchProfile = async () => {
    const govIdNumber = getValues('govIdNumber');
    const phoneNumber = getValues('emergencyContactNumber');

    if (!govIdNumber && !phoneNumber) {
      showMessage('Enter Gov ID or emergency contact to fetch profile', 'error');
      return;
    }

    try {
      const response = await fetchWorkerProfile({ govIdNumber, phoneNumber });
      const profile = response?.result;
      if (!profile) {
        showMessage('Profile not found', 'error');
        return;
      }

      setValue('name', profile.name ?? '');
      setValue('age', profile.age ?? undefined);
      setValue('gender', profile.gender ?? 'Male');
      setValue('designation', profile.designation ?? '');
      setValue('contractorName', profile.contractorName ?? profile.contractor?.name ?? '');
      setValue('skillLevel', profile.skillLevel ?? 'Skilled');
      setValue('govIdType', profile.govIdType ?? 'AADHAR');
      setValue('govIdNumber', profile.govIdNumber ?? govIdNumber ?? '');
      setValue('emergencyContactNumber', profile.emergencyContactNumber ?? phoneNumber ?? '');
      setValue('inductionNumber', profile.nextInductionNumber ?? '');

      if (profile.site?.id) {
        setValue('siteId', profile.site.id);
        setValue('siteName', profile.site.name ?? '');
        setValue('location', profile.site.location ?? '');
        setValue('companyName', profile.site.companyName ?? '');
      }

      if (profile.contractor?.id) {
        setValue('contractorId', profile.contractor.id);
      }

      showMessage('Profile details loaded');
    } catch (error: any) {
      showMessage(error?.message ?? 'Unable to fetch profile', 'error');
    }
  };

  const onSubmit = async (values: InductionTrackingFormValues) => {
    setSubmitting(true);
    try {
      const payload: InductionTrackingPayload = {
        ...values,
        firstReinductionDate: toIsoString(values.firstReinductionDate),
        secondReinductionDate: toIsoString(values.secondReinductionDate),
        thirdReinductionDate: toIsoString(values.thirdReinductionDate),
        fourthReinductionDate: toIsoString(values.fourthReinductionDate),
      };

      if (isEditMode && editingRecordId) {
        const response = await updateInductionTrackingRecord(editingRecordId, payload);
        showMessage('Induction tracking record updated');
        const updatedRecord = response?.result;
        if (updatedRecord) {
          setRecords((prev) =>
            prev.map((item) => (item._id === editingRecordId ? updatedRecord : item))
          );
        } else {
          await fetchRecords();
        }
      } else {
        const response = await createInductionTrackingRecord(payload);
        showMessage('Induction tracking record saved');
        const createdRecord = response?.result;
        if (createdRecord) {
          setRecords((prev) => [createdRecord, ...prev]);
        } else {
          await fetchRecords();
        }
      }

      closeFormModal();
    } catch (error: any) {
      showMessage(error?.message ?? 'Failed to save record', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = useCallback((recordId: string) => {
    const record = records.find(r => r._id === recordId);
    if (!record) return;

    const printContent = `
      <html>
        <head>
          <title>Induction Card</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .card {
              border: 1px solid #ccc;
              padding: 20px;
              margin: 10px;
              border-radius: 8px;
              box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 15px;
            }
            .info-row {
              margin-bottom: 5px;
            }
            .info-label {
              font-weight: bold;
              display: inline-block;
              width: 120px;
            }
            .info-value {
              font-weight: normal;
            }
            .reinduction-dates {
              margin-top: 15px;
              padding-top: 10px;
              border-top: 1px dashed #ccc;
            }
            .remark {
              margin-top: 15px;
              padding-top: 10px;
              border-top: 1px dashed #ccc;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h2>Induction Card</h2>
              <p>Worker: ${record.name}</p>
              <p>Contractor: ${record.contractorName}</p>
              <p>Site: ${record.siteName}</p>
            </div>
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span class="info-value">${record.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Age:</span>
              <span class="info-value">${record.age ?? '—'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Gender:</span>
              <span class="info-value">${record.gender ?? '—'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Contractor:</span>
              <span class="info-value">${record.contractorName ?? '—'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Designation:</span>
              <span class="info-value">${record.designation ?? '—'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Skill Level:</span>
              <span class="info-value">${record.skillLevel ?? '—'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">ID Type:</span>
              <span class="info-value">${record.govIdType ?? '—'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">ID Number:</span>
              <span class="info-value">${record.govIdNumber ?? '—'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Emergency Contact:</span>
              <span class="info-value">${record.emergencyContactNumber ?? '—'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Induction Number:</span>
              <span class="info-value">${record.inductionNumber ?? '—'}</span>
            </div>
            <div class="reinduction-dates">
              <h3>Re-Induction Schedule</h3>
              <div class="info-row">
                <span class="info-label">1st Re-Induction:</span>
                <span class="info-value">${formatDate(record.firstReinductionDate)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">2nd Re-Induction:</span>
                <span class="info-value">${formatDate(record.secondReinductionDate)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">3rd Re-Induction:</span>
                <span class="info-value">${formatDate(record.thirdReinductionDate)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">4th Re-Induction:</span>
                <span class="info-value">${formatDate(record.fourthReinductionDate)}</span>
              </div>
            </div>
            ${record.remark ? `<div class="remark"><h3>Remarks</h3><p>${record.remark}</p></div>` : ''}
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  }, [records]);

  return (
    <EhsPageLayout
      title="Induction Tracking"
      description="Log individual worker inductions, set reminders for re-inductions, and monitor contractor & site-wise compliance."
      actions={
        canCreate ? (
          <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
            Add Record
        </Button>
        ) : undefined
      }
    >
      {permissionsLoading ? (
        <Group justify="center" py="xl">
          <Loader size="sm" />
        </Group>
      ) : !canView ? (
        <Alert color="red" variant="light" title="Access restricted">
          You do not have permission to view induction tracking records. Contact a SuperAdmin to
          request access.
        </Alert>
      ) : (
        <>
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            {METRICS.map((metric) => (
              <Card key={metric.title} withBorder radius="md" padding="lg" shadow="sm">
          <Stack gap={4}>
                  <Group gap="xs">
                    <metric.icon size={20} />
            <Text size="sm" c="dimmed">
                      {metric.title}
            </Text>
                  </Group>
            <Text size="xl" fw={700}>
                    {metric.value(records)}
            </Text>
                  <Badge color={metric.trendColor} variant="light">
                    {typeof metric.trendLabel === 'function'
                      ? metric.trendLabel(records)
                      : metric.trendLabel}
                  </Badge>
          </Stack>
        </Card>
            ))}
      </SimpleGrid>

      <Card withBorder radius="md" shadow="sm" padding="lg">
        <Stack gap="md">
              <Group justify="space-between">
                <Text fw={600}>Recent Entries</Text>
                <Button
                  variant="light"
                  color="gray"
                  leftSection={<IconRefresh size={16} />}
                  onClick={() => fetchRecords()}
                  disabled={!canView}
                >
              Refresh
            </Button>
          </Group>

          {loadingRecords ? (
            <Group justify="center" py="lg">
              <Loader size="sm" />
            </Group>
          ) : (
            <ScrollArea>
              <Table striped highlightOnHover withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Age</Table.Th>
                    <Table.Th>Gender</Table.Th>
                    <Table.Th>Contractor</Table.Th>
                    <Table.Th>Designation</Table.Th>
                    <Table.Th>Skill</Table.Th>
                    <Table.Th>Induction No.</Table.Th>
                    <Table.Th>1st Reinduction</Table.Th>
                    <Table.Th align="right">Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {records.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={9}>
                        <Text size="sm" c="dimmed" ta="center">
                          No records found yet.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    records.map((record) => (
                      <Table.Tr key={record._id}>
                        <Table.Td>{record.name}</Table.Td>
                        <Table.Td>{record.age ?? '—'}</Table.Td>
                        <Table.Td>{record.gender ?? '—'}</Table.Td>
                        <Table.Td>{record.contractorName ?? '—'}</Table.Td>
                        <Table.Td>{record.designation ?? '—'}</Table.Td>
                        <Table.Td>
                          <Badge color={record.skillLevel === 'Unskilled' ? 'yellow' : 'blue'} variant="light">
                            {record.skillLevel ?? '—'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>{record.inductionNumber ?? '—'}</Table.Td>
                        <Table.Td>{formatDate(record.firstReinductionDate)}</Table.Td>
                        <Table.Td align="right">
                          <Group gap="xs" justify="flex-end">
                            {isSuperAdmin ? (
                              <>
                                <ActionIcon
                                  variant="light"
                                  color="blue"
                                  aria-label="View induction record"
                                  onClick={() => handleViewRecord(record)}
                                >
                                  <IconEye size={16} />
                                </ActionIcon>
                                <ActionIcon
                                  variant="light"
                                  color="orange"
                                  aria-label="Edit induction record"
                                  onClick={() => handleEditRecord(record)}
                                >
                                  <IconPencil size={16} />
                                </ActionIcon>
                              </>
                            ) : null}
                            <ActionIcon
                              variant="light"
                              color="gray"
                              aria-label="Print induction card"
                              onClick={() => handlePrint(record._id)}
                            >
                              <IconPrinter size={16} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          )}
        </Stack>
      </Card>

      <Modal
        opened={modalOpened && canCreate}
        onClose={closeFormModal}
         size="80%"
        title={isEditMode ? 'Edit Induction Tracking Entry' : 'Add Induction Tracking Entry'}
        centered
        overlayProps={{ blur: 3 }}
      >
            <ScrollArea h="70vh">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="xl" p="sm">
            <Card withBorder radius="md" padding="lg" shadow="xs">
              <Stack gap="md">
                <Text fw={600}>Site Details</Text>
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
                        searchable
                        clearable
                        nothingFoundMessage={sitesLoading ? 'Loading...' : 'No sites'}
                        onChange={(value) => {
                          field.onChange(value ?? undefined);
                          const selected = sites.find((site) => site._id === value);
                          if (selected) {
                            setValue('siteName', selected.name ?? '');
                            setValue('companyName', selected.companyName ?? '');
                            setValue('location', selected.location ?? '');
                          }
                        }}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="siteName"
                    render={({ field }) => <TextInput {...field} label="Site Name" placeholder="Project / Site" />}
                  />
                  <Controller
                    control={control}
                    name="companyName"
                    render={({ field }) => <TextInput {...field} label="Company" placeholder="Company" />}
                  />
                  <Controller
                    control={control}
                    name="location"
                    render={({ field }) => <TextInput {...field} label="Location" placeholder="Location" />}
                  />
                </SimpleGrid>
              </Stack>
            </Card>

            <Card withBorder radius="md" padding="lg" shadow="xs">
              <Stack gap="md">
                <Text fw={600}>Worker Details</Text>
                <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                  <Controller
                    control={control}
                    name="name"
                    rules={{ required: 'Name is required' }}
                    render={({ field }) => (
                      <TextInput
                        {...field}
                        label="Name of Person"
                        placeholder="Full name"
                        error={errors.name?.message}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="age"
                    render={({ field }) => (
                      <NumberInput
                        {...field}
                        label="Age"
                        min={14}
                        max={75}
                        placeholder="Age"
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="gender"
                          render={({ field }) => <Select {...field} label="Gender" data={GENDER_OPTIONS} />} 
                        />
                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                          <div style={{ flex: 1 }}>
                            <Controller
                              control={control}
                              name="contractorId"
                              render={({ field }) => (
                                <Select
                                  label="Contractor"
                                  placeholder={contractorsLoading ? 'Loading contractors...' : 'Select contractor'}
                                  data={contractorOptions}
                                  value={field.value ?? null}
                                  searchable
                                  clearable
                                  nothingFoundMessage={contractorsLoading ? 'Loading...' : 'No contractors'}
                                  name={field.name}
                                  ref={field.ref}
                                  onBlur={field.onBlur}
                                  onChange={(value) => {
                                    field.onChange(value ?? undefined);
                                    if (!value) {
                                      setValue('contractorName', '');
                                      return;
                                    }
                                    const selected = contractors.find((contractor) => contractor._id === value);
                                    if (selected) {
                                      setValue('contractorName', selected.name ?? '');
                                    }
                                  }}
                                />
                              )}
                  />
                          </div>
                          <Button variant="light" size="xs" onClick={() => setContractorModalOpened(true)}>
                            <IconPlus size={14} /> Add
                          </Button>
                        </div>
                  <Controller
                    control={control}
                    name="contractorName"
                    render={({ field }) => (
                      <TextInput {...field} label="Contractor / Sub-contractor" placeholder="Contractor name" />
                    )}
                  />
                  <Controller
                    control={control}
                    name="designation"
                    render={({ field }) => <TextInput {...field} label="Designation" placeholder="Trade" />} 
                  />
                  <Controller
                    control={control}
                    name="skillLevel"
                          render={({ field }) => <Select {...field} label="Skilled / Unskilled" data={SKILL_OPTIONS} />} 
                  />
                  <Controller
                    control={control}
                    name="govIdType"
                    render={({ field }) => (
                      <TextInput {...field} label="Gov ID Type" placeholder="AADHAR / PAN / ..." />
                    )}
                  />
                  <Controller
                    control={control}
                    name="govIdNumber"
                    render={({ field }) => (
                            <TextInput
                              {...field}
                              label="Gov ID Number"
                              placeholder="1200 2114 5885"
                              rightSection={
                                <Button
                                  variant="light"
                                  size="xs"
                                  leftSection={<IconUserCheck size={14} />}
                                  onClick={handleFetchProfile}
                                >
                                  Fetch
                                </Button>
                              }
                              rightSectionWidth={110}
                            />
                          )}
                  />
                  <Controller
                    control={control}
                    name="emergencyContactNumber"
                    render={({ field }) => (
                      <TextInput {...field} label="Emergency Contact" placeholder="Contact number" />
                    )}
                  />
                  <Controller
                    control={control}
                    name="inductionNumber"
                    render={({ field }) => (
                      <TextInput {...field} label="Induction Number" placeholder="SW 01" />
                    )}
                  />
                </SimpleGrid>
              </Stack>
            </Card>

            <Card withBorder radius="md" padding="lg" shadow="xs">
              <Stack gap="md">
                <Text fw={600}>Reinduction Dates</Text>
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                  <Controller
                    control={control}
                    name="firstReinductionDate"
                    render={({ field }) => (
                      <DateInput
                        label="1st Reinduction Date"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select date"
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="secondReinductionDate"
                    render={({ field }) => (
                      <DateInput
                        label="2nd Reinduction Date"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select date"
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="thirdReinductionDate"
                    render={({ field }) => (
                      <DateInput
                        label="3rd Reinduction Date"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select date"
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="fourthReinductionDate"
                    render={({ field }) => (
                      <DateInput
                        label="4th Reinduction Date"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select date"
                      />
                    )}
                  />
                </SimpleGrid>
              </Stack>
            </Card>

            <Card withBorder radius="md" padding="lg" shadow="xs">
              <Stack gap="md">
                <Text fw={600}>Remarks</Text>
                <Controller
                  control={control}
                  name="remark"
                  render={({ field }) => <Textarea {...field} minRows={3} placeholder="Additional notes" />}
                />
              </Stack>
            </Card>

            <Divider />
                  <Group justify="space-between">
                    <Button variant="default" onClick={closeFormModal}>
                      Cancel
                    </Button>
                    <Button type="submit" loading={submitting} disabled={!canCreate}>
                      {isEditMode ? 'Update Record' : 'Save Record'}
                    </Button>
                  </Group>
                </Stack>
              </form>
            </ScrollArea>
          </Modal>
          <Modal
            opened={isSuperAdmin && viewModalOpened && !!selectedRecord}
            onClose={closeViewModal}
            title="Induction Record"
            size="lg"
            centered
            keepMounted
          >
        {selectedRecord ? (
          <Stack gap="lg">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              {[
                { label: 'Worker Name', value: selectedRecord.name },
                { label: 'Contractor', value: selectedRecord.contractorName },
                { label: 'Site', value: selectedRecord.siteName },
                { label: 'Designation', value: selectedRecord.designation },
                { label: 'Skill Level', value: selectedRecord.skillLevel },
                { label: 'Induction Number', value: selectedRecord.inductionNumber },
                { label: 'Gov ID', value: selectedRecord.govIdNumber },
                { label: 'Emergency Contact', value: selectedRecord.emergencyContactNumber },
              ].map((field) => (
                <Card key={field.label} withBorder radius="md" padding="md" shadow="xs">
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                      {field.label}
                    </Text>
                    <Text fw={600}>{field.value ?? '—'}</Text>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>

            <Card withBorder radius="md" padding="md" shadow="xs">
              <Stack gap={8}>
                <Text size="sm" fw={600}>
                  Re-Induction Schedule
                </Text>
                <Table highlightOnHover withRowBorders={false}>
                  <Table.Tbody>
                    {[
                      { label: 'First Re-Induction', value: selectedRecord.firstReinductionDate },
                      { label: 'Second Re-Induction', value: selectedRecord.secondReinductionDate },
                      { label: 'Third Re-Induction', value: selectedRecord.thirdReinductionDate },
                      { label: 'Fourth Re-Induction', value: selectedRecord.fourthReinductionDate },
                    ].map((item) => (
                      <Table.Tr key={item.label}>
                        <Table.Td width="50%">
                          <Text size="sm" c="dimmed">
                            {item.label}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{formatDate(item.value)}</Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Stack>
            </Card>

            {selectedRecord.remark ? (
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Stack gap={4}>
                  <Text size="sm" fw={600}>
                    Remarks
                  </Text>
                  <Text size="sm">{selectedRecord.remark}</Text>
                </Stack>
              </Card>
            ) : null}
          </Stack>
        ) : null}
      </Modal>

      <Modal
        opened={contractorModalOpened && canCreate}
        onClose={() => setContractorModalOpened(false)}
        title="Add Contractor"
        size="lg"
        centered
        keepMounted
      >
        <ScrollArea h="70vh">
          <form onSubmit={handleContractorSubmit(onCreateContractor)}>
            <Stack gap="md">
              <Controller
                control={contractorControl}
                name="name"
                rules={{ required: 'Contractor name is required' }}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    label="Contractor Name"
                    placeholder="Contractor name"
                    error={getContractorFieldState('name').error?.message}
                  />
                )}
              />
              <Controller
                control={contractorControl}
                name="companyName"
                render={({ field }) => <TextInput {...field} label="Company Name" placeholder="Company name" />}
              />
              <Controller
                control={contractorControl}
                name="contactPerson"
                render={({ field }) => <TextInput {...field} label="Contact Person" placeholder="Contact person" />}
              />
              <Controller
                control={contractorControl}
                name="contactNumber"
                render={({ field }) => <TextInput {...field} label="Contact Number" placeholder="Contact number" />}
              />
              <Controller
                control={contractorControl}
                name="email"
                render={({ field }) => <TextInput {...field} label="Email" placeholder="Email address" />}
              />
              <Button type="submit" loading={contractorSubmitting}>
                Save Contractor
              </Button>
            </Stack>
          </form>
        </ScrollArea>
      </Modal>
        </>
      )}
    </EhsPageLayout>
  );
};

export default InductionTrackingPage;
