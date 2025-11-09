// components/ehs/widgets/ScorecardGrid.tsx
import { Card, Group, Progress, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconAlertTriangle, IconCheck, IconFlame, IconShield, IconTrendingUp } from '@tabler/icons-react';

export type ScoreItem = {
  key: string;
  title: string;
  value: number;          // 0-100
  color?: string;
  description?: string;
};

const iconByKey: Record<string, React.ReactNode> = {
  fire: <IconFlame size={18} />,
  drill: <IconCheck size={18} />,
  observation: <IconTrendingUp size={18} />,
  highRisk: <IconAlertTriangle size={18} />,
};

export default function ScorecardGrid({ items }: { items: ScoreItem[] }) {
  if (!items?.length) return null;
  return (
    <Card withBorder radius="md" shadow="sm" p="xl">
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={700}>Emergency Preparedness Scorecard</Text>
          <Text size="xs" c="dimmed">Updated weekly</Text>
        </Group>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
          {items.map((it) => {
            const value = Number.isFinite(it.value) ? Math.max(0, Math.min(100, it.value)) : 0;
            const color = it.color || 'blue';
            return (
              <Stack gap={6} key={it.key}>
                <Group gap="xs">
                  <ThemeIcon color={color} variant="light" radius="md">
                    {iconByKey[it.key] ?? <IconShield size={18} />}
                  </ThemeIcon>
                  <Text fw={600}>{it.title}</Text>
                </Group>
                <Progress value={value} color={color} size="lg" radius="xl" />
                <Text size="xs" c="dimmed">{it.description ?? '—'}</Text>
              </Stack>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Card>
  );
}
