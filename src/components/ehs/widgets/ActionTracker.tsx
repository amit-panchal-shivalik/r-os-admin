// components/ehs/widgets/ActionTracker.tsx
import { Badge, Button, Card, Group, Stack, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

export type ActionItem = {
  id?: string;
  title: string;
  owner?: string;
  due?: string | null;     // ISO yyyy-mm-dd
  severity?: 'High' | 'Medium' | 'Low' | string;
};

export default function ActionTracker({ items }: { items: ActionItem[] }) {
  return (
    <Card withBorder radius="md" shadow="sm" p="xl">
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={700}>Critical Action Tracker</Text>
          <Badge color="red" variant="light">{items.length} open</Badge>
        </Group>
        <Stack gap="sm">
          {items.length === 0 ? (
            <Text size="sm" c="dimmed">No open actions. Great job!</Text>
          ) : items.map((a) => {
            const color = a.severity === 'High' ? 'red' : a.severity === 'Low' ? 'green' : 'yellow';
            return (
              <Card key={a.id ?? a.title} withBorder radius="md" p="md" shadow="xs">
                <Stack gap={6}>
                  <Group justify="space-between">
                    <Group gap="xs">
                      <IconAlertTriangle size={18} />
                      <Stack gap={2}>
                        <Text fw={600}>{a.title}</Text>
                        <Text size="xs" c="dimmed">Owner: {a.owner ?? 'Team'}</Text>
                      </Stack>
                    </Group>
                    <Badge color={color}>{a.severity ?? 'Medium'}</Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">{a.due ? `Due by ${a.due}` : 'Due date TBC'}</Text>
                    <Button size="xs" variant="light">View details</Button>
                  </Group>
                </Stack>
              </Card>
            );
          })}
        </Stack>
      </Stack>
    </Card>
  );
}
