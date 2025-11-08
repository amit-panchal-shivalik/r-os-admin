import { useCallback, useEffect, useMemo, useState } from 'react';
import { createEquipment, listEquipments, EquipmentPayload } from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export type EquipmentRecord = EquipmentPayload & {
  _id?: string;
  site?: {
    id?: string;
    name?: string;
    location?: string;
    companyName?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export const useEquipments = (initialParams: Record<string, unknown> = {}) => {
  const [equipments, setEquipments] = useState<EquipmentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const fetchEquipments = useCallback(
    async (overrideParams?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await listEquipments({ ...params, ...overrideParams });
        const records = response?.result?.records ?? response?.result ?? [];
        setEquipments(Array.isArray(records) ? records : []);
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to load equipment records', 'error');
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchEquipments().catch(() => undefined);
  }, [fetchEquipments]);

  const createNewEquipment = useCallback(
    async (payload: EquipmentPayload) => {
      try {
        const response = await createEquipment(payload);
        const record = response?.result;
        if (record) {
          setEquipments((prev) => [record, ...prev]);
        } else {
          await fetchEquipments();
        }
        showMessage('Equipment added successfully');
        return record;
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to add equipment', 'error');
        throw error;
      }
    },
    [fetchEquipments]
  );

  const equipmentOptions = useMemo(
    () =>
      equipments.map((equipment) => ({
        value: equipment._id ?? equipment.equipmentId,
        label: equipment.name,
        description: [equipment.equipmentId, equipment.location].filter(Boolean).join(' • '),
      })),
    [equipments]
  );

  return {
    equipments,
    loading,
    fetchEquipments,
    createNewEquipment,
    setParams,
    params,
    equipmentOptions,
  };
};
