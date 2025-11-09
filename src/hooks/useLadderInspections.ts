import { useCallback, useEffect, useState } from 'react';
import {
  createLadderInspection,
  listLadderInspections,
  updateLadderInspection,
  LadderInspectionPayload,
  LadderInspectionRecord,
} from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export const useLadderInspections = (initialParams: Record<string, unknown> = {}) => {
  const [records, setRecords] = useState<LadderInspectionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const fetchInspections = useCallback(
    async (overrideParams?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await listLadderInspections({ ...params, ...overrideParams });
        const payload = response?.result?.records ?? response?.result ?? [];
        setRecords(Array.isArray(payload) ? payload : []);
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to load ladder inspections', 'error');
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchInspections().catch(() => undefined);
  }, [fetchInspections]);

  const createInspection = useCallback(async (payload: LadderInspectionPayload) => {
    const response = await createLadderInspection(payload);
    const record = response?.result;
    if (record) {
      setRecords((prev) => [record, ...prev]);
      showMessage('Ladder inspection saved');
      return record;
    }
    await fetchInspections();
    return null;
  }, [fetchInspections]);

  const updateInspection = useCallback(
    async (id: string, payload: Partial<LadderInspectionPayload>) => {
      const response = await updateLadderInspection(id, payload);
      const record = response?.result;
      if (record) {
        setRecords((prev) => prev.map((item) => (item._id === id ? record : item)));
        showMessage('Ladder inspection updated');
        return record;
      }
      await fetchInspections();
      return null;
    },
    [fetchInspections]
  );

  return {
    records,
    loading,
    fetchInspections,
    createInspection,
    updateInspection,
    params,
    setParams,
  };
};
