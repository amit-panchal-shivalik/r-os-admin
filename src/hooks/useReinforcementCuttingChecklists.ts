import { useCallback, useEffect, useState } from 'react';
import {
  createReinforcementCuttingChecklist,
  listReinforcementCuttingChecklists,
  updateReinforcementCuttingChecklist,
  ReinforcementCuttingChecklistPayload,
} from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export type ReinforcementCuttingChecklistRecord = ReinforcementCuttingChecklistPayload & {
  _id: string;
  site?: {
    id?: string;
    name?: string;
    location?: string;
  };
  items: ReinforcementCuttingChecklistPayload['items'];
  checkedByMachineOperator?: ReinforcementCuttingChecklistPayload['checkedByMachineOperator'];
  checkedBySafetyOfficer?: ReinforcementCuttingChecklistPayload['checkedBySafetyOfficer'];
  projectInCharge?: ReinforcementCuttingChecklistPayload['projectInCharge'];
  createdAt?: string;
  updatedAt?: string;
};

export const useReinforcementCuttingChecklists = (initialParams: Record<string, unknown> = {}) => {
  const [records, setRecords] = useState<ReinforcementCuttingChecklistRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const fetchChecklists = useCallback(
    async (overrideParams?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await listReinforcementCuttingChecklists({ ...params, ...overrideParams });
        const payload = response?.result?.records ?? response?.result ?? [];
        setRecords(Array.isArray(payload) ? payload : []);
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to load reinforcement cutting checklists', 'error');
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchChecklists().catch(() => undefined);
  }, [fetchChecklists]);

  const createChecklist = useCallback(async (payload: ReinforcementCuttingChecklistPayload) => {
    const response = await createReinforcementCuttingChecklist(payload);
    const record = response?.result;
    if (record) {
      setRecords((prev) => [record, ...prev]);
      showMessage('Reinforcement cutting checklist recorded');
      return record;
    }
    await fetchChecklists();
    return null;
  }, [fetchChecklists]);

  const updateChecklist = useCallback(
    async (id: string, payload: Partial<ReinforcementCuttingChecklistPayload>) => {
      const response = await updateReinforcementCuttingChecklist(id, payload);
      const record = response?.result;
      if (record) {
        setRecords((prev) => prev.map((item) => (item._id === id ? record : item)));
        showMessage('Reinforcement cutting checklist updated');
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
