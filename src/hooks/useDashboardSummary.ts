import { useCallback, useEffect, useState } from 'react';
import {
  fetchDashboardSummary,
  upsertDashboardSummary,
  DashboardSummaryRecord,
  DashboardSummaryPayload,
} from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export const useDashboardSummary = (siteId?: string) => {
  const [summary, setSummary] = useState<DashboardSummaryRecord | null>(null);
  const [loading, setLoading] = useState(false);

  const loadSummary = useCallback(
    async (nextSiteId?: string) => {
      setLoading(true);
      try {
        const response = await fetchDashboardSummary(nextSiteId ? { siteId: nextSiteId } : undefined);
        const record = response?.result;
        setSummary(record ?? null);
        return record ?? null;
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to load dashboard summary', 'error');
        setSummary(null);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadSummary(siteId).catch(() => undefined);
  }, [loadSummary, siteId]);

  const saveSummary = useCallback(async (payload: DashboardSummaryPayload) => {
    const response = await upsertDashboardSummary(payload);
    const record = response?.result;
    if (record) {
      setSummary(record);
      showMessage('Dashboard summary updated');
    }
    return record;
  }, []);

  return {
    summary,
    loading,
    refresh: loadSummary,
    saveSummary,
  };
};
