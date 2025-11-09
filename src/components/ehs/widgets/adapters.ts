// src/components/ehs/widgets/adapters.ts
// These mirror your backend DTOs where many props are optional:
export type DashboardComplianceMetric = {
    key?: string;
    title?: string;
    value?: number;
    target?: number;
    color?: string;
    subtitle?: string;
    targetLabel?: string;
  };
  
  export type DashboardActionItem = {
    id?: string;
    title?: string;
    owner?: string;
    due?: string | null;
    severity?: 'High' | 'Medium' | 'Low' | string;
  };
  
  export type DashboardActivity = {
    activity?: string;
    owner?: string;
    date?: string | null;
    status?: string;
  };
  
  export type DashboardIncident = {
    ref?: string;
    date?: string | null;
    category?: string;
    status?: string;
  };
  
  export type DashboardScorecardItem = {
    key?: string;
    title?: string;
    value?: number;
    color?: string;
    description?: string;
  };
  
  // Import widget prop types
  import type { Kpi } from './KpiCard';
  import type { ActionItem } from './ActionTracker';
  import type { ActivityItem } from './UpcomingActivities';
  import type { IncidentRow } from './IncidentTable';
  import type { ScoreItem } from './ScorecardGrid';
  
  // Helpers
  const clampPercent = (n: unknown, def = 0) => {
    const v = typeof n === 'number' && Number.isFinite(n) ? n : def;
    return Math.max(0, Math.min(100, Math.round(v)));
  };
  const nonEmpty = (s: unknown, def = '') =>
    typeof s === 'string' && s.trim().length ? s : def;
  
  // ADAPTERS
  export const toKpi = (m: DashboardComplianceMetric, idx = 0): Kpi => ({
    key: nonEmpty(m.key, `kpi-${idx}`),
    title: nonEmpty(m.title, 'Unnamed KPI'),
    value: clampPercent(m.value, 0),
    target: typeof m.target === 'number' ? m.target : 100,
    color: nonEmpty(m.color, 'blue'),
    subtitle: nonEmpty(m.subtitle, ''),
    targetLabel: nonEmpty(m.targetLabel, ''),
  });
  
  export const toActionItem = (a: DashboardActionItem, idx = 0): ActionItem => ({
    id: nonEmpty(a.id, `action-${idx}`),
    title: nonEmpty(a.title, 'Untitled action'),
    owner: nonEmpty(a.owner, 'Team'),
    due: a.due ?? null,
    severity: nonEmpty(a.severity, 'Medium') as ActionItem['severity'],
  });
  
  export const toActivityItem = (a: DashboardActivity, idx = 0): ActivityItem => ({
    activity: nonEmpty(a.activity, 'Planned activity'),
    owner: nonEmpty(a.owner, '—'),
    date: a.date ?? null,
    status: nonEmpty(a.status, 'Planned'),
  });
  
  export const toIncidentRow = (i: DashboardIncident, idx = 0): IncidentRow => ({
    ref: nonEmpty(i.ref, `INC-${idx}`),
    date: i.date ?? null,
    category: nonEmpty(i.category, '—'),
    status: nonEmpty(i.status, '—'),
  });
  
  export const toScoreItem = (s: DashboardScorecardItem, idx = 0): ScoreItem => ({
    key: nonEmpty(s.key, `score-${idx}`),
    title: nonEmpty(s.title, 'Untitled'),
    value: clampPercent(s.value, 0),
    color: nonEmpty(s.color, 'blue'),
    description: nonEmpty(s.description, ''),
  });
  