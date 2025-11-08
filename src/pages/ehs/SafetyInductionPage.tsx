import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  MultiSelect,
  Group,
  Loader,
  Modal,
  NumberInput,
  Paper,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconPlus, IconTrash, IconUserCheck, IconPrinter, IconRefresh, IconEye, IconPencil } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { showMessage } from '@/utils/Constant';
import { useSites } from '@/hooks/useSites';
import { useContractors } from '@/hooks/useContractors';
import { usePermissions } from '@/hooks/usePermissions';
import EhsPageLayout from '@/components/ehs/EhsPageLayout';
import SignaturePadField from '@/components/ehs/SignaturePadField';
import {
  createSafetyInduction,
  fetchWorkerProfile,
  listSafetyInductions,
  SafetyInductionPayload,
  updateSafetyInduction,
} from '@/apis/ehs';

const SAFETY_TOPICS = [
  'General safety points',
  'Working at height',
  'Manual material handling',
  'Importance of PPE',
  'Electrical safety',
  'Mechanical / fabrication work safety',
  'Work place housekeeping',
  'Waste management',
  'Material lifting and shifting',
  'Masonry work',
  'Eye protection',
  'Right tool for the right job',
  'Electric power tools',
  'Importance of machine guard',
  'Heat stroke prevention',
  'Use of fire extinguisher',
  'Edge protection',
  'Use of safety harness',
  'Night work safety precautions',
  'Emergency preparedness plan',
  'Precautions during rainy season',
  'Public safety awareness',
];

const GENDER_OPTIONS = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Other', value: 'Other' },
];

const GOV_ID_OPTIONS = [
  { label: 'AADHAR', value: 'AADHAR' },
  { label: 'PAN', value: 'PAN' },
  { label: 'Voter ID', value: 'VOTER_ID' },
  { label: 'Driving License', value: 'DL' },
  { label: 'Passport', value: 'PASSPORT' },
];

type AttendeeForm = {
  govIdType?: string;
  govIdNumber?: string;
  name: string;
  age?: number;
  gender?: string;
  designation?: string;
  inductionNumber?: string;
  signature?: string;
};

type ContractorFormValues = {
  name: string;
  companyName?: string;
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
};

const defaultAttendee = (index: number): AttendeeForm => ({
  govIdType: 'AADHAR',
  govIdNumber: '',
  name: '',
  age: undefined,
  gender: 'Male',
  designation: '',
  inductionNumber: `SW ${String(index + 1).padStart(2, '0')}`,
  signature: undefined,
});

type SafetyInductionFormValues = {
  projectName: string;
  projectLocation: string;
  organizationName?: string;
  contractorName: string;
  contractorId?: string;
  projectInCharge?: string;
  siteId?: string;
  inductionDate: Date | null;
  timeFrom?: string;
  timeTo?: string;
  conductedByName: string;
  conductedByDesignation?: string;
  topicsCovered: string[];
  attendees: AttendeeForm[];
  notes?: string;
};

const SafetyInductionPage = () => {
  const [modalOpened, setModalOpened] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const navigate = useNavigate();
  const { sites, loading: sitesLoading } = useSites();
  const { contractors, loading: contractorsLoading, createNewContractor } = useContractors();
  const { can, loading: permissionsLoading, roles } = usePermissions();

  const canView = can('SafetyInduction', 'view');
  const canCreate = can('SafetyInduction', 'add');
  const canEdit = can('SafetyInduction', 'edit');
  const isSuperAdmin = roles.includes('SuperAdmin');

  const defaultValues: SafetyInductionFormValues = {
    projectName: '',
    projectLocation: '',
    organizationName: '',
    contractorName: '',
    contractorId: undefined,
    projectInCharge: '',
    siteId: undefined,
    inductionDate: new Date(),
    timeFrom: '',
    timeTo: '',
    conductedByName: '',
    conductedByDesignation: '',
    topicsCovered: SAFETY_TOPICS,
    attendees: [defaultAttendee(0)],
    notes: '',
  };

  const form = useForm<SafetyInductionFormValues>({
    defaultValues,
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

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({ control, name: 'attendees' });
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

  const fetchRecords = useCallback(async () => {
    if (!canView) {
      setRecords([]);
      return;
    }
    setLoadingRecords(true);
    try {
      const response = await listSafetyInductions({ limit: 10, page: 1 });
      setRecords(response?.result?.records ?? []);
    } catch (error: any) {
      showMessage(error?.message ?? 'Unable to load induction records', 'error');
    } finally {
      setLoadingRecords(false);
    }
  }, [canView]);

  useEffect(() => {
    if (!permissionsLoading && canView) {
      fetchRecords();
    }
  }, [fetchRecords, permissionsLoading, canView]);

  const closeFormModal = useCallback(() => {
    setModalOpened(false);
    setIsEditMode(false);
    setEditingRecordId(null);
  }, []);

  const setFormValuesFromRecord = useCallback(
    (record: any) => {
      const attendees = Array.isArray(record.attendees)
        ? record.attendees.map((attendee: any, index: number) => ({
            govIdType: attendee.govIdType ?? 'AADHAR',
            govIdNumber: attendee.govIdNumber ?? '',
            name: attendee.name ?? '',
            age: attendee.age ?? undefined,
            gender: attendee.gender ?? 'Male',
            designation: attendee.designation ?? '',
            inductionNumber:
              attendee.inductionNumber ?? `SW ${String(index + 1).padStart(2, '0')}`,
            signature: attendee.signature ?? undefined,
          }))
        : [defaultAttendee(0)];

      reset({
        projectName: record.projectName ?? record.site?.name ?? '',
        projectLocation: record.projectLocation ?? record.site?.location ?? '',
        organizationName: record.organizationName ?? record.site?.companyName ?? '',
        contractorName: record.contractorName ?? record.contractor?.name ?? '',
        contractorId: record.contractor?.id ?? undefined,
        projectInCharge: record.projectInCharge ?? '',
        siteId: record.site?.id ?? undefined,
        inductionDate: record.inductionDate ? new Date(record.inductionDate) : new Date(),
        timeFrom: record.timeFrom ?? '',
        timeTo: record.timeTo ?? '',
        conductedByName: record.conductedByName ?? '',
        conductedByDesignation: record.conductedByDesignation ?? '',
        topicsCovered:
          Array.isArray(record.topicsCovered) && record.topicsCovered.length
            ? record.topicsCovered
            : SAFETY_TOPICS,
        attendees: attendees.length ? attendees : [defaultAttendee(0)],
        notes: record.notes ?? '',
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

  const handleViewRecord = useCallback(
    (record: any) => {
      if (!isSuperAdmin) return;
      setSelectedRecord(record);
      setViewModalOpened(true);
    },
    [isSuperAdmin]
  );

  const closeViewModal = useCallback(() => {
    setSelectedRecord(null);
    setViewModalOpened(false);
  }, []);

  const openCreateModal = () => {
    if (!canCreate) {
      showMessage('You do not have permission to record inductions', 'error');
      return;
    }
    reset({
      projectName: '',
      projectLocation: '',
      organizationName: '',
      contractorName: '',
      contractorId: undefined,
      projectInCharge: '',
      siteId: undefined,
      inductionDate: new Date(),
      timeFrom: '',
      timeTo: '',
      conductedByName: '',
      conductedByDesignation: '',
      topicsCovered: SAFETY_TOPICS,
      attendees: [defaultAttendee(0)],
      notes: '',
    });
    setIsEditMode(false);
    setEditingRecordId(null);
    setModalOpened(true);
  };

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
      // errors handled in hook toast
    }
  };

  const handleFetchProfile = async (index: number) => {
    const attendee = getValues(`attendees.${index}`);
    if (!attendee.govIdNumber) {
      showMessage('Enter Government ID number to fetch profile', 'error');
      return;
    }

    try {
      const response = await fetchWorkerProfile({ govIdNumber: attendee.govIdNumber });
      const profile = response?.result;
      if (!profile) {
        showMessage('Profile not found', 'error');
        return;
      }

      setValue(`attendees.${index}.name`, profile.name ?? '');
      setValue(`attendees.${index}.age`, profile.age ?? undefined);
      setValue(`attendees.${index}.gender`, profile.gender ?? 'Male');
      setValue(`attendees.${index}.designation`, profile.designation ?? '');
      setValue(`attendees.${index}.inductionNumber`, profile.nextInductionNumber ?? attendee.inductionNumber);
      setValue(`attendees.${index}.signature`, profile.signature ?? undefined);

      if (profile.site?.id) {
        setValue('siteId', profile.site.id);
        if (profile.site.name) setValue('projectName', profile.site.name);
        if (profile.site.location) setValue('projectLocation', profile.site.location);
        if (profile.site.companyName) setValue('organizationName', profile.site.companyName);
      }

      if (profile.contractor?.id) {
        setValue('contractorId', profile.contractor.id);
      }
      if (profile.contractorName || profile.contractor?.name) {
        setValue('contractorName', profile.contractorName ?? profile.contractor?.name ?? '');
      }

      showMessage('Profile details loaded');
    } catch (error: any) {
      showMessage(error?.message ?? 'Unable to fetch profile', 'error');
    }
  };

  const onSubmit = async (values: SafetyInductionFormValues) => {
    if (!values.inductionDate) {
      showMessage('Please select induction date', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const inductionDateValue =
        values.inductionDate instanceof Date
          ? values.inductionDate
          : values.inductionDate
          ? new Date(values.inductionDate as unknown as string)
          : null;

      if (!inductionDateValue || Number.isNaN(inductionDateValue.getTime())) {
        showMessage('Induction date is invalid', 'error');
        setSubmitting(false);
        return;
      }

      const payload: SafetyInductionPayload = {
        siteId: values.siteId,
        contractorId: values.contractorId,
        projectName: values.projectName,
        projectLocation: values.projectLocation,
        organizationName: values.organizationName,
        contractorName: values.contractorName,
        projectInCharge: values.projectInCharge,
        inductionDate: inductionDateValue.toISOString(),
        timeFrom: values.timeFrom,
        timeTo: values.timeTo,
        conductedByName: values.conductedByName,
        conductedByDesignation: values.conductedByDesignation,
        topicsCovered: values.topicsCovered,
        attendees: values.attendees.map((attendee) => ({
          ...attendee,
          signature: attendee.signature,
        })),
        notes: values.notes,
      };

      if (isEditMode && editingRecordId) {
        const response = await updateSafetyInduction(editingRecordId, payload);
        showMessage('Safety induction updated successfully');
        const updatedRecord = response?.result;
        if (updatedRecord) {
          setRecords((prev) =>
            prev.map((item) => (item._id === editingRecordId ? updatedRecord : item))
          );
        } else {
          await fetchRecords();
        }
        closeFormModal();
      } else {
        const response = await createSafetyInduction(payload);
        showMessage('Safety induction recorded successfully');
        closeFormModal();
        await fetchRecords();

        const createdId = response?.result?._id;
        if (createdId) {
          navigate(`/ehs/safety-induction/print/${createdId}`);
        }
      }
    } catch (error: any) {
      showMessage(error?.message ?? 'Failed to record induction', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EhsPageLayout
      title="Safety Induction"
      description="Digitally capture induction registrations, auto-fill worker profiles, and generate formatted printouts for records."
      actions={
        canCreate ? (
          <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
            Record Induction
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
          You do not have permission to view safety induction data. Contact a SuperAdmin to request
          access.
        </Alert>
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            <Card withBorder radius="md" padding="lg" shadow="sm">
              <Stack gap={4}>
                <Text size="sm" c="dimmed">
                  Total inductions (last 30 days)
                </Text>
                <Text size="xl" fw={700}>
                  {records.length}
                </Text>
              </Stack>
            </Card>
            <Card withBorder radius="md" padding="lg" shadow="sm">
              <Stack gap={4}>
                <Text size="sm" c="dimmed">
                  Latest facilitator
                </Text>
                <Text size="xl" fw={700}>
                  {records[0]?.conductedByName ?? '—'}
                </Text>
              </Stack>
            </Card>
            <Card withBorder radius="md" padding="lg" shadow="sm">
              <Stack gap={4}>
                <Text size="sm" c="dimmed">
                  Contractor
                </Text>
                <Text size="xl" fw={700}>
                  {records[0]?.contractorName ?? '—'}
                </Text>
              </Stack>
            </Card>
          </SimpleGrid>

          <Card withBorder radius="md" shadow="sm" padding="lg">
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={4}>Recent Inductions</Title>
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
                        <Table.Th>Date</Table.Th>
                        <Table.Th>Project</Table.Th>
                        <Table.Th>Contractor</Table.Th>
                        <Table.Th>Facilitator</Table.Th>
                        <Table.Th align="right">Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {records.length === 0 ? (
                        <Table.Tr>
                          <Table.Td colSpan={5}>
                            <Text size="sm" c="dimmed" ta="center">
                              No induction records captured yet.
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      ) : (
                        records.map((item) => (
                          <Table.Tr key={item._id}>
                            <Table.Td>{formatDate(item.inductionDate)}</Table.Td>
                            <Table.Td>{item.projectName}</Table.Td>
                            <Table.Td>{item.contractorName}</Table.Td>
                            <Table.Td>{item.conductedByName}</Table.Td>
                            <Table.Td align="right">
                              <Group gap="xs" justify="flex-end">
                                {isSuperAdmin ? (
                                  <>
                                    <ActionIcon
                                      variant="light"
                                      color="blue"
                                      aria-label="View safety induction"
                                      onClick={() => handleViewRecord(item)}
                                    >
                                      <IconEye size={16} />
                                    </ActionIcon>
                                    <ActionIcon
                                      variant="light"
                                      color="orange"
                                      aria-label="Edit safety induction"
                                      onClick={() => handleEditRecord(item)}
                                    >
                                      <IconPencil size={16} />
                                    </ActionIcon>
                                  </>
                                ) : null}
                                <ActionIcon
                                  variant="light"
                                  color="gray"
                                  aria-label="Print safety induction"
                                  onClick={() => navigate(`/ehs/safety-induction/print/${item._id}`)}
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
            title={isEditMode ? 'Edit Safety Induction' : 'Record Safety Induction'}
            centered
            overlayProps={{ blur: 3 }}
          >
            <ScrollArea h="70vh" type="scroll">
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack gap="xl" p="sm">
                  <Card withBorder radius="md" padding="lg" shadow="xs">
                    <Stack gap="md">
                      <Title order={5}>Project Details</Title>
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
                              searchable
                              clearable
                              nothingFoundMessage={sitesLoading ? 'Loading...' : 'No sites'}
                              onChange={(value) => {
                                field.onChange(value ?? undefined);
                                const selected = sites.find((site) => site._id === value);
                                if (selected) {
                                  setValue('projectName', selected.name ?? '');
                                  setValue('projectLocation', selected.location ?? '');
                                  setValue('organizationName', selected.companyName ?? '');
                                }
                              }}
                            />
                          )}
                        />
                        <Controller
                          control={control}
                          name="projectName"
                          rules={{ required: 'Project name is required' }}
                          render={({ field }) => (
                            <TextInput
                              {...field}
                              label="Project Name"
                              placeholder="Project / Site"
                              error={errors.projectName?.message}
                            />
                          )}
                        />
                        <Controller
                          control={control}
                          name="projectLocation"
                          rules={{ required: 'Project location is required' }}
                          render={({ field }) => (
                            <TextInput
                              {...field}
                              label="Project Location"
                              placeholder="Location"
                              error={errors.projectLocation?.message}
                            />
                          )}
                        />
                        <Controller
                          control={control}
                          name="organizationName"
                          render={({ field }) => (
                            <TextInput {...field} label="Organization / Client" placeholder="Organization" />
                          )}
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
                          rules={{ required: 'Contractor name is required' }}
                          render={({ field }) => (
                            <TextInput
                              {...field}
                              label="Contractor Name"
                              placeholder="Contractor"
                              error={errors.contractorName?.message}
                            />
                          )}
                        />
                        <Controller
                          control={control}
                          name="projectInCharge"
                          render={({ field }) => (
                            <TextInput {...field} label="Project In-charge" placeholder="Project In-charge" />
                          )}
                        />
                      </SimpleGrid>
                    </Stack>
                  </Card>

                  <Card withBorder radius="md" padding="lg" shadow="xs">
                    <Stack gap="md">
                      <Title order={5}>Induction Session</Title>
                      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                        <Controller
                          control={control}
                          name="inductionDate"
                          rules={{ required: true }}
                          render={({ field }) => (
                            <DateInput
                              label="Induction Date"
                              value={field.value}
                              onChange={field.onChange}
                              error={errors.inductionDate ? 'Date is required' : undefined}
                            />
                          )}
                        />
                        <Controller
                          control={control}
                          name="timeFrom"
                          render={({ field }) => (
                            <TextInput {...field} label="Time - From" placeholder="09:00" />
                          )}
                        />
                        <Controller
                          control={control}
                          name="timeTo"
                          render={({ field }) => (
                            <TextInput {...field} label="Time - To" placeholder="10:00" />
                          )}
                        />
                        <Controller
                          control={control}
                          name="conductedByName"
                          rules={{ required: 'Facilitator name is required' }}
                          render={({ field }) => (
                            <TextInput
                              {...field}
                              label="Conducted By"
                              placeholder="Facilitator name"
                              error={errors.conductedByName?.message}
                            />
                          )}
                        />
                        <Controller
                          control={control}
                          name="conductedByDesignation"
                          render={({ field }) => (
                            <TextInput
                              {...field}
                              label="Facilitator Designation"
                              placeholder="Designation"
                            />
                          )}
                        />
                      </SimpleGrid>
                      <Controller
                        control={control}
                        name="topicsCovered"
                        render={({ field }) => (
                          <MultiSelect
                            data={SAFETY_TOPICS.map((topic) => ({ label: topic, value: topic }))}
                            label="Topics Covered"
                            placeholder="Select topics"
                            searchable
                            clearable
                            value={field.value}
                            onChange={field.onChange}
                            nothingFoundMessage="No topics"
                          />
                        )}
                      />
                    </Stack>
                  </Card>

                  <Card withBorder radius="md" padding="lg" shadow="xs">
                    <Stack gap="md">
                      <Group justify="space-between" align="center">
                        <Title order={5}>Workforce Attendees</Title>
                        <Button
                          variant="light"
                          size="xs"
                          leftSection={<IconPlus size={14} />}
                          onClick={() => canCreate && append(defaultAttendee(fields.length))}
                          disabled={!canCreate}
                        >
                          Add Attendee
                        </Button>
                      </Group>

                      <Stack gap="md">
                        {fields.map((field, index) => (
                          <Card key={field.id} withBorder radius="md" padding="md" shadow="xs">
                            <Stack gap="md">
                              <Group justify="space-between" align="center">
                                <Group gap="xs">
                                  <Badge color="blue" variant="light">
                                    #{index + 1}
                                  </Badge>
                                  <Text fw={600}>Attendee</Text>
                                </Group>
                                {fields.length > 1 && canEdit ? (
                                  <ActionIcon
                                    variant="subtle"
                                    color="red"
                                    onClick={() => remove(index)}
                                    aria-label="Remove attendee"
                                  >
                                    <IconTrash size={16} />
                                  </ActionIcon>
                                ) : null}
                              </Group>
                              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                                <Controller
                                  control={control}
                                  name={`attendees.${index}.govIdType` as const}
                                  render={({ field: attendeeField }) => (
                                    <Select {...attendeeField} label="Gov. ID Type" data={GOV_ID_OPTIONS} />
                                  )}
                                />
                                <Controller
                                  control={control}
                                  name={`attendees.${index}.govIdNumber` as const}
                                  rules={{ required: 'Gov. ID is required' }}
                                  render={({ field: attendeeField }) => (
                                    <TextInput
                                      {...attendeeField}
                                      label="Gov. ID Number"
                                      placeholder="e.g. 1200 2114 5885"
                                      error={errors.attendees?.[index]?.govIdNumber?.message as string}
                                    />
                                  )}
                                />
                                <Button
                                  variant="light"
                                  leftSection={<IconUserCheck size={14} />}
                                  onClick={() => handleFetchProfile(index)}
                                  mt={24}
                                  disabled={!canCreate}
                                >
                                  Fetch Profile
                                </Button>
                                <Controller
                                  control={control}
                                  name={`attendees.${index}.name` as const}
                                  rules={{ required: 'Name is required' }}
                                  render={({ field: attendeeField }) => (
                                    <TextInput
                                      {...attendeeField}
                                      label="Name"
                                      placeholder="Worker name"
                                      error={errors.attendees?.[index]?.name?.message as string}
                                    />
                                  )}
                                />
                                <Controller
                                  control={control}
                                  name={`attendees.${index}.age` as const}
                                  render={({ field: attendeeField }) => (
                                    <NumberInput
                                      {...attendeeField}
                                      label="Age"
                                      min={14}
                                      max={75}
                                      placeholder="Age"
                                    />
                                  )}
                                />
                                <Controller
                                  control={control}
                                  name={`attendees.${index}.gender` as const}
                                  render={({ field: attendeeField }) => (
                                    <Select {...attendeeField} label="Gender" data={GENDER_OPTIONS} />
                                  )}
                                />
                                <Controller
                                  control={control}
                                  name={`attendees.${index}.designation` as const}
                                  render={({ field: attendeeField }) => (
                                    <TextInput
                                      {...attendeeField}
                                      label="Designation"
                                      placeholder="Trade / Role"
                                    />
                                  )}
                                />
                                <Controller
                                  control={control}
                                  name={`attendees.${index}.inductionNumber` as const}
                                  render={({ field: attendeeField }) => (
                                    <TextInput
                                      {...attendeeField}
                                      label="Induction Number"
                                      placeholder="Auto generated"
                                    />
                                  )}
                                />
                              </SimpleGrid>

                              <SignaturePadField
                                label="Signature"
                                value={watch(`attendees.${index}.signature` as const)}
                                onChange={(val) => setValue(`attendees.${index}.signature` as const, val)}
                              />
                            </Stack>
                          </Card>
                        ))}
                      </Stack>
                    </Stack>
                  </Card>

                  <Card withBorder radius="md" padding="lg" shadow="xs">
                    <Stack gap="md">
                      <Title order={5}>Additional Notes</Title>
                      <Controller
                        control={control}
                        name="notes"
                        render={({ field }) => (
                          <Textarea {...field} minRows={3} placeholder="Optional remarks" />
                        )}
                      />
                    </Stack>
                  </Card>

                  <Group justify="space-between">
                    <Button variant="default" onClick={closeFormModal}>
                      Cancel
                    </Button>
                    <Button type="submit" loading={submitting} disabled={!canCreate}>
                      {isEditMode ? 'Update Induction' : 'Submit Induction'}
                    </Button>
                  </Group>
                </Stack>
              </form>
            </ScrollArea>
          </Modal>
          <Modal
            opened={contractorModalOpened && canCreate}
            onClose={() => setContractorModalOpened(false)}
            title="Add Contractor"
            size="lg"
            centered
            keepMounted
          >
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
          </Modal>
          <Modal
            opened={isSuperAdmin && viewModalOpened && !!selectedRecord}
            onClose={closeViewModal}
            title="Safety Induction Details"
            size="lg"
            centered
            keepMounted
          >
            {selectedRecord ? (
              <Stack gap="lg">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  {[
                    { label: 'Project', value: selectedRecord.projectName },
                    { label: 'Location', value: selectedRecord.projectLocation },
                    { label: 'Organization', value: selectedRecord.organizationName },
                    { label: 'Contractor', value: selectedRecord.contractorName },
                    { label: 'Conducted By', value: selectedRecord.conductedByName },
                    { label: 'Designation', value: selectedRecord.conductedByDesignation },
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
                      Session Details
                    </Text>
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                      <Text size="sm">
                        <Text component="span" fw={600}>
                          Induction Date:
                        </Text>{' '}
                        {formatDate(selectedRecord.inductionDate)}
                      </Text>
                      <Text size="sm">
                        <Text component="span" fw={600}>
                          Time:
                        </Text>{' '}
                        {[selectedRecord.timeFrom, selectedRecord.timeTo].filter(Boolean).join(' - ') || '—'}
                      </Text>
                    </SimpleGrid>
                  </Stack>
                </Card>

                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Stack gap={8}>
                    <Text size="sm" fw={600}>
                      Topics Covered
                    </Text>
                    {Array.isArray(selectedRecord.topicsCovered) && selectedRecord.topicsCovered.length ? (
                      <Group gap="xs">
                        {selectedRecord.topicsCovered.map((topic: string) => (
                          <Badge key={topic} color="blue" variant="light">
                            {topic}
                          </Badge>
                        ))}
                      </Group>
                    ) : (
                      <Text size="sm" c="dimmed">
                        No topics recorded.
                      </Text>
                    )}
                  </Stack>
                </Card>

                <Card withBorder radius="md" padding="md" shadow="xs">
                  <Stack gap={8}>
                    <Text size="sm" fw={600}>
                      Attendees
                    </Text>
                    <ScrollArea h={240} type="scroll">
                      <Table highlightOnHover withTableBorder>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>Name</Table.Th>
                            <Table.Th>Gov ID</Table.Th>
                            <Table.Th>Designation</Table.Th>
                            <Table.Th>Induction No.</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {(selectedRecord.attendees ?? []).map((attendee: any, index: number) => (
                            <Table.Tr key={`${attendee.govIdNumber ?? index}`}> 
                              <Table.Td>{attendee.name ?? '—'}</Table.Td>
                              <Table.Td>{attendee.govIdNumber ?? '—'}</Table.Td>
                              <Table.Td>{attendee.designation ?? '—'}</Table.Td>
                              <Table.Td>{attendee.inductionNumber ?? '—'}</Table.Td>
                            </Table.Tr>
                          ))}
                          {!selectedRecord.attendees?.length ? (
                            <Table.Tr>
                              <Table.Td colSpan={4}>
                                <Text size="sm" c="dimmed" ta="center">
                                  No attendees captured.
                                </Text>
                              </Table.Td>
                            </Table.Tr>
                          ) : null}
                        </Table.Tbody>
                      </Table>
                    </ScrollArea>
                  </Stack>
                </Card>

                {selectedRecord.notes ? (
                  <Card withBorder radius="md" padding="md" shadow="xs">
                    <Stack gap={4}>
                      <Text size="sm" fw={600}>
                        Notes
                      </Text>
                      <Text size="sm">{selectedRecord.notes}</Text>
                    </Stack>
                  </Card>
                ) : null}
              </Stack>
            ) : null}
          </Modal>
        </>
      )}
    </EhsPageLayout>
  );
};

const formatDate = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

export default SafetyInductionPage;
