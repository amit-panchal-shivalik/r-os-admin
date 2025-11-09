import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChecklistSignaturePayload,
  JcbChecklistPayload,
  createJcbChecklist,
  listJcbChecklists,
  updateJcbChecklist,
} from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export type JcbChecklistRecord = JcbChecklistPayload & {
  _id: string;
  site?: {
    id?: string;
    name?: string;
    location?: string;
  };
  createdBy?: {
    id?: string;
    name?: string;
  };
  inspectedBy?: ChecklistSignaturePayload;
  reviewedBy?: ChecklistSignaturePayload;
  projectInCharge?: ChecklistSignaturePayload;
  createdAt?: string;
  updatedAt?: string;
};

export const useJcbChecklists = (initialParams: Record<string, unknown> = {}) => {
  const [records, setRecords] = useState<JcbChecklistRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const fetchChecklists = useCallback(
    async (overrideParams?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await listJcbChecklists({ ...params, ...overrideParams });
        const payload = response?.result?.records ?? response?.result ?? [];
        setRecords(Array.isArray(payload) ? payload : []);
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to load JCB checklists', 'error');
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchChecklists().catch(() => undefined);
  }, [fetchChecklists]);

  const createChecklist = useCallback(
    async (payload: JcbChecklistPayload) => {
      try {
        const response = await createJcbChecklist(payload);
        const record = response?.result;
        if (record) {
          setRecords((prev) => [record, ...prev]);
          showMessage('JCB checklist recorded');
          return record;
        }
        await fetchChecklists();
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to save JCB checklist', 'error');
        throw error;
      }
      return null;
    },
    [fetchChecklists]
  );

  const updateChecklist = useCallback(
    async (id: string, payload: Partial<JcbChecklistPayload>) => {
      try {
        const response = await updateJcbChecklist(id, payload);
        const updated = response?.result;
        if (updated) {
          setRecords((prev) => prev.map((item) => (item._id === id ? updated : item)));
          showMessage('JCB checklist updated');
          return updated;
        }
        await fetchChecklists();
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to update JCB checklist', 'error');
        throw error;
      }
      return null;
    },
    [fetchChecklists]
  );

  const statusSummary = useMemo(() => {
    const summary: Record<'YES' | 'NO' | 'NA', number> = { YES: 0, NO: 0, NA: 0 };
    records.forEach((record) => {
      const status = (record.equipmentFitForUse as 'YES' | 'NO' | 'NA') || 'YES';
      if (summary[status] !== undefined) {
        summary[status] += 1;
      }
    });
    return summary;
  }, [records]);

  return {
    records,
    loading,
    fetchChecklists,
    createChecklist,
    updateChecklist,
    setParams,
    params,
    statusSummary,
  };
};

