import { useCallback, useEffect, useState } from 'react';
import {
  createFirstAidChecklist,
  listFirstAidChecklists,
  updateFirstAidChecklist,
  FirstAidChecklistPayload,
  FirstAidChecklistRecord,
} from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export const useFirstAidChecklists = (initialParams: Record<string, unknown> = {}) => {
  const [records, setRecords] = useState<FirstAidChecklistRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const fetchChecklists = useCallback(
    async (overrideParams?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await listFirstAidChecklists({ ...params, ...overrideParams });
        const payload = response?.result?.records ?? response?.result ?? [];
        setRecords(Array.isArray(payload) ? payload : []);
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to load first aid checklists', 'error');
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchChecklists().catch(() => undefined);
  }, [fetchChecklists]);

  const createChecklist = useCallback(async (payload: FirstAidChecklistPayload) => {
    const response = await createFirstAidChecklist(payload);
    const record = response?.result;
    if (record) {
      setRecords((prev) => [record, ...prev]);
      showMessage('First aid checklist saved');
      return record;
    }
    await fetchChecklists();
    return null;
  }, [fetchChecklists]);

  const updateChecklist = useCallback(
    async (id: string, payload: Partial<FirstAidChecklistPayload>) => {
      const response = await updateFirstAidChecklist(id, payload);
      const record = response?.result;
      if (record) {
        setRecords((prev) => prev.map((item) => (item._id === id ? record : item)));
        showMessage('First aid checklist updated');
        return record;
      }
      await fetchChecklists();
      return null;
    },
    [fetchChecklists]
  );

  return {
    records,
    loading,
    fetchChecklists,
    createChecklist,
    updateChecklist,
    params,
    setParams,
  };
};
