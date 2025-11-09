import { useCallback, useEffect, useState } from 'react';
import {
  createEhsCommitteeMom,
  listEhsCommitteeMoms,
  updateEhsCommitteeMom,
  EhsCommitteeMomPayload,
  EhsCommitteeMomRecord,
} from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export const useEhsCommitteeMoms = (initialParams: Record<string, unknown> = {}) => {
  const [records, setRecords] = useState<EhsCommitteeMomRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const fetchMoms = useCallback(
    async (overrideParams?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await listEhsCommitteeMoms({ ...params, ...overrideParams });
        const payload = response?.result?.records ?? response?.result ?? [];
        setRecords(Array.isArray(payload) ? payload : []);
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to load committee minutes', 'error');
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchMoms().catch(() => undefined);
  }, [fetchMoms]);

  const createMom = useCallback(async (payload: EhsCommitteeMomPayload) => {
    const response = await createEhsCommitteeMom(payload);
    const record = response?.result;
    if (record) {
      setRecords((prev) => [record, ...prev]);
      showMessage('Minutes saved');
      return record;
    }
    await fetchMoms();
    return null;
  }, [fetchMoms]);

  const updateMom = useCallback(
    async (id: string, payload: Partial<EhsCommitteeMomPayload>) => {
      const response = await updateEhsCommitteeMom(id, payload);
      const record = response?.result;
      if (record) {
        setRecords((prev) => prev.map((item) => (item._id === id ? record : item)));
        showMessage('Minutes updated');
        return record;
      }
      await fetchMoms();
      return null;
    },
    [fetchMoms]
  );

  return {
    records,
    loading,
    params,
    setParams,
    fetchMoms,
    createMom,
    updateMom,
  };
};
