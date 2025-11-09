import { useCallback, useEffect, useState } from 'react';
import {
  createTruckInspection,
  listTruckInspections,
  updateTruckInspection,
  TruckInspectionPayload,
} from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export type TruckInspectionRecord = TruckInspectionPayload & {
  _id: string;
  site?: {
    id?: string;
    name?: string;
    location?: string;
  };
  checkpoints: TruckInspectionPayload['checkpoints'];
  driverSignature?: TruckInspectionPayload['driverSignature'];
  safetyOfficerSignature?: TruckInspectionPayload['safetyOfficerSignature'];
  projectInChargeSignature?: TruckInspectionPayload['projectInChargeSignature'];
  createdAt?: string;
  updatedAt?: string;
};

export const useTruckInspections = (initialParams: Record<string, unknown> = {}) => {
  const [records, setRecords] = useState<TruckInspectionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const fetchInspections = useCallback(
    async (overrideParams?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await listTruckInspections({ ...params, ...overrideParams });
        const payload = response?.result?.records ?? response?.result ?? [];
        setRecords(Array.isArray(payload) ? payload : []);
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to load truck inspections', 'error');
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchInspections().catch(() => undefined);
  }, [fetchInspections]);

  const createInspection = useCallback(async (payload: TruckInspectionPayload) => {
    const response = await createTruckInspection(payload);
    const record = response?.result;
    if (record) {
      setRecords((prev) => [record, ...prev]);
      showMessage('Truck inspection saved');
      return record;
    }
    await fetchInspections();
    return null;
  }, [fetchInspections]);

  const updateInspection = useCallback(
    async (id: string, payload: Partial<TruckInspectionPayload>) => {
      const response = await updateTruckInspection(id, payload);
      const record = response?.result;
      if (record) {
        setRecords((prev) => prev.map((item) => (item._id === id ? record : item)));
        showMessage('Truck inspection updated');
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
