import { useCallback, useEffect, useState } from 'react';
import {
  createPortableEquipmentInspection,
  listPortableEquipmentInspections,
  updatePortableEquipmentInspection,
  PortableEquipmentInspectionPayload,
} from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export type PortableEquipmentInspectionRecord = PortableEquipmentInspectionPayload & {
  _id: string;
  site?: {
    id?: string;
    name?: string;
    location?: string;
  };
  checkpointsNote?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const usePortableEquipmentInspections = (initialParams: Record<string, unknown> = {}) => {
  const [records, setRecords] = useState<PortableEquipmentInspectionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const fetchInspections = useCallback(
    async (overrideParams?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await listPortableEquipmentInspections({ ...params, ...overrideParams });
        const payload = response?.result?.records ?? response?.result ?? [];
        setRecords(Array.isArray(payload) ? payload : []);
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to load portable equipment inspections', 'error');
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchInspections().catch(() => undefined);
  }, [fetchInspections]);

  const createInspection = useCallback(async (payload: PortableEquipmentInspectionPayload) => {
    const response = await createPortableEquipmentInspection(payload);
    const record = response?.result;
    if (record) {
      setRecords((prev) => [record, ...prev]);
      showMessage('Inspection saved');
      return record;
    }
    await fetchInspections();
    return null;
  }, [fetchInspections]);

  const updateInspection = useCallback(
    async (id: string, payload: Partial<PortableEquipmentInspectionPayload>) => {
      const response = await updatePortableEquipmentInspection(id, payload);
      const record = response?.result;
      if (record) {
        setRecords((prev) => prev.map((item) => (item._id === id ? record : item)));
        showMessage('Inspection updated');
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
    fetchInspections,
    createInspection,
    updateInspection,
    params,
    setParams,
  };
};
