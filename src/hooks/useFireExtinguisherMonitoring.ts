import { useCallback, useEffect, useState } from 'react';
import {
  createFireExtinguisherMonitoring,
  listFireExtinguisherMonitoring,
  updateFireExtinguisherMonitoring,
  FireExtinguisherMonitoringPayload,
} from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export type FireExtinguisherMonitoringRecord = FireExtinguisherMonitoringPayload & {
  _id: string;
  siteSnapshot?: {
    id?: string;
    name?: string;
    location?: string;
  };
  projectIncharge?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const useFireExtinguisherMonitoring = (initialParams: Record<string, unknown> = {}) => {
  const [records, setRecords] = useState<FireExtinguisherMonitoringRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const fetchSheets = useCallback(
    async (overrideParams?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await listFireExtinguisherMonitoring({ ...params, ...overrideParams });
        const payload = response?.result?.records ?? response?.result ?? [];
        setRecords(Array.isArray(payload) ? payload : []);
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to load fire extinguisher monitoring records', 'error');
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchSheets().catch(() => undefined);
  }, [fetchSheets]);

  const createSheet = useCallback(async (payload: FireExtinguisherMonitoringPayload) => {
    const response = await createFireExtinguisherMonitoring(payload);
    const record = response?.result;
    if (record) {
      setRecords((prev) => [record, ...prev]);
      showMessage('Monitoring sheet saved');
      return record;
    }
    await fetchSheets();
    return null;
  }, [fetchSheets]);

  const updateSheet = useCallback(
    async (id: string, payload: Partial<FireExtinguisherMonitoringPayload>) => {
      const response = await updateFireExtinguisherMonitoring(id, payload);
      const record = response?.result;
      if (record) {
        setRecords((prev) => prev.map((item) => (item._id === id ? record : item)));
        showMessage('Monitoring sheet updated');
        return record;
      }
      await fetchSheets();
      return null;
    },
    [fetchSheets]
  );

  return {
    records,
    loading,
    fetchSheets,
    createSheet,
    updateSheet,
    params,
    setParams,
  };
};
