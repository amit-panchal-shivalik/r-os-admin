import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Badge,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { IconArrowLeft, IconPrinter } from '@tabler/icons-react';
import { fetchSafetyInduction } from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

const formatDate = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const SafetyInductionPrintPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<any>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecord = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await fetchSafetyInduction(id);
        setRecord(response?.result);
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to load safety induction record', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadRecord();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Stack gap="lg" p="xl" maw={960} mx="auto">
      <Group justify="space-between" className="print-hidden">
        <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <Button leftSection={<IconPrinter size={16} />} onClick={handlePrint}>
          Print
        </Button>
      </Group>

      {loading ? (
        <Group justify="center" py="xl">
          <Loader size="lg" />
        </Group>
      ) : !record ? (
        <Paper withBorder p="xl" radius="md">
          <Text ta="center">Safety induction record not found.</Text>
        </Paper>
      ) : (
        <Paper withBorder p="xl" radius="md" shadow="sm">
          <Stack gap="md">
            <Group justify="space-between" align="flex-start">
              <Stack gap={4}>
                <Title order={3}>Shivalik Safety Induction Form</Title>
                <Text size="sm" c="dimmed">
                  Safety is our foremost priority. Please ensure inductees review and sign the induction register.
                </Text>
              </Stack>
              <Stack gap={4} align="flex-end">
                <Text size="sm">Form No.: {record.formNo ?? 'EHS-F-01'}</Text>
                <Text size="sm">Rev. No.: {record.revisionNo ?? '00'}</Text>
              </Stack>
            </Group>

            <Table withTableBorder>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Th w="25%">Date</Table.Th>
                  <Table.Td>{formatDate(record.inductionDate)}</Table.Td>
                  <Table.Th w="20%">Time</Table.Th>
                  <Table.Td>
                    {record.timeFrom || '—'} {record.timeTo ? ` - ${record.timeTo}` : ''}
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>Project Name</Table.Th>
                  <Table.Td>{record.projectName}</Table.Td>
                  <Table.Th>Project Location</Table.Th>
                  <Table.Td>{record.projectLocation}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>Organization</Table.Th>
                  <Table.Td>{record.organizationName ?? '—'}</Table.Td>
                  <Table.Th>Contractor</Table.Th>
                  <Table.Td>{record.contractorName}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>Conducted By</Table.Th>
                  <Table.Td>{record.conductedByName}</Table.Td>
                  <Table.Th>Designation</Table.Th>
                  <Table.Td>{record.conductedByDesignation ?? '—'}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th>Project In-charge</Table.Th>
                  <Table.Td colSpan={3}>{record.projectInCharge ?? '—'}</Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>

            <Stack gap={4}>
              <Text fw={600}>Topics Covered:</Text>
              <Text size="sm">
                {(record.topicsCovered ?? []).join(', ')}
              </Text>
            </Stack>

            <Table withTableBorder highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Sr. No</Table.Th>
                  <Table.Th>Name of Person</Table.Th>
                  <Table.Th>Age</Table.Th>
                  <Table.Th>Gender</Table.Th>
                  <Table.Th>Designation</Table.Th>
                  <Table.Th>Gov ID</Table.Th>
                  <Table.Th>Induction No.</Table.Th>
                  <Table.Th>Signature</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {(record.attendees ?? []).map((attendee: any, index: number) => (
                  <Table.Tr key={`${attendee.govIdNumber}-${index}`}>
                    <Table.Td>{index + 1}</Table.Td>
                    <Table.Td>{attendee.name}</Table.Td>
                    <Table.Td>{attendee.age ?? '—'}</Table.Td>
                    <Table.Td>{attendee.gender ?? '—'}</Table.Td>
                    <Table.Td>{attendee.designation ?? '—'}</Table.Td>
                    <Table.Td>
                      <Stack gap={2}>
                        <Text size="sm">{attendee.govIdType ?? '—'}</Text>
                        <Text size="xs" c="dimmed">
                          {attendee.govIdNumber ?? '—'}
                        </Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>{attendee.inductionNumber ?? '—'}</Table.Td>
                    <Table.Td>
                      {attendee.signature ? (
                        <img src={attendee.signature} alt="Signature" style={{ width: 120, height: 48 }} />
                      ) : (
                        <Text size="xs" c="dimmed">
                          —
                        </Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
                {Array.from({ length: Math.max(0, 15 - (record.attendees?.length ?? 0)) }).map((_, index) => (
                  <Table.Tr key={`empty-${index}`}>
                    <Table.Td>{(record.attendees?.length ?? 0) + index + 1}</Table.Td>
                    <Table.Td colSpan={7}>
                      <Text size="xs" c="dimmed">
                        —
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            <Group justify="space-between" align="flex-start" mt="md">
              <Stack gap={4}>
                <Text size="sm" fw={600}>
                  Conducted By (Name & Signature)
                </Text>
                <Text size="sm">{record.conductedByName}</Text>
              </Stack>
              <Stack gap={4} align="flex-end">
                <Text size="sm" fw={600}>
                  Project In-charge
                </Text>
                <Text size="sm">{record.projectInCharge ?? '—'}</Text>
              </Stack>
            </Group>

            <Text size="sm" c="dimmed" mt="lg">
              Note: Ensure to attach all new inducted persons Gov-ID card photocopy with induction form.
            </Text>
          </Stack>
        </Paper>
      )}

      <style>{`
        @media print {
          .print-hidden { display: none !important; }
          body { background: #fff; }
        }
      `}</style>
    </Stack>
  );
};

export default SafetyInductionPrintPage;
