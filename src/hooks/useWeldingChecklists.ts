import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createWeldingChecklist,
  listWeldingChecklists,
  updateWeldingChecklist,
  WeldingChecklistPayload,
} from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export type WeldingChecklistRecord = WeldingChecklistPayload & {
  _id: string;
  site?: {
    id?: string;
    name?: string;
    location?: string;
  };
  items: Array<WeldingChecklistPayload['items'][number]>;
  inspectedBySafety?: WeldingChecklistPayload['inspectedBySafety'];
  areaEngineer?: WeldingChecklistPayload['areaEngineer'];
  projectInCharge?: WeldingChecklistPayload['projectInCharge'];
  createdAt?: string;
  updatedAt?: string;
};

export const useWeldingChecklists = (initialParams: Record<string, unknown> = {}) => {
  const [records, setRecords] = useState<WeldingChecklistRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const fetchChecklists = useCallback(
    async (overrideParams?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await listWeldingChecklists({ ...params, ...overrideParams });
        const payload = response?.result?.records ?? response?.result ?? [];
        setRecords(Array.isArray(payload) ? payload : []);
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to load welding checklists', 'error');
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
    async (payload: WeldingChecklistPayload) => {
      const response = await createWeldingChecklist(payload);
      const record = response?.result;
      if (record) {
        setRecords((prev) => [record, ...prev]);
        showMessage('Welding checklist recorded');
        return record;
      }
      await fetchChecklists();
      return null;
    },
    [fetchChecklists]
  );

  const updateChecklist = useCallback(
    async (id: string, payload: Partial<WeldingChecklistPayload>) => {
      const response = await updateWeldingChecklist(id, payload);
      const updated = response?.result;
      if (updated) {
        setRecords((prev) => prev.map((item) => (item._id === id ? updated : item)));
        showMessage('Welding checklist updated');
        return updated;
      }
      await fetchChecklists();
      return null;
    },
    [fetchChecklists]
  );

  const machineOptions = useMemo(
    () =>
      records.map((record) => ({
        value: record._id,
        label: record.equipmentNumber,
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
    machineOptions,
  };
};
