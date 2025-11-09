import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createReinforcementBendingChecklist,
  listReinforcementBendingChecklists,
  updateReinforcementBendingChecklist,
  ReinforcementBendingChecklistPayload,
  ReinforcementBendingItemPayload,
} from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export type ReinforcementBendingChecklistRecord = ReinforcementBendingChecklistPayload & {
  _id: string;
  site?: {
    id?: string;
    name?: string;
    location?: string;
  };
  items: ReinforcementBendingItemPayload[];
  checkedByOperator?: ReinforcementBendingChecklistPayload['checkedByOperator'];
  checkedBySafetyOfficer?: ReinforcementBendingChecklistPayload['checkedBySafetyOfficer'];
  projectInCharge?: ReinforcementBendingChecklistPayload['projectInCharge'];
  createdAt?: string;
  updatedAt?: string;
};

export const useReinforcementBendingChecklists = (initialParams: Record<string, unknown> = {}) => {
  const [records, setRecords] = useState<ReinforcementBendingChecklistRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const fetchChecklists = useCallback(
    async (overrideParams?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await listReinforcementBendingChecklists({ ...params, ...overrideParams });
        const payload = response?.result?.records ?? response?.result ?? [];
        setRecords(Array.isArray(payload) ? payload : []);
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to load reinforcement bending checklists', 'error');
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
    async (payload: ReinforcementBendingChecklistPayload) => {
      const response = await createReinforcementBendingChecklist(payload);
      const record = response?.result;
      if (record) {
        setRecords((prev) => [record, ...prev]);
        showMessage('Reinforcement bending checklist recorded');
        return record;
      }
      await fetchChecklists();
      return null;
    },
    [fetchChecklists]
  );

  const updateChecklist = useCallback(
    async (id: string, payload: Partial<ReinforcementBendingChecklistPayload>) => {
      const response = await updateReinforcementBendingChecklist(id, payload);
      const updated = response?.result;
      if (updated) {
        setRecords((prev) => prev.map((item) => (item._id === id ? updated : item)));
        showMessage('Reinforcement bending checklist updated');
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
        label: record.equipmentId,
        description: record.monthlyStartFrom
          ? new Date(record.monthlyStartFrom).toLocaleDateString()
          : undefined,
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

