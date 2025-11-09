import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  HoverCard,
  Image,
  Loader,
  Modal,
  ScrollArea,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { Control, Controller, useForm } from 'react-hook-form';
import { IconEye, IconInfoCircle, IconPlus, IconRefresh } from '@tabler/icons-react';
import EhsPageLayout from '@/components/ehs/EhsPageLayout';
import SignaturePadField from '@/components/ehs/SignaturePadField';
import { useSites } from '@/hooks/useSites';
import { usePermissions } from '@/hooks/usePermissions';
import { useJcbChecklists, JcbChecklistRecord } from '@/hooks/useJcbChecklists';
import type { ChecklistSignaturePayload, JcbChecklistPayload } from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';
import jcbReferenceImg from '@/assets/ehs/JCB_CHECK.jpeg';

type ChecklistStatus = 'YES' | 'NO' | 'NA';

type SignatureField = {
  name?: string;
  designation?: string;
  signedAt?: Date | null;
  signature?: string;
};

type ChecklistItemField = {
  description: string;
  status: ChecklistStatus;
  remark?: string;
};

type JcbChecklistFormValues = {
  siteId?: string;
  siteName?: string;
  siteLocation?: string;
  equipmentSerialNumber: string;
  makeModel: string;
  vehicleNumber?: string;
  inspectionDate: Date | null;
  items: ChecklistItemField[];
  equipmentFitForUse: ChecklistStatus;
  generalRemarks?: string;
  inspectedBy: SignatureField;
  reviewedBy: SignatureField;
  projectInCharge: SignatureField;
};

const STATUS_OPTIONS = [
  { label: 'Yes', value: 'YES' as const },
  { label: 'No', value: 'NO' as const },
  { label: 'N/A', value: 'NA' as const },
];

const CHECKLIST_ITEMS: string[] = [
  'Machine should be physically good & certified by competent authority.',
  'No damage in tire (Bolts, crack, cuts & air pressure, etc.).',
  'Head & tail light and indicators are in working condition.',
  'Side mirror should be in good condition.',
  'Wind shield/glass should be in proper condition.',
  'Wiper should be in running condition.',
  'Operator cabin and driver seat should be in good condition.',
  'Hydraulic cylinders and hoses are in good condition and free from leakage.',
  'Outrigger should be free from damages.',
  'Red triangle/reflective tape should be fixed in front of vehicle.',
  'Front & reverse horn.',
  'Fire extinguisher in operator cabin.',
  'Operator has valid and suitable license.',
  'PUC, RC, Insurance.',
];

const statusColors: Record<ChecklistStatus, string> = {
  YES: 'green',
  NO: 'red',
  NA: 'gray',
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString();
};

const createDefaultSignature = (): SignatureField => ({
  name: '',
  designation: '',
  signedAt: null,
  signature: undefined,
});

const createDefaultValues = (): JcbChecklistFormValues => ({
  siteId: undefined,
  siteName: '',
  siteLocation: '',
  equipmentSerialNumber: '',
  makeModel: '',
  vehicleNumber: '',
  inspectionDate: new Date(),
  items: CHECKLIST_ITEMS.map((description) => ({
    description,
    status: 'YES',
    remark: '',
  })),
  equipmentFitForUse: 'YES',
  generalRemarks: '',
  inspectedBy: createDefaultSignature(),
  reviewedBy: createDefaultSignature(),
  projectInCharge: createDefaultSignature(),
});

const mapSignatureToPayload = (signature?: SignatureField): ChecklistSignaturePayload | undefined => {
  if (!signature) {
    return undefined;
  }
  const hasValue =
    (signature.name && signature.name.trim().length > 0) ||
    (signature.designation && signature.designation.trim().length > 0) ||
    (signature.signature && signature.signature.length > 0) ||
    signature.signedAt;

  if (!hasValue) {
    return undefined;
  }

  return {
    name: signature.name?.trim() || undefined,
    designation: signature.designation?.trim() || undefined,
    signature: signature.signature || undefined,
    signedAt: signature.signedAt ? new Date(signature.signedAt).toISOString() : undefined,
  };
};

type SignatureSectionProps = {
  control: Control<JcbChecklistFormValues>;
  title: string;
  fieldName: 'inspectedBy' | 'reviewedBy' | 'projectInCharge';
};

const SignatureSection = ({ control, title, fieldName }: SignatureSectionProps) => {
  return (
    <Card withBorder shadow="sm" radius="md" padding="lg">
      <Stack gap="sm">
        <Text fw={600}>{title}</Text>
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <Controller
            control={control}
            name={`${fieldName}.name`}
            render={({ field }) => (
              <TextInput
                label="Name"
                placeholder="Enter name"
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
              />
            )}
          />
          <Controller
            control={control}
            name={`${fieldName}.designation`}
            render={({ field }) => (
              <TextInput
                label="Designation"
                placeholder="Enter designation"
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
              />
            )}
          />
          <Controller
            control={control}
            name={`${fieldName}.signedAt`}
            render={({ field }) => (
              <DateInput
                label="Signed on"
                placeholder="Select date"
                value={field.value ?? null}
                onChange={field.onChange}
                clearable
                maxDate={new Date()}
              />
            )}
          />
        </SimpleGrid>
        <Controller
          control={control}
          name={`${fieldName}.signature`}
          render={({ field }) => (
            <SignaturePadField label="Signature" value={field.value} onChange={field.onChange} />
          )}
        />
      </Stack>
    </Card>
  );
};

const renderSignatureCard = (title: string, signature?: ChecklistSignaturePayload) => {
  return (
    <Card withBorder shadow="xs" radius="md" padding="md">
      <Stack gap={6}>
        <Text fw={600}>{title}</Text>
        <Text size="sm">Name: {signature?.name ?? '—'}</Text>
        <Text size="sm">Designation: {signature?.designation ?? '—'}</Text>
        <Text size="sm">Signed on: {formatDate(signature?.signedAt ?? null)}</Text>
        {signature?.signature ? (
          <img
            src={signature.signature}
            alt={`${title} signature`}
            style={{ maxWidth: '100%', height: 'auto', border: '1px solid #e5e7eb', borderRadius: 6 }}
          />
        ) : (
          <Text size="xs" c="dimmed">
            Signature not captured
          </Text>
        )}
      </Stack>
    </Card>
  );
};

const JcbChecklistPage = () => {
  const { sites, loading: sitesLoading } = useSites();
  const { can } = usePermissions();
  const { records, loading, fetchChecklists, createChecklist, statusSummary } = useJcbChecklists({
    limit: 50,
  });
  const [selectedRecord, setSelectedRecord] = useState<JcbChecklistRecord | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formModalOpened, setFormModalOpened] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<JcbChecklistFormValues>({
    defaultValues: createDefaultValues(),
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

  const selectedSiteId = watch('siteId');

  useEffect(() => {
    if (!selectedSiteId) {
      return;
    }
    const selectedSite = sites.find((site) => site._id === selectedSiteId);
    if (selectedSite) {
      setValue('siteName', selectedSite.name ?? '', { shouldValidate: false, shouldDirty: false });
      setValue('siteLocation', selectedSite.location ?? '', { shouldValidate: false, shouldDirty: false });
    }
  }, [selectedSiteId, sites, setValue]);

  const handleRefresh = useCallback(() => {
    fetchChecklists().catch(() => undefined);
  }, [fetchChecklists]);

  const handleOpenForm = useCallback(() => {
    reset(createDefaultValues());
    setEditingId(null);
    setFormModalOpened(true);
  }, [reset]);

  const onSubmit = useCallback(
    async (values: JcbChecklistFormValues) => {
      try {
        const payload: JcbChecklistPayload = {
          equipmentSerialNumber: values.equipmentSerialNumber.trim(),
          makeModel: values.makeModel.trim(),
          inspectionDate: (values.inspectionDate ?? new Date()).toISOString(),
          items: values.items.map((item, index) => ({
            description: item.description || CHECKLIST_ITEMS[index],
            status: item.status || 'YES',
            remark: item.remark?.trim() || '',
          })),
          equipmentFitForUse: values.equipmentFitForUse,
        };

        if (values.vehicleNumber?.trim()) {
          payload.vehicleNumber = values.vehicleNumber.trim();
        }

        if (values.siteId) {
          payload.siteId = values.siteId;
        }

        if ((values.siteName && values.siteName.trim()) || (values.siteLocation && values.siteLocation.trim())) {
          payload.site = {
            name: values.siteName?.trim() || undefined,
            location: values.siteLocation?.trim() || undefined,
          };
        }

        if (values.generalRemarks?.trim()) {
          payload.generalRemarks = values.generalRemarks.trim();
        }

        const inspectedBy = mapSignatureToPayload(values.inspectedBy);
        if (inspectedBy) {
          payload.inspectedBy = inspectedBy;
        }

        const reviewedBy = mapSignatureToPayload(values.reviewedBy);
        if (reviewedBy) {
          payload.reviewedBy = reviewedBy;
        }

        const projectInCharge = mapSignatureToPayload(values.projectInCharge);
        if (projectInCharge) {
          payload.projectInCharge = projectInCharge;
        }

        await createChecklist(payload);

        reset({
          ...createDefaultValues(),
          siteId: values.siteId,
          siteName: values.siteName,
          siteLocation: values.siteLocation,
        });
        setFormModalOpened(false);
      } catch (error: any) {
        if (error?.message) {
          showMessage(error.message, 'error');
        }
      }
    },
    [createChecklist, reset]
  );

  const canCreate = can('JcbChecklist', 'add');

  const renderChecklistDescription = useCallback(
    (description: string, index: number) => (
      <Group gap="xs" align="flex-start">
        <Text size="sm" style={{ flex: 1 }}>
          {description}
        </Text>
        {index < 9 ? (
          <HoverCard width={280} shadow="md" withArrow withinPortal>
            <HoverCard.Target>
              <ActionIcon variant="subtle" color="gray" aria-label={`Show visual reference for checkpoint ${index + 1}`}>
                <IconInfoCircle size={16} />
              </ActionIcon>
            </HoverCard.Target>
            <HoverCard.Dropdown>
              <Stack gap="xs" align="center">
                <Text size="sm" fw={600}>
                  Visual reference (points 1–9)
                </Text>
                <Image src={jcbReferenceImg} alt="JCB visual reference checkpoints 1 to 9" width={240} fit="contain" />
                <Text size="xs" c="dimmed" ta="center">
                  Use this map to locate inspection checkpoints for the first nine questions.
                </Text>
              </Stack>
            </HoverCard.Dropdown>
          </HoverCard>
        ) : null}
      </Group>
    ),
    []
  );

  return (
    <EhsPageLayout
      title="JCB Checklist"
      description="Daily pre-use inspection checklist for JCB/backhoe loaders capturing statutory compliance and safe operating condition."
      actions={
        <Group gap="xs">
          <Button
            variant="light"
            color="gray"
            leftSection={<IconRefresh size={16} />}
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
          {canCreate ? (
            <Button leftSection={<IconPlus size={16} />} onClick={handleOpenForm}>
              New Checklist
            </Button>
          ) : null}
        </Group>
      }
    >
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        <Card withBorder shadow="sm" radius="md" padding="lg">
          <Stack gap={4}>
            <Text size="sm" c="dimmed">
              Total inspections
            </Text>
            <Text size="xl" fw={700}>
              {records.length}
            </Text>
          </Stack>
        </Card>
        <Card withBorder shadow="sm" radius="md" padding="lg">
          <Stack gap={4}>
            <Group gap="xs">
              <Badge color={statusColors.YES}>Fit for use</Badge>
            </Group>
            <Text size="xl" fw={700}>
              {statusSummary.YES}
            </Text>
          </Stack>
        </Card>
        <Card withBorder shadow="sm" radius="md" padding="lg">
          <Stack gap={4}>
            <Group gap="xs">
              <Badge color={statusColors.NO}>Needs attention</Badge>
            </Group>
            <Text size="xl" fw={700}>
              {statusSummary.NO}
            </Text>
          </Stack>
        </Card>
      </SimpleGrid>

      <Card withBorder shadow="sm" radius="md" padding="xl">
        <Stack gap="md">
          <Group justify="space-between">
            <Stack gap={2}>
              <Text fw={600}>Recent submissions</Text>
              <Text size="sm" c="dimmed">
                Track JCB inspection history and view individual inspection sheets.
              </Text>
            </Stack>
            {loading ? <Loader size="sm" /> : null}
          </Group>
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Inspection date</Table.Th>
                <Table.Th>Site</Table.Th>
                <Table.Th>Serial no.</Table.Th>
                <Table.Th>Make / model</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th style={{ width: 80 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {!records.length ? (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Text size="sm" c="dimmed" ta="center">
                      No JCB checklist submitted yet.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                records.map((record) => (
                  <Table.Tr key={record._id}>
                    <Table.Td>{formatDate(record.inspectionDate)}</Table.Td>
                    <Table.Td>{record.site?.name ?? record.site?.location ?? '—'}</Table.Td>
                    <Table.Td>{record.equipmentSerialNumber}</Table.Td>
                    <Table.Td>{record.makeModel}</Table.Td>
                    <Table.Td>
                      <Badge color={statusColors[(record.equipmentFitForUse as ChecklistStatus) || 'YES']}>
                        {record.equipmentFitForUse ?? 'YES'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon variant="light" color="blue" onClick={() => setSelectedRecord(record)}>
                        <IconEye size={16} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Stack>
      </Card>

      <Modal
        opened={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        size="xl"
        title="JCB checklist details"
        centered
        scrollAreaComponent={ScrollArea.Autosize}
      >
        {selectedRecord ? (
          <Stack gap="lg">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Card withBorder shadow="xs" radius="md" padding="md">
                <Stack gap={4}>
                  <Text fw={600}>Inspection info</Text>
                  <Text size="sm">Date: {formatDate(selectedRecord.inspectionDate)}</Text>
                  <Text size="sm">Site: {selectedRecord.site?.name ?? '—'}</Text>
                  <Text size="sm">Location: {selectedRecord.site?.location ?? '—'}</Text>
                </Stack>
              </Card>
              <Card withBorder shadow="xs" radius="md" padding="md">
                <Stack gap={4}>
                  <Text fw={600}>Equipment details</Text>
                  <Text size="sm">Serial no.: {selectedRecord.equipmentSerialNumber || '—'}</Text>
                  <Text size="sm">Make / model: {selectedRecord.makeModel || '—'}</Text>
                  <Text size="sm">Identifier: {selectedRecord.vehicleNumber || '—'}</Text>
                  <Text size="sm">
                    Fit for use:{' '}
                    <Badge color={statusColors[(selectedRecord.equipmentFitForUse as ChecklistStatus) || 'YES']}>
                      {selectedRecord.equipmentFitForUse ?? 'YES'}
                    </Badge>
                  </Text>
                </Stack>
              </Card>
            </SimpleGrid>

            <Card withBorder shadow="xs" radius="md" padding="md">
              <Stack gap="sm">
                <Text fw={600}>Checklist items</Text>
                <Table striped withTableBorder>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: 40 }}>SN</Table.Th>
                      <Table.Th>Description</Table.Th>
                      <Table.Th style={{ width: 120 }}>Status</Table.Th>
                      <Table.Th>Remarks</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {(selectedRecord.items || []).map((item, index) => (
                      <Table.Tr key={`${item.description}-${index}`}>
                        <Table.Td>{index + 1}</Table.Td>
                        <Table.Td>{renderChecklistDescription(item.description, index)}</Table.Td>
                        <Table.Td>
                          <Badge color={statusColors[(item.status as ChecklistStatus) || 'YES']}>
                            {item.status ?? 'YES'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>{item.remark || '—'}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Stack>
            </Card>

            <Card withBorder shadow="xs" radius="md" padding="md">
              <Stack gap="sm">
                <Text fw={600}>Remarks</Text>
                <Text size="sm">{selectedRecord.generalRemarks || '—'}</Text>
              </Stack>
            </Card>

            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
              {renderSignatureCard('Inspected by', selectedRecord.inspectedBy)}
              {renderSignatureCard('Reviewed by', selectedRecord.reviewedBy)}
              {renderSignatureCard('Project in charge', selectedRecord.projectInCharge)}
            </SimpleGrid>
          </Stack>
        ) : null}
      </Modal>

      <Modal
        opened={formModalOpened}
        onClose={() => {
          setFormModalOpened(false);
          setEditingId(null);
        }}
        size="85%"
        centered
        overlayProps={{ blur: 3 }}
        title={editingId ? 'Edit JCB Checklist' : 'Record New JCB Checklist'}
      >
        <ScrollArea h="70vh">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="lg" p="sm">
              <Card withBorder radius="md" shadow="xs" padding="lg">
                <Stack gap="xs" align="center">
                  <Text size="xs" c="dimmed" ta="center">
                    Hover the info icons alongside the first nine checklist items to view this diagram in context.
                  </Text>
                </Stack>
              </Card>

              <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing="md">
                <Controller
                  control={control}
                  name="siteId"
                  render={({ field }) => (
                    <Select
                      label="Site (directory)"
                      placeholder={sitesLoading ? 'Loading sites…' : 'Select site'}
                      data={siteOptions}
                      searchable
                      clearable
                      nothingFoundMessage={sitesLoading ? 'Loading…' : 'No sites found'}
                      value={field.value ?? null}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
                />
                <TextInput label="Name of site" placeholder="Type site name" {...register('siteName')} />
                <TextInput label="Site location" placeholder="Project location" {...register('siteLocation')} />
                <Controller
                  control={control}
                  name="inspectionDate"
                  rules={{ required: 'Inspection date is required' }}
                  render={({ field }) => (
                    <DateInput
                      label="Inspection date"
                      placeholder="Select date"
                      value={field.value ?? null}
                      onChange={field.onChange}
                      maxDate={new Date()}
                      error={errors.inspectionDate?.message}
                    />
                  )}
                />
              </SimpleGrid>

              <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
                <TextInput
                  label="Equipment serial no."
                  placeholder="Serial number"
                  {...register('equipmentSerialNumber', { required: 'Equipment serial number is required' })}
                  error={errors.equipmentSerialNumber?.message}
                />
                <TextInput
                  label="Make / model / vehicle number"
                  placeholder="Make / model details"
                  {...register('makeModel', { required: 'Make / model is required' })}
                  error={errors.makeModel?.message}
                />
                <TextInput
                  label="Equipment / vehicle identifier"
                  placeholder="Asset code or vehicle no."
                  {...register('vehicleNumber')}
                />
              </SimpleGrid>

              <Card withBorder radius="md" shadow="xs" padding="md">
                <Stack gap="sm">
                  <Text fw={600} size="sm">
                    Checklist items
                  </Text>
                  <Table striped highlightOnHover withTableBorder>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th style={{ width: 40 }}>SN</Table.Th>
                        <Table.Th>Description</Table.Th>
                        <Table.Th style={{ width: 140 }}>Yes / No / N/A</Table.Th>
                        <Table.Th>Remarks</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {CHECKLIST_ITEMS.map((description, index) => (
                        <Table.Tr key={description}>
                          <Table.Td>{index + 1}</Table.Td>
                          <Table.Td>{renderChecklistDescription(description, index)}</Table.Td>
                          <Table.Td>
                            <Controller
                              control={control}
                              name={`items.${index}.status`}
                              render={({ field }) => (
                                <SegmentedControl
                                  data={STATUS_OPTIONS}
                                  value={field.value ?? 'YES'}
                                  onChange={field.onChange}
                                  fullWidth
                                />
                              )}
                            />
                          </Table.Td>
                          <Table.Td>
                            <Controller
                              control={control}
                              name={`items.${index}.remark`}
                              render={({ field }) => (
                                <Textarea
                                  placeholder="Add remark"
                                  autosize
                                  minRows={1}
                                  value={field.value ?? ''}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                />
                              )}
                            />
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Stack>
              </Card>

              <Card withBorder radius="md" shadow="xs" padding="lg">
                <Stack gap="md">
                  <Text fw={600}>Whether equipment fit for use</Text>
                  <Controller
                    control={control}
                    name="equipmentFitForUse"
                    render={({ field }) => (
                      <SegmentedControl fullWidth data={STATUS_OPTIONS} value={field.value ?? 'YES'} onChange={field.onChange} />
                    )}
                  />
                  <Textarea
                    label="Remarks (if any)"
                    placeholder="Enter overall remarks"
                    autosize
                    minRows={2}
                    {...register('generalRemarks')}
                  />
                </Stack>
              </Card>

              <Stack gap="md">
                <SignatureSection control={control} title="Inspected by" fieldName="inspectedBy" />
                <SignatureSection control={control} title="Reviewed by" fieldName="reviewedBy" />
                <SignatureSection control={control} title="Project in charge" fieldName="projectInCharge" />
              </Stack>

              <Group justify="flex-end">
                <Button type="submit" loading={isSubmitting} disabled={!canCreate}>
                  {editingId ? 'Update checklist' : 'Submit checklist'}
                </Button>
                {!canCreate ? (
                  <Text size="xs" c="dimmed">
                    You do not have permission to add records.
                  </Text>
                ) : null}
              </Group>
            </Stack>
          </form>
        </ScrollArea>
      </Modal>
    </EhsPageLayout>
  );
};

export default JcbChecklistPage;