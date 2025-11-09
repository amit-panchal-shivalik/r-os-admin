// components/ehs/widgets/MetaStatGrid.tsx
import { Card, Group, SimpleGrid, Stack, Text, ThemeIcon, Tooltip } from '@mantine/core';
import { IconUsers, IconCalendarEvent, IconMessages, IconListCheck } from '@tabler/icons-react';

export type MetaStat = {
  key: string;
  label: string;
  value: string;
  helper?: string;
  trend?: 'up' | 'down' | 'flat';
  changeText?: string;
};

const iconByKey: Record<string, React.ReactNode> = {
  workers: <IconUsers size={18} />,
  inductions: <IconCalendarEvent size={18} />,
  toolbox: <IconMessages size={18} />,
  openActions: <IconListCheck size={18} />,
};

export default function MetaStatGrid({ meta }: { meta: MetaStat[] }) {
  if (!meta?.length) return null;
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
      {meta.map((m) => (
        <Card key={m.key} withBorder shadow="xs" radius="md" p="lg">
          <Group align="flex-start" gap="sm">
            <ThemeIcon variant="light" radius="md">{iconByKey[m.key] ?? <IconListCheck size={18} />}</ThemeIcon>
            <Stack gap={2} style={{ flex: 1 }}>
              <Text size="xs" c="dimmed">{m.label}</Text>
              <Group gap="xs">
                <Text fw={700}>{m.value}</Text>
                {m.changeText ? (
                  <Text size="xs" c="dimmed">({m.changeText})</Text>
                ) : null}
              </Group>
              {m.helper ? (
                <Tooltip label={m.helper}>
                  <Text size="xs" c="dimmed" lineClamp={1}>{m.helper}</Text>
                </Tooltip>
              ) : null}
            </Stack>
          </Group>
        </Card>
      ))}
    </SimpleGrid>
  );
}
