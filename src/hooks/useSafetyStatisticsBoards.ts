import { useCallback, useEffect, useState } from 'react';
import {
  createSafetyStatisticsBoard,
  listSafetyStatisticsBoards,
  updateSafetyStatisticsBoard,
  SafetyStatisticsBoardPayload,
} from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export type SafetyStatisticsBoardRecord = SafetyStatisticsBoardPayload & {
  _id: string;
  site?: {
    id?: string;
    name?: string;
    location?: string;
  };
  metrics: SafetyStatisticsBoardPayload['metrics'];
  createdAt?: string;
  updatedAt?: string;
};

export const useSafetyStatisticsBoards = (initialParams: Record<string, unknown> = {}) => {
  const [records, setRecords] = useState<SafetyStatisticsBoardRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const fetchBoards = useCallback(
    async (overrideParams?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await listSafetyStatisticsBoards({ ...params, ...overrideParams });
        const payload = response?.result?.records ?? response?.result ?? [];
        setRecords(Array.isArray(payload) ? payload : []);
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to load safety statistics boards', 'error');
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchBoards().catch(() => undefined);
  }, [fetchBoards]);

  const createBoard = useCallback(async (payload: SafetyStatisticsBoardPayload) => {
    const response = await createSafetyStatisticsBoard(payload);
    const record = response?.result;
    if (record) {
      setRecords((prev) => [record, ...prev]);
      showMessage('Safety statistics board saved');
      return record;
    }
    await fetchBoards();
    return null;
  }, [fetchBoards]);

  const updateBoard = useCallback(
    async (id: string, payload: Partial<SafetyStatisticsBoardPayload>) => {
      const response = await updateSafetyStatisticsBoard(id, payload);
      const record = response?.result;
      if (record) {
        setRecords((prev) => prev.map((item) => (item._id === id ? record : item)));
        showMessage('Safety statistics board updated');
        return record;
      }
      await fetchBoards();
      return null;
    },
    [fetchBoards]
  );

  return {
    records,
    loading,
    fetchBoards,
    createBoard,
    updateBoard,
    params,
    setParams,
  };
};