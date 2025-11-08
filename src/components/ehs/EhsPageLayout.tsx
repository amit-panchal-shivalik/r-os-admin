import { ReactNode } from 'react';
import { Card, Divider, Group, Stack, Text, Title } from '@mantine/core';

export type EhsPageLayoutProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

const EhsPageLayout = ({ title, description, actions, children }: EhsPageLayoutProps) => {
  return (
    <Stack gap="xl">
      <Card radius="md" shadow="sm" padding="xl" withBorder>
        <Group align="flex-start" justify="space-between" wrap="wrap">
          <Stack gap={6} maw={640}>
            <Title order={2}>{title}</Title>
            {description ? (
              <Text size="sm" c="dimmed">
                {description}
              </Text>
            ) : null}
          </Stack>
          {actions ? <Group gap="xs">{actions}</Group> : null}
        </Group>
      </Card>
      <Divider variant="dashed" />
      <Stack gap="xl">{children}</Stack>
    </Stack>
  );
};

export default EhsPageLayout;
