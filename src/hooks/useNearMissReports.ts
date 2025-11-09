import { useCallback, useEffect, useState } from 'react';
import {
  createNearMissReport,
  listNearMissReports,
  updateNearMissReport,
  NearMissReportPayload,
  NearMissReportRecord,
} from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export const useNearMissReports = (initialParams: Record<string, unknown> = {}) => {
  const [records, setRecords] = useState<NearMissReportRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const fetchReports = useCallback(
    async (overrideParams?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await listNearMissReports({ ...params, ...overrideParams });
        const payload = response?.result?.records ?? response?.result ?? [];
        setRecords(Array.isArray(payload) ? payload : []);
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to load near miss reports', 'error');
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchReports().catch(() => undefined);
  }, [fetchReports]);

  const createReport = useCallback(async (payload: NearMissReportPayload) => {
    const response = await createNearMissReport(payload);
    const record = response?.result;
    if (record) {
      setRecords((prev) => [record, ...prev]);
      showMessage('Near miss report saved');
      return record;
    }
    await fetchReports();
    return null;
  }, [fetchReports]);

  const updateReport = useCallback(
    async (id: string, payload: Partial<NearMissReportPayload>) => {
      const response = await updateNearMissReport(id, payload);
      const record = response?.result;
      if (record) {
        setRecords((prev) => prev.map((item) => (item._id === id ? record : item)));
        showMessage('Near miss report updated');
        return record;
      }
      await fetchReports();
      return null;
    },
    [fetchReports]
  );

  return {
    records,
    loading,
    params,
    setParams,
    fetchReports,
    createReport,
    updateReport,
  };
};
