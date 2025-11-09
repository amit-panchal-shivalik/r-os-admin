import { useCallback, useEffect, useState } from 'react';
import {
  createSafetyViolationDebitNote,
  listSafetyViolationDebitNotes,
  updateSafetyViolationDebitNote,
  SafetyViolationDebitNotePayload,
} from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export type SafetyViolationDebitNoteRecord = SafetyViolationDebitNotePayload & {
  _id: string;
  siteSnapshot?: {
    id?: string;
    name?: string;
    location?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export const useSafetyViolationDebitNotes = (initialParams: Record<string, unknown> = {}) => {
  const [records, setRecords] = useState<SafetyViolationDebitNoteRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const fetchDebitNotes = useCallback(
    async (overrideParams?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await listSafetyViolationDebitNotes({ ...params, ...overrideParams });
        const payload = response?.result?.records ?? response?.result ?? [];
        setRecords(Array.isArray(payload) ? payload : []);
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to load debit notes', 'error');
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchDebitNotes().catch(() => undefined);
  }, [fetchDebitNotes]);

  const createDebitNote = useCallback(async (payload: SafetyViolationDebitNotePayload) => {
    const response = await createSafetyViolationDebitNote(payload);
    const record = response?.result;
    if (record) {
      setRecords((prev) => [record, ...prev]);
      showMessage('Debit note created');
      return record;
    }
    await fetchDebitNotes();
    return null;
  }, [fetchDebitNotes]);

  const updateDebitNote = useCallback(
    async (id: string, payload: Partial<SafetyViolationDebitNotePayload>) => {
      const response = await updateSafetyViolationDebitNote(id, payload);
      const record = response?.result;
      if (record) {
        setRecords((prev) => prev.map((item) => (item._id === id ? record : item)));
        showMessage('Debit note updated');
        return record;
      }
      await fetchDebitNotes();
      return null;
    },
    [fetchDebitNotes]
  );

  return {
    records,
    loading,
    fetchDebitNotes,
    createDebitNote,
    updateDebitNote,
    params,
    setParams,
  };
};
