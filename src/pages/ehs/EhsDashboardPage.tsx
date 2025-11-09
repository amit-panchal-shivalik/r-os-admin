// src/pages/ehs/EhsDashboardPage.tsx
import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Group,
  Loader,
  Select,
  SimpleGrid,
  useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconClipboardList, IconTrendingUp } from '@tabler/icons-react';

import EhsPageLayout from '@/components/ehs/EhsPageLayout';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { useSites } from '@/hooks/useSites';

// Widgets
import KpiCard from '@/components/ehs/widgets/KpiCard';
import MetaStatGrid from '@/components/ehs/widgets/MetaStatGrid';
import ActionTracker from '@/components/ehs/widgets/ActionTracker';
import UpcomingActivities from '@/components/ehs/widgets/UpcomingActivities';
import IncidentTable from '@/components/ehs/widgets/IncidentTable';
import ScorecardGrid from '@/components/ehs/widgets/ScorecardGrid';

// Adapters (normalize backend DTOs => widget props)
import {
  toKpi,
  toActionItem,
  toActivityItem,
  toIncidentRow,
  toScoreItem,
  type DashboardComplianceMetric,
  type DashboardActionItem,
  type DashboardActivity,
  type DashboardIncident,
  type DashboardScorecardItem,
} from '@/components/ehs/widgets/adapters';

export default function EhsDashboardPage() {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  // Sites selector
  const { sites, loading: sitesLoading } = useSites();
  const [selectedSiteId, setSelectedSiteId] = useState<string | undefined>();

  // Summary for selected site
  const { summary, loading: summaryLoading } = useDashboardSummary(selectedSiteId);

  // Build site select options
  const siteOptions = useMemo(
    () =>
      (sites || []).map((s) => ({
        value: s._id,
        label: s.name,
        description: s.location ?? '',
      })),
    [sites]
  );

  // Initial site selection (prefer the one in summary snapshot, else first site)
  useEffect(() => {
    if (!selectedSiteId && summary?.siteSnapshot?.id) {
      setSelectedSiteId(String(summary.siteSnapshot.id));
    } else if (!selectedSiteId && sites?.length) {
      setSelectedSiteId(sites[0]._id);
    }
  }, [selectedSiteId, summary, sites]);

  // Raw arrays from API (fields may be optional)
  const rawKpis = (summary?.complianceMetrics ?? []) as DashboardComplianceMetric[];
  const rawActions = (summary?.actionItems ?? []) as DashboardActionItem[];
  const rawActivities = (summary?.upcomingActivities ?? []) as DashboardActivity[];
  const rawIncidents = (summary?.incidents ?? []) as DashboardIncident[];
  const rawScore = (summary?.scorecard ?? []) as DashboardScorecardItem[];

  // Map to widget shapes (guaranteed required props)
  const kpis = rawKpis.length
    ? rawKpis.map(toKpi)
    : [
        toKpi({
          key: 'ltiFreeDays',
          title: 'LTI Free Days',
          value: 0,
          target: 100,
          color: 'teal',
          subtitle: 'Target 365 days',
          targetLabel: 'Goal 365 days',
        }),
        toKpi({
          key: 'permitCompliance',
          title: 'Permit Compliance',
          value: 0,
          target: 100,
          color: 'blue',
          subtitle: 'Closed within validity',
          targetLabel: 'Goal 100% closed',
        }),
        toKpi({
          key: 'toolboxAttendance',
          title: 'Toolbox Attendance',
          value: 0,
          target: 95,
          color: 'indigo',
          subtitle: 'Average participation',
          targetLabel: 'Goal ≥95%',
        }),
      ];

  const actions = rawActions.map(toActionItem);
  const activities = rawActivities.map(toActivityItem);
  const incidents = rawIncidents.map(toIncidentRow);
  const score = rawScore.map(toScoreItem);
  const meta = summary?.meta ?? [];

  // Page actions (site picker + quick actions)
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

  return (
    <EhsPageLayout
      title="EHS Dashboard"
      description="Realtime overview of safety performance, compliance indicators, and open actions across the project."
      actions={Actions}
    >
      {/* KPI cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {kpis.map((k, i) => (
          <KpiCard key={k.key} kpi={k} delay={i * 100} />
        ))}
      </SimpleGrid>

      {/* Meta stats (quick facts) */}
      <MetaStatGrid meta={meta} />

      {/* Actions & Upcoming activities */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <ActionTracker items={actions} />
        <UpcomingActivities items={activities} />
      </SimpleGrid>

      {/* Incidents table */}
      <IncidentTable rows={incidents} />

      {/* Scorecard */}
      <ScorecardGrid items={score} />

      {/* Loader while fetching */}
      {summaryLoading ? (
        <Group justify="center" pt="lg">
          <Loader size="sm" />
        </Group>
      ) : null}
    </EhsPageLayout>
  );
}
