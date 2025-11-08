import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createExcavatorChecklist,
  listExcavatorChecklists,
  updateExcavatorChecklist,
  ExcavatorChecklistPayload,
} from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export type ExcavatorChecklistRecord = ExcavatorChecklistPayload & {
  _id: string;
  site?: {
    id?: string;
    name?: string;
    location?: string;
  };
  items: Array<ExcavatorChecklistPayload['items'][number]>;
  checkedBySiteEngineer?: ExcavatorChecklistPayload['checkedBySiteEngineer'];
  checkedBySafetyOfficer?: ExcavatorChecklistPayload['checkedBySafetyOfficer'];
  createdAt?: string;
  updatedAt?: string;
};

export const useExcavatorChecklists = (initialParams: Record<string, unknown> = {}) => {
  const [records, setRecords] = useState<ExcavatorChecklistRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const fetchChecklists = useCallback(
    async (overrideParams?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await listExcavatorChecklists({ ...params, ...overrideParams });
        const payload = response?.result?.records ?? response?.result ?? [];
        setRecords(Array.isArray(payload) ? payload : []);
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to load checklists', 'error');
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
    async (payload: ExcavatorChecklistPayload) => {
      const response = await createExcavatorChecklist(payload);
      const record = response?.result;
      if (record) {
        setRecords((prev) => [record, ...prev]);
        showMessage('Excavator checklist recorded');
        return record;
      }
      await fetchChecklists();
      return null;
    },
    [fetchChecklists]
  );

  const updateChecklist = useCallback(
    async (id: string, payload: Partial<ExcavatorChecklistPayload>) => {
      const response = await updateExcavatorChecklist(id, payload);
      const updated = response?.result;
      if (updated) {
        setRecords((prev) => prev.map((item) => (item._id === id ? updated : item)));
        showMessage('Excavator checklist updated');
        return updated;
      }
      await fetchChecklists();
      return null;
    },
    [fetchChecklists]
  );

  const equipmentOptions = useMemo(
    () =>
      records.map((record) => ({
        value: record._id,
        label: record.equipmentId,
        description: new Date(record.inspectionDate).toLocaleDateString(),
      })),
    [records]
  );

  return {
    records,
    loading,
    fetchChecklists,
    createChecklist,
    updateChecklist,
    setParams,
    params,
    equipmentOptions,
  };
};
