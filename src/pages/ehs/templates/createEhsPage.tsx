import { ReactNode } from 'react';
import { Badge, Button, Card, Group, SimpleGrid, Stack, Table, Text, ThemeIcon } from '@mantine/core';
import { IconDots, IconPlus } from '@tabler/icons-react';
import EhsPageLayout from '@/components/ehs/EhsPageLayout';

export type EhsMetric = {
  label: string;
  value: string;
  status?: 'success' | 'warning' | 'danger' | 'info';
  helperText?: string;
};

export type EhsTableColumn = {
  key: string;
  label: string;
};

export type EhsTableRow = Record<string, ReactNode>;

export type EhsPageSection = {
  title: string;
  description?: string;
  content: ReactNode;
};

export type EhsPageConfig = {
  title: string;
  description: string;
  primaryActionLabel: string;
  onPrimaryActionClick?: () => void;
  metrics?: EhsMetric[];
  table?: {
    columns: EhsTableColumn[];
    rows: EhsTableRow[];
    emptyMessage?: string;
  };
  sections?: EhsPageSection[];
};

const getStatusColor = (status: EhsMetric['status']) => {
  switch (status) {
    case 'success':
      return 'teal';
    case 'warning':
      return 'yellow';
    case 'danger':
      return 'red';
    case 'info':
    default:
      return 'blue';
  }
};

export const createEhsPage = (config: EhsPageConfig) => {
  const Component = () => {
    const metrics = config.metrics ?? [];
    const sections = config.sections ?? [];

    return (
      <EhsPageLayout
        title={config.title}
        description={config.description}
        actions={
          <Group gap="xs">
            <Button leftSection={<IconPlus size={16} />} onClick={config.onPrimaryActionClick}>
              {config.primaryActionLabel}
            </Button>
            <Button variant="light" color="gray" leftSection={<IconDots size={16} />}>
              Quick Actions
            </Button>
          </Group>
        }
      >
        {metrics.length > 0 ? (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {metrics.map((metric) => (
              <Card key={metric.label} withBorder shadow="sm" radius="md" padding="lg">
                <Stack gap={8}>
                  <Group justify="space-between" align="center">
                    <Text size="sm" c="dimmed">
                      {metric.label}
                    </Text>
                    <Badge color={getStatusColor(metric.status)} variant="light">
                      {metric.status ?? 'info'}
                    </Badge>
                  </Group>
                  <Text size="xl" fw={700}>
                    {metric.value}
                  </Text>
                  {metric.helperText ? (
                    <Text size="xs" c="dimmed">
                      {metric.helperText}
                    </Text>
                  ) : null}
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        ) : null}

        {sections.map((section) => (
          <Card key={section.title} withBorder shadow="sm" radius="md" padding="lg">
            <Stack gap="md">
              <Stack gap={4}>
                <Group gap="xs">
                  <ThemeIcon color="blue" size={28} radius="md">
                    <IconDots size={16} />
                  </ThemeIcon>
                  <Stack gap={2}>
                    <Text fw={600}>{section.title}</Text>
                    {section.description ? (
                      <Text size="sm" c="dimmed">
                        {section.description}
                      </Text>
                    ) : null}
                  </Stack>
                </Group>
              </Stack>
              {section.content}
            </Stack>
          </Card>
        ))}

        {config.table ? (
          <Card withBorder shadow="sm" radius="md" padding="lg">
            <Stack gap="sm">
              <Group justify="space-between">
                <Text fw={600}>Recent Records</Text>
                <Badge color="gray" variant="light">
                  {config.table.rows.length} entries
                </Badge>
              </Group>
              <Table striped highlightOnHover withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    {config.table.columns.map((column) => (
                      <Table.Th key={column.key}>{column.label}</Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {config.table.rows.length > 0 ? (
                    config.table.rows.map((row, index) => (
                      <Table.Tr key={index}>
                        {config.table.columns.map((column) => (
                          <Table.Td key={column.key}>{row[column.key]}</Table.Td>
                        ))}
                      </Table.Tr>
                    ))
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={config.table.columns.length}>
                        <Text size="sm" c="dimmed" ta="center">
                          {config.table.emptyMessage ?? 'No records captured yet.'}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </Stack>
          </Card>
        ) : null}
      </EhsPageLayout>
    );
  };

  Component.displayName = `${config.title.replace(/\s+/g, '')}Page`;
  return Component;
};
