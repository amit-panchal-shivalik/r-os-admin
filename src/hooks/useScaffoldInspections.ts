import { useCallback, useEffect, useState } from 'react';
import {
  createScaffoldInspectionChecklist,
  listScaffoldInspectionChecklists,
  updateScaffoldInspectionChecklist,
  ScaffoldInspectionChecklistPayload,
  ScaffoldInspectionChecklistRecord,
} from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export const useScaffoldInspections = (initialParams: Record<string, unknown> = {}) => {
  const [records, setRecords] = useState<ScaffoldInspectionChecklistRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const fetchInspections = useCallback(
    async (overrideParams?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await listScaffoldInspectionChecklists({ ...params, ...overrideParams });
        const payload = response?.result?.records ?? response?.result ?? [];
        setRecords(Array.isArray(payload) ? payload : []);
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to load scaffold inspections', 'error');
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchInspections().catch(() => undefined);
  }, [fetchInspections]);

  const createInspection = useCallback(async (payload: ScaffoldInspectionChecklistPayload) => {
    const response = await createScaffoldInspectionChecklist(payload);
    const record = response?.result;
    if (record) {
      setRecords((prev) => [record, ...prev]);
      showMessage('Scaffold inspection saved');
      return record;
    }
    await fetchInspections();
    return null;
  }, [fetchInspections]);

  const updateInspection = useCallback(
    async (id: string, payload: Partial<ScaffoldInspectionChecklistPayload>) => {
      const response = await updateScaffoldInspectionChecklist(id, payload);
      const record = response?.result;
      if (record) {
        setRecords((prev) => prev.map((item) => (item._id === id ? record : item)));
        showMessage('Scaffold inspection updated');
        return record;
      }
      await fetchInspections();
      return null;
    },
    [fetchInspections]
  );

  return {
    records,
    loading,
    params,
    setParams,
    fetchInspections,
    createInspection,
    updateInspection,
  };
};

