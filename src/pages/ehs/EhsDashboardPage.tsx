import {
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Progress,
  RingProgress,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconAlertTriangle, IconCheck, IconClipboardList, IconFlame, IconShield, IconTrendingUp } from '@tabler/icons-react';
import EhsPageLayout from '@/components/ehs/EhsPageLayout';

const complianceMetrics = [
  {
    title: 'LTI Free Days',
    value: 186,
    target: 365,
    color: 'teal',
    subtitle: 'Target 365 days',
  },
  {
    title: 'Permit Compliance',
    value: 92,
    target: 100,
    color: 'blue',
    subtitle: 'Closed within validity',
  },
  {
    title: 'Toolbox Attendance',
    value: 87,
    target: 95,
    color: 'indigo',
    subtitle: 'Average participation',
  },
];

const openActions = [
  {
    id: 'ACT-204',
    title: 'Repair guard rails at Block C terrace',
    owner: 'Civil Contractor',
    due: '29 Jan 2025',
    severity: 'High',
  },
  {
    id: 'ACT-201',
    title: 'Replace expired first-aid stock',
    owner: 'Site Nurse',
    due: '28 Jan 2025',
    severity: 'Medium',
  },
  {
    id: 'ACT-197',
    title: 'Update confined space rescue plan',
    owner: 'EHS Team',
    due: '31 Jan 2025',
    severity: 'High',
  },
];

const upcomingActivities = [
  {
    date: '29 Jan 2025',
    activity: 'Working at Height campaign',
    owner: 'EHS + Contractors',
    status: 'Ready',
  },
  {
    date: '02 Feb 2025',
    activity: 'Quarterly crane certification',
    owner: 'Plant & Machinery',
    status: 'Scheduled',
  },
  {
    date: '15 Feb 2025',
    activity: 'Emergency evacuation drill',
    owner: 'EHS Core Team',
    status: 'Planning',
  },
];

const significantIncidents = [
  {
    ref: 'AIR/2025/04',
    date: '22 Jan 2025',
    category: 'First Aid',
    status: 'Corrective action pending',
  },
  {
    ref: 'NM/2025/031',
    date: '20 Jan 2025',
    category: 'Near Miss',
    status: 'Closed with training',
  },
  {
    ref: 'OBS/2025/118',
    date: '18 Jan 2025',
    category: 'Unsafe Condition',
    status: 'Rectified',
  },
];

const EhsDashboardPage = () => {
  return (
    <EhsPageLayout
      title="EHS Dashboard"
      description="Realtime overview of safety performance, compliance indicators, and open actions across the project."
      actions={
        <Group gap="xs">
          <Button leftSection={<IconClipboardList size={16} />}>Create Inspection</Button>
          <Button variant="light" color="gray" leftSection={<IconTrendingUp size={16} />}>
            Export Summary
          </Button>
        </Group>
      }
    >
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {complianceMetrics.map((metric) => (
          <Card key={metric.title} withBorder shadow="sm" radius="md" padding="xl">
            <Stack gap="md">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  {metric.title}
                </Text>
                <Badge color={metric.color} variant="light">
                  Target {metric.target}%
                </Badge>
              </Group>
              <Group gap="md" align="center">
                <RingProgress
                  size={120}
                  thickness={12}
                  roundCaps
                  sections={[{ value: metric.value, color: metric.color }]}
                  label={<Text fw={700}>{metric.value}%</Text>}
                />
                <Stack gap={4}>
                  <Text size="sm" c="dimmed">
                    {metric.subtitle}
                  </Text>
                  <Progress size="sm" value={metric.value} color={metric.color} radius="xl" />
                  <Text size="xs" c="dimmed">
                    Progress towards site target
                  </Text>
                </Stack>
              </Group>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="lg">
        <Card withBorder radius="md" shadow="sm" padding="xl">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={4}>Critical Action Tracker</Title>
              <Badge color="red" variant="light">
                {openActions.length} open
              </Badge>
            </Group>
            <Stack gap="sm">
              {openActions.map((action) => (
                <Card key={action.id} radius="md" withBorder padding="md" shadow="xs">
                  <Stack gap={6}>
                    <Group justify="space-between" align="center">
                      <Group gap="xs">
                        <ThemeIcon color="red" size={26} radius="md">
                          <IconAlertTriangle size={16} />
                        </ThemeIcon>
                        <Stack gap={2}>
                          <Text fw={600}>{action.title}</Text>
                          <Text size="xs" c="dimmed">
                            Owner: {action.owner}
                          </Text>
                        </Stack>
                      </Group>
                      <Badge color={action.severity === 'High' ? 'red' : 'yellow'}>{action.severity}</Badge>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Due by {action.due}
                      </Text>
                      <Button variant="light" size="xs">
                        View Details
                      </Button>
                    </Group>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Stack>
        </Card>

        <Card withBorder radius="md" shadow="sm" padding="xl">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={4}>Upcoming Activities</Title>
              <Badge color="blue" variant="light">
                Next 30 days
              </Badge>
            </Group>
            <Stack gap="sm">
              {upcomingActivities.map((item) => (
                <Card key={item.activity} radius="md" withBorder padding="md" shadow="xs">
                  <Group justify="space-between" align="flex-start">
                    <Stack gap={4}>
                      <Text fw={600}>{item.activity}</Text>
                      <Text size="xs" c="dimmed">
                        Owner: {item.owner}
                      </Text>
                    </Stack>
                    <Stack align="flex-end" gap={4}>
                      <Badge color="blue" variant="light">
                        {item.status}
                      </Badge>
                      <Text size="xs" c="dimmed">
                        {item.date}
                      </Text>
                    </Stack>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Stack>
        </Card>
      </SimpleGrid>

      <Card withBorder radius="md" shadow="sm" padding="xl">
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={4}>Recent Incident & Observation Log</Title>
            <Button variant="subtle" color="gray" leftSection={<IconShield size={16} />}>
              View All Records
            </Button>
          </Group>
          <Divider variant="dashed" />
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Reference</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {significantIncidents.map((incident) => (
                <Table.Tr key={incident.ref}>
                  <Table.Td>{incident.ref}</Table.Td>
                  <Table.Td>{incident.date}</Table.Td>
                  <Table.Td>{incident.category}</Table.Td>
                  <Table.Td>
                    <Badge color={incident.status.includes('pending') ? 'red' : 'green'} variant="light">
                      {incident.status}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Stack>
      </Card>

      <Card withBorder radius="md" shadow="sm" padding="xl">
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={4}>Emergency Preparedness Scorecard</Title>
            <Badge color="teal" variant="light">
              Updated weekly
            </Badge>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
            <Stack gap={4}>
              <Group gap="xs">
                <ThemeIcon color="red" variant="light" radius="md">
                  <IconFlame size={18} />
                </ThemeIcon>
                <Text fw={600}>Fire Equipment</Text>
              </Group>
              <Progress value={96} color="red" size="lg" radius="xl" />
              <Text size="xs" c="dimmed">
                7 extinguishers due for refill
              </Text>
            </Stack>
            <Stack gap={4}>
              <Group gap="xs">
                <ThemeIcon color="blue" variant="light" radius="md">
                  <IconCheck size={18} />
                </ThemeIcon>
                <Text fw={600}>Mock Drill Readiness</Text>
              </Group>
              <Progress value={78} color="blue" size="lg" radius="xl" />
              <Text size="xs" c="dimmed">
                Next drill on 15 Feb
              </Text>
            </Stack>
            <Stack gap={4}>
              <Group gap="xs">
                <ThemeIcon color="teal" variant="light" radius="md">
                  <IconTrendingUp size={18} />
                </ThemeIcon>
                <Text fw={600}>Observation Closure</Text>
              </Group>
              <Progress value={82} color="teal" size="lg" radius="xl" />
              <Text size="xs" c="dimmed">
                Target closure ≥ 90%
              </Text>
            </Stack>
            <Stack gap={4}>
              <Group gap="xs">
                <ThemeIcon color="orange" variant="light" radius="md">
                  <IconAlertTriangle size={18} />
                </ThemeIcon>
                <Text fw={600}>High Risk Controls</Text>
              </Group>
              <Progress value={68} color="orange" size="lg" radius="xl" />
              <Text size="xs" c="dimmed">
                3 high risk items open
              </Text>
            </Stack>
          </SimpleGrid>
        </Stack>
      </Card>
    </EhsPageLayout>
  );
};

export default EhsDashboardPage;
