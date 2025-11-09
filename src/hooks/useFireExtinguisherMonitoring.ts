import { useCallback, useEffect, useState } from 'react';
import {
  createFireExtinguisherMonitoring,
  listFireExtinguisherMonitoring,
  updateFireExtinguisherMonitoring,
  FireExtinguisherMonitoringPayload,
  FireExtinguisherMonitoringRecord,
} from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export const useFireExtinguisherMonitoring = (initialParams: Record<string, unknown> = {}) => {
  const [records, setRecords] = useState<FireExtinguisherMonitoringRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const fetchRecords = useCallback(
    async (overrideParams?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await listFireExtinguisherMonitoring({ ...params, ...overrideParams });
        const payload = response?.result?.records ?? response?.result ?? [];
        setRecords(Array.isArray(payload) ? payload : []);
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to load fire extinguisher records', 'error');
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchRecords().catch(() => undefined);
  }, [fetchRecords]);

  const createRecord = useCallback(async (payload: FireExtinguisherMonitoringPayload) => {
    const response = await createFireExtinguisherMonitoring(payload);
    const record = response?.result;
    if (record) {
      setRecords((prev) => [record, ...prev]);
      showMessage('Fire extinguisher record saved');
      return record;
    }
    await fetchRecords();
    return null;
  }, [fetchRecords]);

  const updateRecord = useCallback(
    async (id: string, payload: Partial<FireExtinguisherMonitoringPayload>) => {
      const response = await updateFireExtinguisherMonitoring(id, payload);
      const record = response?.result;
      if (record) {
        setRecords((prev) => prev.map((item) => (item._id === id ? record : item)));
        showMessage('Fire extinguisher record updated');
        return record;
      }
      await fetchRecords();
      return null;
    },
    [fetchRecords]
  );

  return {
    records,
    loading,
    fetchRecords,
    createRecord,
    updateRecord,
    params,
    setParams,
  };
};
