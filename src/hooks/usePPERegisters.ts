import { useCallback, useEffect, useState } from 'react';
import { createPPERegister, listPPERegisters, updatePPERegister, PPERegisterPayload } from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export type PPERegisterRecord = PPERegisterPayload & {
  _id: string;
  site?: {
    id?: string;
    name?: string;
    location?: string;
  };
  entries: PPERegisterPayload['entries'];
  totals?: Record<string, number>;
  createdAt?: string;
  updatedAt?: string;
};

export const usePPERegisters = (initialParams: Record<string, unknown> = {}) => {
  const [records, setRecords] = useState<PPERegisterRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const fetchRegisters = useCallback(
    async (overrideParams?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await listPPERegisters({ ...params, ...overrideParams });
        const payload = response?.result?.records ?? response?.result ?? [];
        setRecords(Array.isArray(payload) ? payload : []);
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to load PPE registers', 'error');
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchRegisters().catch(() => undefined);
  }, [fetchRegisters]);

  const createRegister = useCallback(async (payload: PPERegisterPayload) => {
    const response = await createPPERegister(payload);
    const record = response?.result;
    if (record) {
      setRecords((prev) => [record, ...prev]);
      showMessage('PPE register created');
      return record;
    }
    await fetchRegisters();
    return null;
  }, [fetchRegisters]);

  const updateRegister = useCallback(
    async (id: string, payload: Partial<PPERegisterPayload>) => {
      const response = await updatePPERegister(id, payload);
      const record = response?.result;
      if (record) {
        setRecords((prev) => prev.map((item) => (item._id === id ? record : item)));
        showMessage('PPE register updated');
        return record;
      }
      await fetchRegisters();
      return null;
    },
    [fetchRegisters]
  );

  return {
    records,
    loading,
    fetchRegisters,
    createRegister,
    updateRegister,
    params,
    setParams,
  };
};
