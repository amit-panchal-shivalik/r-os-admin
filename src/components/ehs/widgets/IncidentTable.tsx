// components/ehs/widgets/IncidentTable.tsx
import { Badge, Card, Divider, ScrollArea, Table, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useMantineTheme } from '@mantine/core';

export type IncidentRow = {
  ref: string;
  date?: string | null;
  category?: string;
  status?: string; // 'Pending Actions' vs 'Closed'
};

export default function IncidentTable({ rows }: { rows: IncidentRow[] }) {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  return (
    <Card withBorder radius="md" shadow="sm" p="xl">
      <Text fw={700}>Recent Incident & Observation Log</Text>
      <Divider my="sm" variant="dashed" />

      {/* 👇 ScrollArea now scrolls horizontally on small screens */}
      <ScrollArea
        type="always"
        offsetScrollbars
        scrollbarSize={8}
        styles={{
          viewport: {
            overflowX: isMobile ? 'auto' : 'visible',
          },
        }}
      >
        <div style={{ minWidth: isMobile ? '600px' : '100%' }}>
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
              {rows.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Text size="sm" c="dimmed" ta="center">
                      No incidents recorded for this site.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                rows.map((r) => (
                  <Table.Tr key={r.ref}>
                    <Table.Td>{r.ref}</Table.Td>
                    <Table.Td>{r.date ?? '—'}</Table.Td>
                    <Table.Td>{r.category ?? '—'}</Table.Td>
                    <Table.Td>
                      <Badge
                        color={(r.status || '').toLowerCase().includes('pending') ? 'red' : 'green'}
                        variant="light"
                      >
                        {r.status ?? '—'}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </div>
      </ScrollArea>
    </Card>
  );
}
