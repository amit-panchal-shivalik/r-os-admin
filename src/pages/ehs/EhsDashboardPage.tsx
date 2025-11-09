// pages/ehs/dashboard.tsx (or your existing page)
import { Button, Group, Loader, Select, SimpleGrid, Stack, Title, useMantineTheme } from '@mantine/core';
import { IconClipboardList, IconTrendingUp } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import EhsPageLayout from '@/components/ehs/EhsPageLayout';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { useSites } from '@/hooks/useSites';
import KpiCard from '@/components/ehs/widgets/KpiCard';
import MetaStatGrid from '@/components/ehs/widgets/MetaStatGrid';
import ActionTracker from '@/components/ehs/widgets/ActionTracker';
import UpcomingActivities from '@/components/ehs/widgets/UpcomingActivities';
import IncidentTable from '@/components/ehs/widgets/IncidentTable';
import ScorecardGrid from '@/components/ehs/widgets/ScorecardGrid';
import { useEffect, useMemo, useState } from 'react';

export default function EhsDashboardPage() {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const { sites, loading: sitesLoading } = useSites();
  const [selectedSiteId, setSelectedSiteId] = useState<string | undefined>();
  const { summary, loading: summaryLoading } = useDashboardSummary(selectedSiteId);

  const siteOptions = useMemo(
    () => sites.map((s) => ({ value: s._id, label: s.name, description: s.location ?? '' })),
    [sites]
  );

  useEffect(() => {
    if (!selectedSiteId && summary?.siteSnapshot?.id) {
      setSelectedSiteId(String(summary.siteSnapshot.id));
    } else if (!selectedSiteId && sites.length) {
      setSelectedSiteId(sites[0]._id);
    }
  }, [selectedSiteId, summary, sites]);

  const Actions = (
    <Group gap="xs" w={isMobile ? '100%' : undefined} wrap="nowrap">
      <Select
        placeholder={sitesLoading ? 'Loading sites...' : 'Select site'}
        data={siteOptions}
        value={selectedSiteId ?? null}
        onChange={(v) => setSelectedSiteId(v ?? undefined)}
        searchable
        clearable
        radius="md"
        w={isMobile ? '100%' : 260}
        leftSection={<IconTrendingUp size={16} />}
      />
      <Button leftSection={<IconClipboardList size={16} />} size="md">
        Create Inspection
      </Button>
      <Button variant="light" color="gray" leftSection={<IconTrendingUp size={16} />} size="md">
        Export Summary
      </Button>
    </Group>
  );

  const cm = summary?.complianceMetrics ?? [];
  const meta = summary?.meta ?? [];
  const actions = summary?.actionItems ?? [];
  const activities = summary?.upcomingActivities ?? [];
  const incidents = summary?.incidents ?? [];
  const score = summary?.scorecard ?? [];

  return (
    <EhsPageLayout
      title="EHS Dashboard"
      description="Realtime overview of safety performance, compliance indicators, and open actions across the project."
      actions={Actions}
    >
      {/* KPI cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {(cm.length ? cm : [
          { key: 'ltiFreeDays', title: 'LTI Free Days', value: 0, target: 365, color: 'teal', subtitle: 'Target 365 days' },
          { key: 'permitCompliance', title: 'Permit Compliance', value: 0, target: 100, color: 'blue', subtitle: 'Closed within validity' },
          { key: 'toolboxAttendance', title: 'Toolbox Attendance', value: 0, target: 95, color: 'indigo', subtitle: 'Average participation' },
        ]).map((k, i) => <KpiCard key={k.key ?? k.title} kpi={k} delay={i * 100} />)}
      </SimpleGrid>

      {/* Meta stats */}
      <MetaStatGrid meta={meta} />

      {/* Two-column: Actions & Activities */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <ActionTracker items={actions} />
        <UpcomingActivities items={activities} />
      </SimpleGrid>

      {/* Incidents */}
      <IncidentTable rows={incidents} />

      {/* Scorecard */}
      <ScorecardGrid items={score} />

      {/* Loader at bottom */}
      {summaryLoading ? (
        <Group justify="center" pt="lg"><Loader size="sm" /></Group>
      ) : null}
    </EhsPageLayout>
  );
}
