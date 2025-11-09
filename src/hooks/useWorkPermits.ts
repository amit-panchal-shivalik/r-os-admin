import { useCallback, useEffect, useState } from 'react';
import {
  createWorkPermit,
  listWorkPermits,
  updateWorkPermit,
  WorkPermitPayload,
  WorkPermitRecord,
} from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export const useWorkPermits = (initialParams: Record<string, unknown> = {}) => {
  const [records, setRecords] = useState<WorkPermitRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const fetchPermits = useCallback(
    async (overrideParams?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await listWorkPermits({ ...params, ...overrideParams });
        const payload = response?.result?.records ?? response?.result ?? [];
        setRecords(Array.isArray(payload) ? payload : []);
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to load work permits', 'error');
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchPermits().catch(() => undefined);
  }, [fetchPermits]);

  const createPermit = useCallback(async (payload: WorkPermitPayload) => {
    const response = await createWorkPermit(payload);
    const record = response?.result;
    if (record) {
      setRecords((prev) => [record, ...prev]);
      showMessage('Work permit saved');
      return record;
    }
    await fetchPermits();
    return null;
  }, [fetchPermits]);

  const updatePermit = useCallback(
    async (id: string, payload: Partial<WorkPermitPayload>) => {
      const response = await updateWorkPermit(id, payload);
      const record = response?.result;
      if (record) {
        setRecords((prev) => prev.map((item) => (item._id === id ? record : item)));
        showMessage('Work permit updated');
        return record;
      }
      await fetchPermits();
      return null;
    },
    [fetchPermits]
  );

  return {
    records,
    loading,
    params,
    setParams,
    fetchPermits,
    createPermit,
    updatePermit,
  };
};
