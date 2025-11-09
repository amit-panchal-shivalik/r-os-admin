// components/ehs/widgets/KpiCard.tsx
import { Badge, Card, Group, Progress, RingProgress, Stack, Text } from '@mantine/core';

export type Kpi = {
  key: string;
  title: string;
  value: number;       // 0-100
  target?: number;     // usually 100
  color?: string;      // Mantine color
  subtitle?: string;   // small text
  targetLabel?: string;
};

export default function KpiCard({ kpi, delay = 0 }: { kpi: Kpi; delay?: number }) {
  const value = Number.isFinite(kpi.value) ? Math.max(0, Math.min(100, kpi.value)) : 0;
  const color = kpi.color || 'blue';

  return (
    <Card
      withBorder
      shadow="sm"
      radius="md"
      p="xl"
      style={{ opacity: 0, animation: `fadeIn .6s ${delay}ms forwards` }}
    >
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Text size="sm" c="dimmed">
            {kpi.title}
          </Text>
          {kpi.targetLabel || kpi.target ? (
            <Badge color={color} variant="light">
              {kpi.targetLabel ?? `Target ${kpi.target}%`}
            </Badge>
          ) : null}
        </Group>

        <Group gap="md" align="center">
          <RingProgress
            size={110}
            thickness={12}
            roundCaps
            sections={[{ value, color }]}
            label={
              <Text fw={700} ta="center">
                {value}%
              </Text>
            }
          />
          <Stack gap={6} style={{ flex: 1 }}>
            <Text size="sm" c="dimmed">
              {kpi.subtitle ?? '—'}
            </Text>
            <Progress radius="xl" size="sm" value={value} color={color} />
            <Text size="xs" c="dimmed">
              Progress towards site target
            </Text>
          </Stack>
        </Group>
      </Stack>
    </Card>
  );
}
