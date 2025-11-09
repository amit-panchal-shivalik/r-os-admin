import { useCallback, useEffect, useState } from 'react';
import {
  createDailyObservation,
  listDailyObservations,
  updateDailyObservation,
  DailyObservationPayload,
} from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export type DailyObservationRecord = DailyObservationPayload & {
  _id: string;
  site?: {
    id?: string;
    name?: string;
    location?: string;
  };
  projectManagerSign?: DailyObservationPayload['projectManagerSign'];
  observations: DailyObservationPayload['observations'];
  createdAt?: string;
  updatedAt?: string;
};

export const useDailyObservations = (initialParams: Record<string, unknown> = {}) => {
  const [records, setRecords] = useState<DailyObservationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const fetchObservations = useCallback(
    async (overrideParams?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await listDailyObservations({ ...params, ...overrideParams });
        const payload = response?.result?.records ?? response?.result ?? [];
        setRecords(Array.isArray(payload) ? payload : []);
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to load daily observations', 'error');
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchObservations().catch(() => undefined);
  }, [fetchObservations]);

  const createObservation = useCallback(async (payload: DailyObservationPayload) => {
    const response = await createDailyObservation(payload);
    const record = response?.result;
    if (record) {
      setRecords((prev) => [record, ...prev]);
      showMessage('Observation sheet recorded');
      return record;
    }
    await fetchObservations();
    return null;
  }, [fetchObservations]);

  const updateObservation = useCallback(
    async (id: string, payload: Partial<DailyObservationPayload>) => {
      const response = await updateDailyObservation(id, payload);
      const record = response?.result;
      if (record) {
        setRecords((prev) => prev.map((item) => (item._id === id ? record : item)));
        showMessage('Observation sheet updated');
        return record;
      }
      await fetchObservations();
      return null;
    },
    [fetchObservations]
  );

  return {
    records,
    loading,
    fetchObservations,
    createObservation,
    updateObservation,
    params,
    setParams,
  };
};
