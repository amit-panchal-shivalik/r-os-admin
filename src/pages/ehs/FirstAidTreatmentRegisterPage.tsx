import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { IconAlertCircle, IconEye, IconPencil, IconPlus, IconPrinter, IconRefresh } from '@tabler/icons-react';
import dayjs from 'dayjs';
import EhsPageLayout from '@/components/ehs/EhsPageLayout';
import { useSites } from '@/hooks/useSites';
import { useContractors } from '@/hooks/useContractors';
import { usePermissions } from '@/hooks/usePermissions';
import { useFirstAidCases, FirstAidCaseRecord } from '@/hooks/useFirstAidCases';
import { FirstAidPayload } from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

type FirstAidFormValues = {
  siteId?: string;
  siteName: string;
  month: string;
  incidentDate: Date | null;
  incidentTime?: string;
  contractorId?: string;
  contractorName: string;
  injuredPerson: string;
  inductionNumber?: string;
  injuryDetails: string;
  treatmentProvided: string;
  treatmentGivenBy: string;
  facInvestigation?: string;
  investigatedBy?: string;
  remarks?: string;
};

const defaultValues: FirstAidFormValues = {
  siteId: undefined,
  siteName: '',
  month: dayjs().format('MMMM YYYY'),
  incidentDate: new Date(),
  incidentTime: '',
  contractorId: undefined,
  contractorName: '',
  injuredPerson: '',
  inductionNumber: '',
  injuryDetails: '',
  treatmentProvided: '',
  treatmentGivenBy: '',
  facInvestigation: '',
  investigatedBy: '',
  remarks: '',
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString();
};

const FirstAidTreatmentRegisterPage = () => {
  const [modalOpened, setModalOpened] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FirstAidCaseRecord | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { sites, loading: sitesLoading } = useSites();
  const { contractors, loading: contractorsLoading } = useContractors();
  const { can, loading: permissionsLoading, roles } = usePermissions();
  const {
    records,
    loading: recordsLoading,
    fetchCases,
    createCase,
    updateCase,
  } = useFirstAidCases({ limit: 50 });

  const isSuperAdmin = roles.includes('SuperAdmin');
  const canView = isSuperAdmin || can('FirstAidTreatmentRegister', 'view') || roles.length === 0;
  const canCreate = isSuperAdmin || can('FirstAidTreatmentRegister', 'add') || roles.length === 0;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    register,
    formState: { errors },
  } = useForm<FirstAidFormValues>({
    defaultValues,
  });

  const watchedSiteId = watch('siteId');
  const watchedContractorId = watch('contractorId');

  useEffect(() => {
    if (!watchedSiteId) {
      setValue('siteName', '');
      return;
    }

    const selectedSite = sites.find((site) => site._id === watchedSiteId);
    if (selectedSite) {
      setValue('siteName', selectedSite.name ?? '');
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

  useEffect(() => {
    if (!permissionsLoading && canView) {
      fetchCases().catch(() => undefined);
    }
  }, [permissionsLoading, canView, fetchCases]);

  const openCreateModal = () => {
    if (!canCreate) {
      showMessage('You do not have permission to add first aid entries', 'error');
      return;
    }
    reset({ ...defaultValues, month: dayjs().format('MMMM YYYY') });
    setIsEditMode(false);
    setEditingRecordId(null);
    setModalOpened(true);
  };

  const handleViewRecord = useCallback((record: any) => {
    setSelectedRecord(record);
    setViewModalOpen(true);
  }, []);

  const handleEditRecord = useCallback(
    (record: any) => {
      if (!isSuperAdmin && !can('FirstAidTreatmentRegister', 'edit')) {
        showMessage('You do not have permission to edit first aid entries', 'error');
        return;
      }

      setIsEditMode(true);
      setEditingRecordId(record._id);
      reset({
        siteId: record.site?.id ?? undefined,
        siteName: record.site?.name ?? '',
        month: record.month ?? dayjs(record.incidentDate).format('MMMM YYYY'),
        incidentDate: record.incidentDate ? new Date(record.incidentDate) : new Date(),
        incidentTime: record.incidentTime ?? '',
        contractorId: record.contractor?.id ?? undefined,
        contractorName: record.contractor?.name ?? '',
        injuredPerson: record.injuredPerson,
        inductionNumber: record.inductionNumber ?? '',
        injuryDetails: record.injuryDetails,
        treatmentProvided: record.treatmentProvided,
        treatmentGivenBy: record.treatmentGivenBy,
        facInvestigation: record.facInvestigation ?? '',
        investigatedBy: record.investigatedBy ?? '',
        remarks: record.remarks ?? '',
      });
      setModalOpened(true);
    },
    [can, isSuperAdmin, reset]
  );

  const closeFormModal = () => {
    setModalOpened(false);
    setIsEditMode(false);
    setEditingRecordId(null);
  };

  const closeViewModal = () => {
    setSelectedRecord(null);
    setViewModalOpen(false);
  };

  const handlePrintRecord = useCallback((record: any) => {
    const MAX_ROWS = 10;
    const rows = Array.from({ length: MAX_ROWS }, (_, index) => {
      if (index === 0) {
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${formatDate(record.incidentDate)}</td>
            <td>${record.incidentTime || ''}</td>
            <td>${record.contractor?.name || record.contractorName || ''} PATIENT: ${record.injuredPerson || ''}${
          record.inductionNumber ? ` (${record.inductionNumber})` : ''
        }</td>
            <td>${record.injuryDetails || ''}</td>
            <td>${record.treatmentProvided || ''}</td>
            <td>${record.treatmentGivenBy || ''}</td>
            <td>${record.facInvestigation || ''}</td>
            <td>${record.investigatedBy || ''}</td>
          </tr>
        `;
      }
      return `
        <tr>
          <td>${index + 1}</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      `;
    }).join('');

    const html = `
      <html>
        <head>
          <title>First Aid Treatment Register</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 6px; font-size: 12px; vertical-align: top; }
            th { background: #f2f2f2; }
            .header-table td { border: 1px solid #000; padding: 6px; font-size: 12px; }
            .header-table { margin-bottom: 12px; width: 100%; }
            .notes { margin-top: 16px; font-size: 11px; }
            .footer { margin-top: 24px; font-size: 12px; }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td rowspan="2" style="width:20%; text-align:center; font-weight:bold;">SHIVALIK</td>
              <td rowspan="2" style="text-align:center; font-size:18px; font-weight:bold;">First Aid Treatment Register</td>
              <td style="width:20%;">Format No.: <strong>EHS-F-04</strong></td>
            </tr>
            <tr>
              <td>Rev. No.: <strong>00</strong></td>
            </tr>
          </table>
          <table class="header-table">
            <tr>
              <td colspan="6" style="font-size:12px;">
                Important Note: (1) All first aid box responsible person should ensure entry of each first aid case in this register. (2) First aid should be provided by trained first aider. (3) Ensure availability of trained first aider in each shift. (4) All first aid cases occurred during the month should be discussed in the monthly safety committee meeting.
              </td>
            </tr>
            <tr>
              <td style="width:15%;">Site Name:</td>
              <td colspan="2">${record.site?.name || ''}</td>
              <td style="width:15%;">Month/YY:</td>
              <td colspan="2">${record.month || dayjs(record.incidentDate).format('MMMM YYYY')}</td>
            </tr>
          </table>
          <table>
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Date</th>
                <th>Time</th>
                <th>Contractor Name, Name of Injured Person and Induction Number</th>
                <th>Details of Injury and Illness</th>
                <th>Treatment Given</th>
                <th>Treatment Given by</th>
                <th>FAC Investigation</th>
                <th>Investigated by</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <div class="footer">Project In Charge Sign: _______________________________</div>
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
  }, []);

  const handlePrintRegister = useCallback(() => {
    const rows = records
      .map(
        (record, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${formatDate(record.incidentDate)}</td>
            <td>${record.incidentTime || ''}</td>
            <td>
              <div><strong>${record.contractor?.name || ''}</strong></div>
              <div>${record.injuredPerson || ''}${record.inductionNumber ? ` (${record.inductionNumber})` : ''}</div>
            </td>
            <td>${record.injuryDetails || ''}</td>
            <td>${record.treatmentProvided || ''}</td>
            <td>${record.treatmentGivenBy || ''}</td>
            <td>${record.facInvestigation || ''}</td>
            <td>${record.investigatedBy || ''}</td>
          </tr>
        `
      )
      .join('');

    const html = `
      <html>
        <head>
          <title>First Aid Treatment Register</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            .meta { margin-bottom: 16px; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 6px; font-size: 12px; vertical-align: top; }
            th { background: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>First Aid Treatment Register</h1>
          <div class="meta">
            <div><strong>Generated On:</strong> ${dayjs().format('DD.MM.YYYY')}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Date</th>
                <th>Time</th>
                <th>Contractor / Injured Person</th>
                <th>Details of Injury / Illness</th>
                <th>Treatment Given</th>
                <th>Treatment Given By</th>
                <th>FAC Investigation</th>
                <th>Investigated By</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
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
  }, [records]);

  const onSubmit = async (values: FirstAidFormValues) => {
    setSubmitting(true);
    try {
      if (!values.incidentDate) {
        showMessage('Incident date is required', 'error');
        return;
      }

      const payload: FirstAidPayload = {
        siteId: values.siteId,
        month: values.month,
        incidentDate: values.incidentDate.toISOString(),
        incidentTime: values.incidentTime,
        contractorId: values.contractorId,
        injuredPerson: values.injuredPerson,
        inductionNumber: values.inductionNumber,
        injuryDetails: values.injuryDetails,
        treatmentProvided: values.treatmentProvided,
        treatmentGivenBy: values.treatmentGivenBy,
        facInvestigation: values.facInvestigation,
        investigatedBy: values.investigatedBy,
        remarks: values.remarks,
      };

      if (isEditMode && editingRecordId) {
        await updateCase(editingRecordId, payload);
      } else {
        await createCase(payload);
      }

      await fetchCases();
      closeFormModal();
    } catch (error: any) {
      showMessage(error?.message ?? 'Unable to save record', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EhsPageLayout
      title="First Aid Treatment Register"
      description="Document first aid responses, treatments provided, follow-up investigation status, and monthly summaries."
      actions={
        canCreate ? (
          <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
            Add First Aid Case
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
          You do not have permission to view first aid treatment entries. Contact a SuperAdmin to request access.
        </Alert>
      ) : (
        <>
          <Card withBorder radius="md" padding="lg" shadow="sm" mb="lg">
            <Stack gap="sm">
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap={4}>
                  <Text fw={600}>Important Note:</Text>
                  <Text size="sm" c="dimmed">
                    1) Log every first aid case. 2) Treatments must be delivered by trained first aiders. 3) Maintain
                    trained first aiders in each shift. 4) Discuss logged cases in monthly safety meetings.
                  </Text>
                </Stack>
                <Stack gap={2} align="flex-end">
                  <Badge color="gray" variant="light">Format: EHS-F-04</Badge>
                  <Badge color="gray" variant="light">Revision 00</Badge>
                </Stack>
              </Group>
              <Group justify="space-between">
                <Text size="sm" fw={600}>
                  Recorded entries: {records.length}
                </Text>
                <Group gap="sm">
                  <Button
                    variant="light"
                    color="gray"
                    leftSection={<IconPrinter size={16} />}
                    onClick={handlePrintRegister}
                    disabled={!records.length}
                  >
                    Print Register
                  </Button>
                  <Button
                    variant="light"
                    color="gray"
                    leftSection={<IconRefresh size={16} />}
                    onClick={() => fetchCases()}
                    loading={recordsLoading}
                  >
                    Refresh
                  </Button>
                </Group>
              </Group>
            </Stack>
          </Card>

          <Card withBorder radius="md" padding="lg" shadow="sm">
            <ScrollArea>
              <Table striped highlightOnHover withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: 60 }}>Sr. No.</Table.Th>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>Time</Table.Th>
                    <Table.Th>Contractor / Injured Person</Table.Th>
                    <Table.Th>Details of Injury / Illness</Table.Th>
                    <Table.Th>Treatment Given</Table.Th>
                    <Table.Th>Treatment Given By</Table.Th>
                    <Table.Th>FAC Investigation</Table.Th>
                    <Table.Th>Investigated By</Table.Th>
                    <Table.Th align="right">Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {records.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={10}>
                        <Text size="sm" c="dimmed" ta="center">
                          No first aid treatment records captured yet.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    records.map((record, index) => (
                      <Table.Tr key={record._id}>
                        <Table.Td>{records.length - index}</Table.Td>
                        <Table.Td>{formatDate(record.incidentDate)}</Table.Td>
                        <Table.Td>{record.incidentTime || '—'}</Table.Td>
                        <Table.Td>
                          <Stack gap={2}>
                            <Text fw={600}>{record.contractor?.name || '—'}</Text>
                            <Text size="sm" c="dimmed">
                              {record.injuredPerson}
                              {record.inductionNumber ? ` (${record.inductionNumber})` : ''}
                            </Text>
                          </Stack>
                        </Table.Td>
                        <Table.Td>{record.injuryDetails}</Table.Td>
                        <Table.Td>{record.treatmentProvided}</Table.Td>
                        <Table.Td>{record.treatmentGivenBy}</Table.Td>
                        <Table.Td>{record.facInvestigation || '—'}</Table.Td>
                        <Table.Td>{record.investigatedBy || '—'}</Table.Td>
                        <Table.Td align="right">
                          <Group gap="xs" justify="flex-end">
                            <ActionIcon
                              variant="light"
                              color="gray"
                              aria-label="Print record"
                              onClick={() => handlePrintRecord(record)}
                            >
                              <IconPrinter size={16} />
                            </ActionIcon>
                            <ActionIcon
                              variant="light"
                              color="blue"
                              aria-label="View record"
                              onClick={() => handleViewRecord(record)}
                            >
                              <IconEye size={16} />
                            </ActionIcon>
                            {(isSuperAdmin || can('FirstAidTreatmentRegister', 'edit')) && (
                              <ActionIcon
                                variant="light"
                                color="orange"
                                aria-label="Edit record"
                                onClick={() => handleEditRecord(record)}
                              >
                                <IconPencil size={16} />
                              </ActionIcon>
                            )}
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Card>
        </>
      )}

      <Modal
        opened={modalOpened && canCreate}
        onClose={closeFormModal}
        title={isEditMode ? 'Edit First Aid Case' : 'Add First Aid Case'}
        size="80%"
        centered
        overlayProps={{ blur: 3 }}
      >
        <ScrollArea h="70vh">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="xl" p="sm">
              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Stack gap="md">
                  <Text fw={600}>Site & Period</Text>
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
                          nothingFoundMessage={sitesLoading ? 'Loading...' : 'No sites found'}
                          onChange={(value) => field.onChange(value ?? undefined)}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="siteName"
                      rules={{ required: 'Site name is required' }}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          label="Site Name"
                          placeholder="Auto-filled from selected site"
                          readOnly
                          error={errors.siteName?.message}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="month"
                      rules={{ required: 'Month / Year is required' }}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          label="Month / Year"
                          placeholder="e.g. January 2025"
                          error={errors.month?.message}
                        />
                      )}
                    />
                  </SimpleGrid>
                </Stack>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Stack gap="md">
                  <Text fw={600}>Incident Details</Text>
                  <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                    <Controller
                      control={control}
                      name="incidentDate"
                      rules={{ required: 'Date is required' }}
                      render={({ field }) => (
                        <DateInput
                          label="Date"
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.incidentDate ? 'Incident date is required' : undefined}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="incidentTime"
                      render={({ field }) => (
                        <TextInput {...field} label="Time" placeholder="HH:MM" />
                      )}
                    />
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
                          nothingFoundMessage={contractorsLoading ? 'Loading...' : 'No contractors found'}
                          onChange={(value) => field.onChange(value ?? undefined)}
                        />
                      )}
                    />
                  </SimpleGrid>
                  <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                    <Controller
                      control={control}
                      name="contractorName"
                      rules={{ required: 'Contractor name is required' }}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          label="Contractor Name"
                          placeholder="Auto-filled from selection"
                          readOnly
                          error={errors.contractorName?.message}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="injuredPerson"
                      rules={{ required: 'Injured person is required' }}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          label="Name of Injured Person"
                          placeholder="Enter injured person"
                          error={errors.injuredPerson?.message}
                        />
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
                  <Textarea
                    label="Details of Injury / Illness"
                    minRows={3}
                    {...register('injuryDetails', { required: 'Details are required' })}
                    error={errors.injuryDetails?.message}
                  />
                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    <Controller
                      control={control}
                      name="treatmentProvided"
                      rules={{ required: 'Treatment given is required' }}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          label="Treatment Given"
                          placeholder="Describe the treatment provided"
                          minRows={2}
                          error={errors.treatmentProvided?.message}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="treatmentGivenBy"
                      rules={{ required: 'Treatment given by is required' }}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          label="Treatment Given By"
                          placeholder="First aider name"
                          error={errors.treatmentGivenBy?.message}
                        />
                      )}
                    />
                  </SimpleGrid>
                </Stack>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Stack gap="md">
                  <Text fw={600}>Investigation & Remarks</Text>
                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    <Controller
                      control={control}
                      name="facInvestigation"
                      render={({ field }) => (
                        <Textarea {...field} label="FAC Investigation" placeholder="Notes from the first aid committee" minRows={2} />
                      )}
                    />
                    <Controller
                      control={control}
                      name="investigatedBy"
                      render={({ field }) => (
                        <TextInput {...field} label="Investigated By" placeholder="Investigator name" />
                      )}
                    />
                  </SimpleGrid>
                  <Controller
                    control={control}
                    name="remarks"
                    render={({ field }) => (
                      <Textarea {...field} label="Additional Remarks" placeholder="Optional comments" minRows={2} />
                    )}
                  />
                </Stack>
              </Card>

              <Group justify="space-between">
                <Button variant="default" onClick={closeFormModal}>
                  Cancel
                </Button>
                <Button type="submit" loading={submitting}>
                  {isEditMode ? 'Update Record' : 'Save Record'}
                </Button>
              </Group>
            </Stack>
          </form>
        </ScrollArea>
      </Modal>

      <Modal
        opened={viewModalOpen && !!selectedRecord}
        onClose={closeViewModal}
        title="First Aid Record"
        size="lg"
        centered
        keepMounted
      >
        {selectedRecord ? (
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Site
                </Text>
                <Text fw={600}>{selectedRecord.site?.name || selectedRecord.siteName || '—'}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Month / Year
                </Text>
                <Text fw={600}>{selectedRecord.month}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Date
                </Text>
                <Text fw={600}>{formatDate(selectedRecord.incidentDate)}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Time
                </Text>
                <Text fw={600}>{selectedRecord.incidentTime || '—'}</Text>
              </Card>
            </SimpleGrid>

            <Card withBorder radius="md" padding="md" shadow="xs">
              <Stack gap={6}>
                <Text size="sm" c="dimmed">
                  Contractor / Injured Person
                </Text>
                <Text fw={600}>{selectedRecord.contractor?.name || selectedRecord.contractorName || '—'}</Text>
                <Text size="sm" c="dimmed">
                  {selectedRecord.injuredPerson}
                  {selectedRecord.inductionNumber ? ` (${selectedRecord.inductionNumber})` : ''}
                </Text>
              </Stack>
            </Card>

            <Card withBorder radius="md" padding="md" shadow="xs">
              <Stack gap={6}>
                <Text size="sm" c="dimmed">
                  Details of Injury / Illness
                </Text>
                <Text size="sm">{selectedRecord.injuryDetails}</Text>
              </Stack>
            </Card>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Stack gap={6}>
                  <Text size="sm" c="dimmed">
                    Treatment Given
                  </Text>
                  <Text size="sm">{selectedRecord.treatmentProvided}</Text>
                </Stack>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Stack gap={6}>
                  <Text size="sm" c="dimmed">
                    Treatment Given By
                  </Text>
                  <Text size="sm">{selectedRecord.treatmentGivenBy}</Text>
                </Stack>
              </Card>
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Stack gap={6}>
                  <Text size="sm" c="dimmed">
                    FAC Investigation
                  </Text>
                  <Text size="sm">{selectedRecord.facInvestigation || '—'}</Text>
                </Stack>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Stack gap={6}>
                  <Text size="sm" c="dimmed">
                    Investigated By
                  </Text>
                  <Text size="sm">{selectedRecord.investigatedBy || '—'}</Text>
                </Stack>
              </Card>
            </SimpleGrid>

            {selectedRecord.remarks ? (
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Stack gap={6}>
                  <Text size="sm" c="dimmed">
                    Remarks
                  </Text>
                  <Text size="sm">{selectedRecord.remarks}</Text>
                </Stack>
              </Card>
            ) : null}
          </Stack>
        ) : null}
      </Modal>
    </EhsPageLayout>
  );
};

export default FirstAidTreatmentRegisterPage;
