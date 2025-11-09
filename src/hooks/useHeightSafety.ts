import { useCallback, useEffect, useState } from 'react';
import {
  createHeightSafety,
  listHeightSafety,
  updateHeightSafety,
  HeightSafetyPayload,
  HeightSafetyRecord,
} from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export const useHeightSafety = (initialParams: Record<string, unknown> = {}) => {
  const [records, setRecords] = useState<HeightSafetyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const fetchAssessments = useCallback(
    async (overrideParams?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await listHeightSafety({ ...params, ...overrideParams });
        const payload = response?.result?.records ?? response?.result ?? [];
        setRecords(Array.isArray(payload) ? payload : []);
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to load height safety assessments', 'error');
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchAssessments().catch(() => undefined);
  }, [fetchAssessments]);

  const createAssessment = useCallback(async (payload: HeightSafetyPayload) => {
    const response = await createHeightSafety(payload);
    const record = response?.result;
    if (record) {
      setRecords((prev) => [record, ...prev]);
      showMessage('Height safety assessment saved');
      return record;
    }
    await fetchAssessments();
    return null;
  }, [fetchAssessments]);

  const updateAssessment = useCallback(
    async (id: string, payload: Partial<HeightSafetyPayload>) => {
      const response = await updateHeightSafety(id, payload);
      const record = response?.result;
      if (record) {
        setRecords((prev) => prev.map((item) => (item._id === id ? record : item)));
        showMessage('Height safety assessment updated');
        return record;
      }
      await fetchAssessments();
      return null;
    },
    [fetchAssessments]
  );

  return {
    records,
    loading,
    params,
    setParams,
    fetchAssessments,
    createAssessment,
    updateAssessment,
  };
};
