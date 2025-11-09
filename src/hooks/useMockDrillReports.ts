import { useCallback, useEffect, useState } from 'react';
import {
  createMockDrillReport,
  listMockDrillReports,
  updateMockDrillReport,
  MockDrillReportPayload,
  MockDrillReportRecord,
} from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export const useMockDrillReports = (initialParams: Record<string, unknown> = {}) => {
  const [records, setRecords] = useState<MockDrillReportRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const fetchReports = useCallback(
    async (overrideParams?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await listMockDrillReports({ ...params, ...overrideParams });
        const payload = response?.result?.records ?? response?.result ?? [];
        setRecords(Array.isArray(payload) ? payload : []);
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to load mock drill reports', 'error');
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchReports().catch(() => undefined);
  }, [fetchReports]);

  const createReport = useCallback(async (payload: MockDrillReportPayload) => {
    const response = await createMockDrillReport(payload);
    const record = response?.result;
    if (record) {
      setRecords((prev) => [record, ...prev]);
      showMessage('Mock drill report saved');
      return record;
    }
    await fetchReports();
    return null;
  }, [fetchReports]);

  const updateReport = useCallback(
    async (id: string, payload: Partial<MockDrillReportPayload>) => {
      const response = await updateMockDrillReport(id, payload);
      const record = response?.result;
      if (record) {
        setRecords((prev) => prev.map((item) => (item._id === id ? record : item)));
        showMessage('Mock drill report updated');
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
    fetchReports,
    createReport,
    updateReport,
    params,
    setParams,
  };
};
