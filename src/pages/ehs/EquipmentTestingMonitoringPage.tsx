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
import { IconAlertCircle, IconBuildingFactory, IconClipboardList, IconEye, IconPencil, IconPlus, IconPrinter, IconRefresh } from '@tabler/icons-react';
import dayjs from 'dayjs';
import EhsPageLayout from '@/components/ehs/EhsPageLayout';
import { useSites } from '@/hooks/useSites';
import { usePermissions } from '@/hooks/usePermissions';
import { useEquipments } from '@/hooks/useEquipments';
import { EquipmentPayload, updateEquipment } from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

type EquipmentFormValues = {
  name: string;
  equipmentId: string;
  category?: string;
  siteId?: string;
  siteName?: string;
  location?: string;
  make?: string;
  capacity?: string;
  lastTestDate: Date | null;
  testDueDate: Date | null;
  testedByAgency?: string;
  reportCheckedBy?: string;
  remarks?: string;
  isActive?: boolean;
};

const defaultValues: EquipmentFormValues = {
  name: '',
  equipmentId: '',
  category: '',
  siteId: undefined,
  siteName: '',
  location: '',
  make: '',
  capacity: '',
  lastTestDate: null,
  testDueDate: null,
  testedByAgency: '',
  reportCheckedBy: '',
  remarks: '',
  isActive: true,
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString();
};

const EquipmentTestingMonitoringPage = () => {
  const { sites, loading: sitesLoading } = useSites();
  const { equipments, loading: equipmentsLoading, fetchEquipments, createNewEquipment } = useEquipments({ limit: 50 });
  const { can, loading: permissionsLoading, roles } = usePermissions();

  const isSuperAdmin = roles.includes('SuperAdmin');
  const canView = isSuperAdmin || can('EquipmentMonitoring', 'view') || roles.length === 0;
  const canCreate = isSuperAdmin || can('EquipmentMonitoring', 'add') || roles.length === 0;
  const canEdit = isSuperAdmin || can('EquipmentMonitoring', 'edit');

  const [modalOpened, setModalOpened] = useState(false);
  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    register,
    formState: { errors },
  } = useForm<EquipmentFormValues>({
    defaultValues,
  });

  const watchedSiteId = watch('siteId');
  const watchedLocation = watch('location');

  useEffect(() => {
    if (!watchedSiteId) {
      setValue('siteName', '');
      return;
    }
    const selectedSite = sites.find((site) => site._id === watchedSiteId);
    if (selectedSite) {
      setValue('siteName', selectedSite.name ?? '');
      if (!watchedLocation) {
        setValue('location', selectedSite.location ?? '');
      }
    }
  }, [watchedSiteId, sites, setValue, watchedLocation]);

  const siteOptions = useMemo(
    () =>
      sites.map((site) => ({
        value: site._id,
        label: site.name,
        description: site.location ?? '',
      })),
    [sites]
  );

  const metrics = useMemo(() => {
    const total = equipments.length;
    const dueSoon = equipments.filter((item) => {
      if (!item.testDueDate) return false;
      const date = new Date(item.testDueDate);
      if (Number.isNaN(date.getTime())) return false;
      return dayjs(date).diff(dayjs(), 'day') <= 30 && dayjs(date).isAfter(dayjs());
    }).length;
    const overdue = equipments.filter((item) => {
      if (!item.testDueDate) return false;
      const date = new Date(item.testDueDate);
      if (Number.isNaN(date.getTime())) return false;
      return dayjs(date).isBefore(dayjs(), 'day');
    }).length;
    return {
      total,
      dueSoon,
      overdue,
    };
  }, [equipments]);

  const handlePrintSheet = useCallback(() => {
    const MAX_ROWS = Math.max(equipments.length, 15);
    const rows = Array.from({ length: MAX_ROWS }, (_, index) => {
      const record = equipments[index];
      if (!record) {
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
            <td></td>
          </tr>
        `;
      }
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${record.equipmentId || ''}</td>
          <td>${record.location || record.site?.location || ''}</td>
          <td>${record.make || ''}</td>
          <td>${record.capacity || ''}</td>
          <td>${formatDate(record.lastTestDate)}</td>
          <td>${formatDate(record.testDueDate)}</td>
          <td>${record.testedByAgency || ''}</td>
          <td>${record.reportCheckedBy || ''}</td>
          <td>${record.remarks || ''}</td>
        </tr>
      `;
    }).join('');

    const html = `
      <html>
        <head>
          <title>Equipments Testing Monitoring Sheet</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 6px; font-size: 12px; }
            th { background: #f2f2f2; }
            .header-table td { border: 1px solid #000; padding: 6px; font-size: 12px; }
            .header-table { margin-bottom: 12px; width: 100%; }
            .notes { margin-bottom: 8px; font-size: 12px; }
            .footer { margin-top: 16px; font-size: 12px; }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td rowspan="2" style="width:20%; text-align:center; font-weight:bold;">SHIVALIK</td>
              <td rowspan="2" style="text-align:center; font-size:18px; font-weight:bold;">Equipments Testing Monitoring Sheet</td>
              <td style="width:20%;">Format No.: <strong>EHS-F-05</strong></td>
            </tr>
            <tr>
              <td>Rev. No.: <strong>00</strong></td>
            </tr>
          </table>
          <div class="notes">To be maintained for hoists, lifts, lifting tools and tackles, pressure vessels and instruments used for EHS monitoring</div>
          <div class="notes"><strong>Last Updated On:</strong> ${dayjs().format('DD.MM.YYYY')}</div>
          <div class="notes"><strong>Site:</strong> ________________________</div>
          <table>
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Equipment ID</th>
                <th>Location</th>
                <th>Make</th>
                <th>Capacity</th>
                <th>Last Test Date</th>
                <th>Test Due Date</th>
                <th>Tested by (Agency)</th>
                <th>Report checked by</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <div class="footer">Project In Charge: ________________________________</div>
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
  }, [equipments]);

  const openCreateModal = () => {
    if (!canCreate) {
      showMessage('You do not have permission to log equipment records', 'error');
      return;
    }
    reset({ ...defaultValues });
    setIsEditMode(false);
    setEditingId(null);
    setModalOpened(true);
  };

  const handleEdit = useCallback(
    (record: any) => {
      if (!canEdit) {
        showMessage('You do not have permission to edit equipment records', 'error');
        return;
      }
      setIsEditMode(true);
      setEditingId(record._id);
      reset({
        name: record.name ?? '',
        equipmentId: record.equipmentId ?? '',
        category: record.category ?? '',
        siteId: record.site?.id ?? undefined,
        siteName: record.site?.name ?? '',
        location: record.location ?? record.site?.location ?? '',
        make: record.make ?? '',
        capacity: record.capacity ?? '',
        lastTestDate: record.lastTestDate ? new Date(record.lastTestDate) : null,
        testDueDate: record.testDueDate ? new Date(record.testDueDate) : null,
        testedByAgency: record.testedByAgency ?? '',
        reportCheckedBy: record.reportCheckedBy ?? '',
        remarks: record.remarks ?? '',
        isActive: record.isActive ?? true,
      });
      setModalOpened(true);
    },
    [canEdit, reset]
  );

  const handleView = useCallback((record: any) => {
    setSelectedRecord(record);
    setViewModalOpened(true);
  }, []);

  const closeModal = () => {
    setModalOpened(false);
    setIsEditMode(false);
    setEditingId(null);
  };

  const closeViewModal = () => {
    setSelectedRecord(null);
    setViewModalOpened(false);
  };

  const onSubmit = async (values: EquipmentFormValues) => {
    setSubmitting(true);
    try {
      const payload: EquipmentPayload = {
        name: values.name,
        equipmentId: values.equipmentId,
        category: values.category,
        siteId: values.siteId,
        location: values.location,
        make: values.make,
        capacity: values.capacity,
        lastTestDate: values.lastTestDate ? new Date(values.lastTestDate).toISOString() : null,
        testDueDate: values.testDueDate ? new Date(values.testDueDate).toISOString() : null,
        testedByAgency: values.testedByAgency,
        reportCheckedBy: values.reportCheckedBy,
        remarks: values.remarks,
        isActive: values.isActive,
      };

      if (isEditMode && editingId) {
        await updateEquipment(editingId, payload);
        showMessage('Equipment record updated');
      } else {
        await createNewEquipment(payload);
      }

      await fetchEquipments();
      closeModal();
    } catch (error: any) {
      showMessage(error?.message ?? 'Unable to save equipment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EhsPageLayout
      title="Equipments Testing Monitoring Sheet"
      description="Maintain statutory testing and certification details for hoists, lifts, tackles, and other EHS critical equipment."
      actions={
        canCreate ? (
          <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
            Log Testing Record
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
          You do not have permission to view equipment monitoring records.
        </Alert>
      ) : (
        <Stack gap="lg">
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            <Card withBorder radius="md" padding="lg" shadow="sm">
              <Group gap="sm">
                <IconClipboardList size={20} />
                <Stack gap={2}>
                  <Text size="sm" c="dimmed">
                    Equipments Logged
                  </Text>
                  <Text size="xl" fw={700}>
                    {metrics.total}
                  </Text>
                </Stack>
              </Group>
            </Card>
            <Card withBorder radius="md" padding="lg" shadow="sm">
              <Group gap="sm">
                <IconBuildingFactory size={20} />
                <Stack gap={2}>
                  <Text size="sm" c="dimmed">
                    Tests Due ≤ 30 Days
                  </Text>
                  <Text size="xl" fw={700}>
                    {metrics.dueSoon}
                  </Text>
                </Stack>
              </Group>
            </Card>
            <Card withBorder radius="md" padding="lg" shadow="sm">
              <Group gap="sm">
                <IconAlertCircle size={20} />
                <Stack gap={2}>
                  <Text size="sm" c="dimmed">
                    Overdue Tests
                  </Text>
                  <Text size="xl" fw={700}>
                    {metrics.overdue}
                  </Text>
                </Stack>
              </Group>
            </Card>
          </SimpleGrid>

          <Card withBorder radius="md" padding="lg" shadow="sm">
            <Stack gap="sm">
              <Group justify="space-between" align="flex-start">
                <Stack gap={4}>
                  <Text fw={600}>Important Note</Text>
                  <Text size="sm" c="dimmed">
                    Maintain certified records for hoists, lifts, tackles, pressure vessels, and measuring instruments used for EHS monitoring.
                    Keep inspection reports accessible and ensure renewals before due dates.
                  </Text>
                </Stack>
                <Stack gap={2} align="flex-end">
                  <Badge color="gray" variant="light">Format: EHS-F-05</Badge>
                  <Badge color="gray" variant="light">Revision: 00</Badge>
                </Stack>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Last Updated: {dayjs().format('DD.MM.YYYY')}
                </Text>
                <Group gap="sm">
                  <Button
                    variant="light"
                    color="gray"
                    leftSection={<IconPrinter size={16} />}
                    onClick={handlePrintSheet}
                    disabled={!equipments.length}
                  >
                    Print Sheet
                  </Button>
                  <Button
                    variant="light"
                    color="gray"
                    leftSection={<IconRefresh size={16} />}
                    onClick={() => fetchEquipments()}
                    loading={equipmentsLoading}
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
                    <Table.Th>Equipment ID</Table.Th>
                    <Table.Th>Location</Table.Th>
                    <Table.Th>Make</Table.Th>
                    <Table.Th>Capacity</Table.Th>
                    <Table.Th>Last Test Date</Table.Th>
                    <Table.Th>Test Due Date</Table.Th>
                    <Table.Th>Tested By (Agency)</Table.Th>
                    <Table.Th>Report Checked By</Table.Th>
                    <Table.Th>Remarks</Table.Th>
                    <Table.Th align="right">Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {equipments.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={11}>
                        <Text size="sm" c="dimmed" ta="center">
                          No equipment monitoring records available.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    equipments.map((record, index) => (
                      <Table.Tr key={record._id ?? record.equipmentId}>
                        <Table.Td>{index + 1}</Table.Td>
                        <Table.Td>
                          <Stack gap={2}>
                            <Text fw={600}>{record.equipmentId}</Text>
                            <Text size="sm" c="dimmed">
                              {record.name}
                            </Text>
                          </Stack>
                        </Table.Td>
                        <Table.Td>{record.location || record.site?.location || '—'}</Table.Td>
                        <Table.Td>{record.make || '—'}</Table.Td>
                        <Table.Td>{record.capacity || '—'}</Table.Td>
                        <Table.Td>{formatDate(record.lastTestDate)}</Table.Td>
                        <Table.Td>
                          <Badge color={dayjs(record.testDueDate).isBefore(dayjs(), 'day') ? 'red' : 'blue'} variant="light">
                            {formatDate(record.testDueDate)}
                          </Badge>
                        </Table.Td>
                        <Table.Td>{record.testedByAgency || '—'}</Table.Td>
                        <Table.Td>{record.reportCheckedBy || '—'}</Table.Td>
                        <Table.Td>{record.remarks || '—'}</Table.Td>
                        <Table.Td align="right">
                           <Group gap="xs" justify="flex-end">
                             <ActionIcon
                               variant="light"
                               color="blue"
                               aria-label="View equipment record"
                               onClick={() => handleView(record)}
                             >
                               <IconEye size={16} />
                             </ActionIcon>
                             {canEdit ? (
                               <ActionIcon
                                 variant="light"
                                 color="orange"
                                 aria-label="Edit equipment record"
                                 onClick={() => handleEdit(record)}
                               >
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
        opened={modalOpened && canCreate}
        onClose={closeModal}
        title={isEditMode ? 'Edit Equipment Record' : 'Log Equipment Test'}
        size="80%"
        centered
        overlayProps={{ blur: 3 }}
      >
        <ScrollArea h="70vh">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="xl" p="sm">
              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Stack gap="md">
                  <Text fw={600}>Equipment Details</Text>
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
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          label="Site Name"
                          placeholder="Auto-filled from site selection"
                          readOnly
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="name"
                      rules={{ required: 'Equipment name is required' }}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          label="Equipment Name"
                          placeholder="Tower Crane 01"
                          error={errors.name?.message}
                        />
                      )}
                    />
                  </SimpleGrid>
                  <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                    <Controller
                      control={control}
                      name="equipmentId"
                      rules={{ required: 'Equipment ID is required' }}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          label="Equipment ID"
                          placeholder="TC-01"
                          error={errors.equipmentId?.message}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="category"
                      render={({ field }) => (
                        <TextInput {...field} label="Category" placeholder="Hoist / Lift / Crane" />
                      )}
                    />
                    <Controller
                      control={control}
                      name="location"
                      render={({ field }) => (
                        <TextInput {...field} label="Location" placeholder="E.g. Block A" />
                      )}
                    />
                  </SimpleGrid>
                  <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                    <Controller
                      control={control}
                      name="make"
                      render={({ field }) => (
                        <TextInput {...field} label="Make" placeholder="Manufacturer" />
                      )}
                    />
                    <Controller
                      control={control}
                      name="capacity"
                      render={({ field }) => (
                        <TextInput {...field} label="Capacity" placeholder="5 TON" />
                      )}
                    />
                    <Controller
                      control={control}
                      name="testedByAgency"
                      render={({ field }) => (
                        <TextInput {...field} label="Tested By (Agency)" placeholder="Testing agency" />
                      )}
                    />
                  </SimpleGrid>
                </Stack>
              </Card>

              <Card withBorder radius="md" padding="lg" shadow="xs">
                <Stack gap="md">
                  <Text fw={600}>Testing Schedule</Text>
                  <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                    <Controller
                      control={control}
                      name="lastTestDate"
                      render={({ field }) => (
                        <DateInput label="Last Test Date" value={field.value} onChange={field.onChange} clearable />
                      )}
                    />
                    <Controller
                      control={control}
                      name="testDueDate"
                      render={({ field }) => (
                        <DateInput
                          label="Test Due Date"
                          value={field.value}
                          onChange={field.onChange}
                          clearable
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="reportCheckedBy"
                      render={({ field }) => (
                        <TextInput {...field} label="Report Checked By" placeholder="Reviewer name" />
                      )}
                    />
                  </SimpleGrid>
                  <Textarea
                    label="Remarks"
                    minRows={2}
                    {...register('remarks')}
                    placeholder="Any additional notes"
                  />
                </Stack>
              </Card>

              <Group justify="space-between">
                <Button variant="default" onClick={closeModal}>
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

      <Modal opened={viewModalOpened && !!selectedRecord} onClose={closeViewModal} title="Equipment Record" size="lg" centered>
        {selectedRecord ? (
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Equipment ID
                </Text>
                <Text fw={600}>{selectedRecord.equipmentId}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Equipment Name
                </Text>
                <Text fw={600}>{selectedRecord.name}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Site
                </Text>
                <Text fw={600}>{selectedRecord.site?.name || '—'}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Location
                </Text>
                <Text fw={600}>{selectedRecord.location || selectedRecord.site?.location || '—'}</Text>
              </Card>
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Make
                </Text>
                <Text size="sm">{selectedRecord.make || '—'}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Capacity
                </Text>
                <Text size="sm">{selectedRecord.capacity || '—'}</Text>
              </Card>
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Last Test Date
                </Text>
                <Text size="sm">{formatDate(selectedRecord.lastTestDate)}</Text>
              </Card>
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Test Due Date
                </Text>
                <Text size="sm">{formatDate(selectedRecord.testDueDate)}</Text>
              </Card>
            </SimpleGrid>

            <Card withBorder radius="md" padding="md" shadow="xs">
              <Text size="sm" c="dimmed">
                Tested By (Agency)
              </Text>
              <Text size="sm">{selectedRecord.testedByAgency || '—'}</Text>
            </Card>

            <Card withBorder radius="md" padding="md" shadow="xs">
              <Text size="sm" c="dimmed">
                Report Checked By
              </Text>
              <Text size="sm">{selectedRecord.reportCheckedBy || '—'}</Text>
            </Card>

            {selectedRecord.remarks ? (
              <Card withBorder radius="md" padding="md" shadow="xs">
                <Text size="sm" c="dimmed">
                  Remarks
                </Text>
                <Text size="sm">{selectedRecord.remarks}</Text>
              </Card>
            ) : null}
          </Stack>
        ) : null}
      </Modal>
    </EhsPageLayout>
  );
};

export default EquipmentTestingMonitoringPage;
