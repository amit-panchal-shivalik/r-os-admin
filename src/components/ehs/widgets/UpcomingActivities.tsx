// components/ehs/widgets/UpcomingActivities.tsx
import { Badge, Card, Group, Stack, Text } from '@mantine/core';

export type ActivityItem = {
  activity: string;
  owner?: string;
  date?: string | null;   // ISO yyyy-mm-dd
  status?: string;        // Planned/In Progress/This Month/etc.
};

export default function UpcomingActivities({ items }: { items: ActivityItem[] }) {
  return (
    <Card withBorder radius="md" shadow="sm" p="xl">
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={700}>Upcoming Activities</Text>
          <Badge color="blue" variant="light">Next 30 days</Badge>
        </Group>
        <Stack gap="sm">
          {items.length === 0 ? (
            <Text size="sm" c="dimmed">No scheduled items in the next 30 days.</Text>
          ) : items.map((i, idx) => (
            <Card key={`${i.activity}-${i.date ?? idx}`} withBorder radius="md" p="md" shadow="xs">
              <Group justify="space-between" align="flex-start">
                <Stack gap={2}>
                  <Text fw={600}>{i.activity}</Text>
                  <Text size="xs" c="dimmed">Owner: {i.owner ?? '—'}</Text>
                </Stack>
                <Stack align="flex-end" gap={4}>
                  <Badge color="blue" variant="light">{i.status ?? 'Planned'}</Badge>
                  <Text size="xs" c="dimmed">{i.date ?? 'Date TBC'}</Text>
                </Stack>
              </Group>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}
