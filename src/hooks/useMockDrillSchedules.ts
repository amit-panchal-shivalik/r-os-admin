import { useCallback, useEffect, useState } from 'react';
import {
  createMockDrillSchedule,
  listMockDrillSchedules,
  updateMockDrillSchedule,
  MockDrillSchedulePayload,
  MockDrillScheduleRecord,
} from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export const useMockDrillSchedules = (initialParams: Record<string, unknown> = {}) => {
  const [records, setRecords] = useState<MockDrillScheduleRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const fetchSchedules = useCallback(
    async (overrideParams?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await listMockDrillSchedules({ ...params, ...overrideParams });
        const payload = response?.result?.records ?? response?.result ?? [];
        setRecords(Array.isArray(payload) ? payload : []);
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to load mock drill schedules', 'error');
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchSchedules().catch(() => undefined);
  }, [fetchSchedules]);

  const createSchedule = useCallback(async (payload: MockDrillSchedulePayload) => {
    const response = await createMockDrillSchedule(payload);
    const record = response?.result;
    if (record) {
      setRecords((prev) => [record, ...prev]);
      showMessage('Mock drill schedule saved');
      return record;
    }
    await fetchSchedules();
    return null;
  }, [fetchSchedules]);

  const updateSchedule = useCallback(
    async (id: string, payload: Partial<MockDrillSchedulePayload>) => {
      const response = await updateMockDrillSchedule(id, payload);
      const record = response?.result;
      if (record) {
        setRecords((prev) => prev.map((item) => (item._id === id ? record : item)));
        showMessage('Mock drill schedule updated');
        return record;
      }
      await fetchSchedules();
      return null;
    },
    [fetchSchedules]
  );

  return {
    records,
    loading,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    params,
    setParams,
  };
};
