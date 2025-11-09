import { useCallback, useMemo, useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import {
  Badge,
  Button,
  Card,
  Group,
  Modal,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  ActionIcon,
  Loader,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconPlus, IconPrinter, IconUserCheck, IconEye, IconPencil } from '@tabler/icons-react';
import { showMessage } from '@/utils/Constant';
import EhsPageLayout from '@/components/ehs/EhsPageLayout';
import { useSites } from '@/hooks/useSites';
import { useContractors } from '@/hooks/useContractors';
import { fetchWorkerProfile, ToolBoxTalkPayload } from '@/apis/ehs';
import SignaturePadField from '@/components/ehs/SignaturePadField';
import { useToolBoxTalks } from '@/hooks/useToolBoxTalks';

type ToolBoxTalkAttendee = {
  govIdType?: string;
  govIdNumber?: string;
  name: string;
  designation?: string;
  subContractorName?: string;
  remarks?: string;
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

type ToolBoxTalkFormValues = {
  formNo: string;
  revisionNo: string;
  projectName: string;
  projectLocation: string;
  contractorName: string;
  contractorId?: string;
  siteId?: string;
  discussionPoint: string;
  talkDate: Date | null;
  talkTime?: string;
  conductedBy?: string;
  projectInCharge?: string;
  attendees: ToolBoxTalkAttendee[];
};

const defaultAttendee = (index: number): ToolBoxTalkAttendee => ({
  govIdType: 'AADHAR',
  govIdNumber: '',
  name: '',
  designation: '',
  subContractorName: '',
  remarks: '',
  signature: undefined,
});

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString();
};

const ToolBoxTalkPage = () => {
  const [contractorModalOpened, setContractorModalOpened] = useState(false);
  const { sites, loading: sitesLoading } = useSites();
  const { contractors, loading: contractorsLoading, createNewContractor } = useContractors();
  const [modalOpened, setModalOpened] = useState(false);
  const { records, loading, fetchTalks, createTalk, updateTalk } = useToolBoxTalks({ limit: 50 });
  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  const defaultValues: ToolBoxTalkFormValues = {
    formNo: 'EHS-F-03',
    revisionNo: '00',
    projectName: '',
    projectLocation: '',
    contractorName: '',
    contractorId: undefined,
    siteId: undefined,
    discussionPoint: '',
    talkDate: new Date(),
    talkTime: '',
    conductedBy: '',
    projectInCharge: '',
    attendees: [defaultAttendee(0)],
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<ToolBoxTalkFormValues>({
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'attendees',
  });

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

  const watchedSiteId = watch('siteId');
  const watchedContractorId = watch('contractorId');

  useEffect(() => {
    if (!watchedSiteId) {
      setValue('projectName', '');
      setValue('projectLocation', '');
      return;
    }

    const selectedSite = sites.find((site) => site._id === watchedSiteId);
    if (selectedSite) {
      setValue('projectName', selectedSite.name ?? '');
      setValue('projectLocation', selectedSite.location ?? '');
    }
  }, [watchedSiteId, sites, setValue]);

  useEffect(() => {
    if (!watchedContractorId) {
      setValue('contractorName', '');
      return;
    }

    const selectedContractor = contractors.find((contractor) => contractor._id === watchedContractorId);
    if (selectedContractor) {
      setValue('contractorName', selectedContractor.name ?? '');
    }
  }, [watchedContractorId, contractors, setValue]);

  const handleFetchProfile = useCallback(
    async (index: number) => {
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

        if (profile.site?.id) {
          setValue('siteId', profile.site.id);
          setValue('projectName', profile.site.name ?? '');
          setValue('projectLocation', profile.site.location ?? '');
        }

        if (profile.contractor?.id) {
          setValue('contractorId', profile.contractor.id);
          setValue('contractorName', profile.contractor.name ?? profile.contractorName ?? '');
        }

        setValue(`attendees.${index}.name`, profile.name ?? '');
        setValue(`attendees.${index}.designation`, profile.designation ?? '');
        setValue(`attendees.${index}.subContractorName`, profile.contractor?.name ?? '');
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to fetch profile', 'error');
      }
    },
    [getValues, setValue]
  );

  const openForm = useCallback(() => {
    reset({ ...defaultValues });
    setModalOpened(true);
    setEditingRecordId(null);
  }, [reset]);

  const closeForm = useCallback(() => {
    setModalOpened(false);
    setEditingRecordId(null);
  }, []);

  const handlePrintRecord = useCallback((record: any) => {
    const MAX_ROWS = 20;
    const attendees = record.attendees || [];

    const filledRows = Array.from({ length: MAX_ROWS }, (_, index) => {
      const attendee = attendees[index];
      if (!attendee) {
        return `
          <tr>
            <td>${index + 1}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        `;
      }

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${attendee.name || ''}</td>
          <td>${attendee.designation || ''}</td>
          <td>${attendee.subContractorName || ''}</td>
          <td style="text-align:center;">
            ${attendee.signature ? `<img src="${attendee.signature}" alt="Signature" style="height:48px;" />` : ''}
          </td>
          <td>${attendee.remarks || ''}</td>
        </tr>
      `;
    }).join('');

    const html = `
      <html>
        <head>
          <title>Daily Tool Box Talk Meeting Attendance Record</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { font-size: 20px; margin: 0; text-align: center; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 6px; font-size: 12px; }
            th { background: #f2f2f2; }
            .header-table td { border: 1px solid #000; padding: 6px; font-size: 12px; }
            .header-table { margin-top: 12px; margin-bottom: 12px; }
            .meta-table td { border: 1px solid #000; padding: 6px; font-size: 12px; }
            .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
            .footer { margin-top: 24px; font-size: 12px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td colspan="4" style="text-align:center;"><h1>Daily TOOL BOX TALK Meeting Attendance Record</h1></td>
              <td>Format No: <strong>EHS-F-03</strong></td>
              <td>Rev. No: <strong>00</strong></td>
            </tr>
          </table>
          <table class="meta-table">
            <tr>
              <td colspan="4"><strong>Name of project:</strong> ${record.site?.name || record.projectName || ''}</td>
              <td><strong>Date:</strong> ${formatDate(record.talkDate)}</td>
              <td><strong>Time:</strong> ${record.talkTime || ''}</td>
            </tr>
            <tr>
              <td colspan="6"><strong>Project Location:</strong> ${record.site?.location || record.projectLocation || ''}</td>
            </tr>
            <tr>
              <td colspan="6"><strong>Name of Contractor:</strong> ${record.contractor?.name || record.contractorName || ''}</td>
            </tr>
            <tr>
              <td colspan="6"><strong>Point Discussed in Tool Box Talk:</strong> ${record.discussionPoint || ''}</td>
            </tr>
          </table>
          <table>
            <thead>
              <tr>
                <th>Sr. no</th>
                <th>Name of Person</th>
                <th>Designation</th>
                <th>Sub Contractor name</th>
                <th style="width:120px;">Signature</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${filledRows}
            </tbody>
          </table>
          <div class="footer">
            <div>Conducted by: ${record.conductedBy || '_________________'}</div>
            <div>Conducted Signature: ___________________</div>
          </div>
          <div class="footer">
            <div>Project In Charge: ${record.projectInCharge || '_________________'}</div>
            <div></div>
          </div>
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
  }, [records]);

  const handleEditRecord = useCallback(
    (record: any) => {
      setEditingRecordId(record._id);
      reset({
        formNo: record.formNo || 'EHS-F-03',
        revisionNo: record.revisionNo || '00',
        projectName: record.site?.name || record.projectName || '',
        projectLocation: record.site?.location || record.projectLocation || '',
        contractorName: record.contractor?.name || record.contractorName || '',
        contractorId: record.contractor?.id,
        siteId: record.site?.id,
        discussionPoint: record.discussionPoint || '',
        talkDate: record.talkDate ? new Date(record.talkDate) : new Date(),
        talkTime: record.talkTime || '',
        conductedBy: record.conductedBy || '',
        projectInCharge: record.projectInCharge || '',
        attendees:
          record.attendees && record.attendees.length > 0
            ? record.attendees
            : [defaultAttendee(0)],
      });
      setModalOpened(true);
    },
    [reset]
  );

  const handleViewRecord = useCallback((record: any) => {
    setSelectedRecord(record);
    setViewModalOpened(true);
  }, []);

  const onSubmit = useCallback(
    async (values: ToolBoxTalkFormValues) => {
      try {
        const payload: ToolBoxTalkPayload = {
          formNo: values.formNo,
          revisionNo: values.revisionNo,
          siteId: values.siteId,
          contractorId: values.contractorId,
          discussionPoint: values.discussionPoint,
          talkDate:
            values.talkDate instanceof Date ? values.talkDate.toISOString() : new Date(values.talkDate ?? new Date()).toISOString(),
          talkTime: values.talkTime,
          conductedBy: values.conductedBy,
          projectInCharge: values.projectInCharge,
          attendees: values.attendees,
        };

        if (editingRecordId) {
          await updateTalk(editingRecordId, payload);
        } else {
          await createTalk(payload);
        }

        await fetchTalks();
        showMessage('Tool box talk saved');
        setModalOpened(false);
        reset({ ...defaultValues });
        setEditingRecordId(null);
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to save tool box talk', 'error');
      }
    },
    [createTalk, fetchTalks, reset, updateTalk, editingRecordId]
  );

  const onCreateContractor = useCallback(
    async (contractorValues: ContractorFormValues) => {
      try {
        const response = await createNewContractor(contractorValues);
        if (response?._id) {
          setValue('contractorId', response._id);
          setValue('contractorName', response.name ?? '');
        } else {
          await Promise.resolve();
        }

        showMessage('Contractor added successfully');
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
    },
    [createNewContractor, resetContractorForm, setValue]
  );

  return (
    <EhsPageLayout
      title="Daily Tool Box Talk Meeting Attendance Record"
      description="Log discussion points, participants, and outcomes for toolbox talks."
      actions={
        <Button leftSection={<IconPlus size={16} />} onClick={openForm}>
          Record Tool Box Talk
        </Button>
      }
    >
      <Card withBorder radius="md" padding="lg" shadow="sm">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <Text fw={600}>Document Reference:</Text>
            <Badge color="blue">EHS-F-03</Badge>
          </Group>
          <Group gap="xs">
            <Text size="sm" c="dimmed">
              Revision No.
            </Text>
            <Badge variant="light">00</Badge>
          </Group>
        </Group>

        <Text size="sm" c="dimmed" mt="md">
          Click “Record Tool Box Talk” to open the attendance form.
        </Text>
      </Card>

      <Card withBorder radius="md" padding="lg" shadow="sm">
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={600}>Logged Sessions</Text>
            <Text size="sm" c="dimmed">
              Showing {records.length} record(s)
            </Text>
          </Group>
          <ScrollArea>
            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Time</Table.Th>
                  <Table.Th>Site</Table.Th>
                  <Table.Th>Contractor</Table.Th>
                  <Table.Th>Discussion Point</Table.Th>
                  <Table.Th align="right">Participants</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {loading ? (
                  <Table.Tr>
                    <Table.Td colSpan={6}>
                      <Group justify="center" py="md">
                        <Loader size="sm" />
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ) : records.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={6}>
                      <Text size="sm" c="dimmed" ta="center">
                        No toolbox talk records captured yet.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  records.map((record) => (
                    <Table.Tr key={record._id}>
                      <Table.Td>{formatDate(record.talkDate)}</Table.Td>
                      <Table.Td>{record.talkTime || '—'}</Table.Td>
                      <Table.Td>{record.site?.name || record.projectName}</Table.Td>
                      <Table.Td>{record.contractor?.name || record.contractorName}</Table.Td>
                      <Table.Td>{record.discussionPoint}</Table.Td>
                      <Table.Td align="right">
                        <Group gap="xs" justify="flex-end">
                          <Badge color="blue" variant="light">
                            {record.attendees?.length ?? 0}
                          </Badge>
                          <ActionIcon
                            variant="light"
                            color="gray"
                            aria-label="Print talk"
                            onClick={() => handlePrintRecord(record)}
                          >
                            <IconPrinter size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="blue"
                            aria-label="View talk"
                            onClick={() => handleViewRecord(record)}
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="orange"
                            aria-label="Edit talk"
                            onClick={() => handleEditRecord(record)}
                          >
                            <IconPencil size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Stack>
      </Card>

      <Modal
        opened={modalOpened}
        onClose={closeForm}
        title="Record Tool Box Talk"
        size="80%"
        centered
        overlayProps={{ blur: 3 }}
      >
        <ScrollArea h="70vh" type="scroll">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="xl" p="sm">
              <Group justify="space-between">
                <Group gap="xs">
                  <Text fw={600}>Document Reference:</Text>
                  <Badge color="blue">EHS-F-03</Badge>
                </Group>
                <Group gap="xs">
                  <Text size="sm" c="dimmed">
                    Revision No.
                  </Text>
                  <Badge variant="light">00</Badge>
                </Group>
              </Group>

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
                          setValue('projectName', selected.name ?? '');
                          setValue('projectLocation', selected.location ?? '');
                        }
                      }}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="projectName"
                  rules={{ required: 'Site name is required' }}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      label="Site Name"
                      placeholder="Auto-filled from selected site"
                      readOnly
                      error={errors.projectName?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="projectLocation"
                  rules={{ required: 'Site location is required' }}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      label="Site Location"
                      placeholder="Auto-filled from selected site"
                      readOnly
                      error={errors.projectLocation?.message}
                    />
                  )}
                />
              </SimpleGrid>

              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                <Controller
                  control={control}
                  name="projectInCharge"
                  render={({ field }) => (
                    <TextInput {...field} label="Project In Charge" placeholder="Project in charge" />
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
                      label="Name of Contractor"
                      placeholder="Contractor name"
                      readOnly
                      error={errors.contractorName?.message}
                    />
                  )}
                />
              </SimpleGrid>

              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                <Controller
                  control={control}
                  name="talkDate"
                  rules={{ required: true }}
                  render={({ field }) => (
                    <DateInput
                      label="Date"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.talkDate ? 'Date is required' : undefined}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="talkTime"
                  render={({ field }) => (
                    <TextInput {...field} label="Time" placeholder="14:00" />
                  )}
                />
                <Controller
                  control={control}
                  name="conductedBy"
                  render={({ field }) => (
                    <TextInput {...field} label="Conducted By" placeholder="Talk facilitator" />
                  )}
                />
              </SimpleGrid>

              <Controller
                control={control}
                name="discussionPoint"
                rules={{ required: 'Discussion point is required' }}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    label="Point Discussed in Tool Box Talk"
                    placeholder="USE OF PPEs AND ITS BENEFIT"
                    minRows={3}
                    error={errors.discussionPoint?.message}
                  />
                )}
              />

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Stack gap="md">
                  <Group justify="space-between" align="center">
                    <Text fw={600}>Participants</Text>
                    <Button
                      variant="light"
                      size="xs"
                      leftSection={<IconPlus size={14} />}
                      onClick={() => append(defaultAttendee(fields.length))}
                    >
                      Add Participant
                    </Button>
                  </Group>

                  <Stack gap="md">
                    {fields.map((field, index) => (
                      <Card key={field.id} withBorder radius="md" padding="md" shadow="xs">
                        <Stack gap="md">
                          <Group justify="space-between">
                            <Group gap="xs">
                              <Badge color="blue" variant="light">
                                #{index + 1}
                              </Badge>
                              <Text fw={600}>Participant</Text>
                            </Group>
                            {fields.length > 1 ? (
                              <Button
                                variant="subtle"
                                color="red"
                                size="xs"
                                onClick={() => remove(index)}
                              >
                                Remove
                              </Button>
                            ) : null}
                          </Group>

                          <SimpleGrid cols={{ base: 1, md: 4 }} spacing="md">
                            <Controller
                              control={control}
                              name={`attendees.${index}.govIdType` as const}
                              render={({ field: attendeeField }) => (
                                <TextInput {...attendeeField} label="Gov ID Type" placeholder="AADHAR" />
                              )}
                            />
                            <Controller
                              control={control}
                              name={`attendees.${index}.govIdNumber` as const}
                              render={({ field: attendeeField }) => (
                                <TextInput
                                  {...attendeeField}
                                  label="Gov ID Number"
                                  placeholder="1200 2114 5885"
                                />
                              )}
                            />
                            <Button
                              variant="light"
                              leftSection={<IconUserCheck size={14} />}
                              onClick={() => handleFetchProfile(index)}
                              mt={{ base: 0, md: 24 }}
                            >
                              Fetch Profile
                            </Button>
                          </SimpleGrid>

                          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                            <Controller
                              control={control}
                              name={`attendees.${index}.name` as const}
                              rules={{ required: 'Name is required' }}
                              render={({ field: attendeeField }) => (
                                <TextInput
                                  {...attendeeField}
                                  label="Name of Person"
                                  placeholder="Participant name"
                                  error={errors.attendees?.[index]?.name?.message as string}
                                />
                              )}
                            />
                            <Controller
                              control={control}
                              name={`attendees.${index}.designation` as const}
                              render={({ field: attendeeField }) => (
                                <TextInput
                                  {...attendeeField}
                                  label="Designation"
                                  placeholder="Role / Trade"
                                />
                              )}
                            />
                            <Controller
                              control={control}
                              name={`attendees.${index}.subContractorName` as const}
                              render={({ field: attendeeField }) => (
                                <TextInput
                                  {...attendeeField}
                                  label="Sub Contractor Name"
                                  placeholder="Sub contractor"
                                />
                              )}
                            />
                          </SimpleGrid>

                          <SignaturePadField
                            label="Signature"
                            value={getValues(`attendees.${index}.signature` as const)}
                            onChange={(val) => setValue(`attendees.${index}.signature` as const, val)}
                          />

                          <Controller
                            control={control}
                            name={`attendees.${index}.remarks` as const}
                            render={({ field: attendeeField }) => (
                              <TextInput {...attendeeField} label="Remarks" placeholder="Remarks" />
                            )}
                          />
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                </Stack>
              </Card>

              <Group justify="flex-end">
                <Button type="submit">Save Tool Box Talk</Button>
              </Group>
            </Stack>
          </form>
        </ScrollArea>
      </Modal>

      <Modal
        opened={contractorModalOpened}
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
        opened={viewModalOpened && !!selectedRecord}
        onClose={() => {
          setViewModalOpened(false);
          setSelectedRecord(null);
        }}
        title="Tool Box Talk"
        size="lg"
        centered
      >
        {selectedRecord ? (
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Site
                </Text>
                <Text fw={600}>{selectedRecord.site?.name || selectedRecord.projectName || '—'}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Contractor
                </Text>
                <Text fw={600}>{selectedRecord.contractor?.name || selectedRecord.contractorName || '—'}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Date
                </Text>
                <Text fw={600}>{formatDate(selectedRecord.talkDate)}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Time
                </Text>
                <Text fw={600}>{selectedRecord.talkTime || '—'}</Text>
              </Card>
            </SimpleGrid>

            <Card withBorder radius="md" padding="md" shadow="xs">
              <Text size="sm" c="dimmed">
                Discussion Point
              </Text>
              <Text size="sm">{selectedRecord.discussionPoint || '—'}</Text>
            </Card>

            <Table striped withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Sr. No.</Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Designation</Table.Th>
                  <Table.Th>Sub Contractor</Table.Th>
                  <Table.Th>Remarks</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {(selectedRecord.attendees || []).map((attendee: any, idx: number) => (
                  <Table.Tr key={`${attendee.govIdNumber}-${idx}`}>
                    <Table.Td>{idx + 1}</Table.Td>
                    <Table.Td>{attendee.name}</Table.Td>
                    <Table.Td>{attendee.designation || '—'}</Table.Td>
                    <Table.Td>{attendee.subContractorName || '—'}</Table.Td>
                    <Table.Td>{attendee.remarks || '—'}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        ) : null}
      </Modal>
    </EhsPageLayout>
  );
};

export default ToolBoxTalkPage;