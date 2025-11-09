import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createFirstAidCase,
  listFirstAidCases,
  updateFirstAidCase,
  FirstAidPayload,
} from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export type FirstAidCaseRecord = FirstAidPayload & {
  _id: string;
  site?: {
    id?: string;
    name?: string;
    location?: string;
    companyName?: string;
  };
  contractor?: {
    id?: string;
    name?: string;
  };
  siteName?: string;
  contractorName?: string;
  month: string;
  incidentDate: string;
  createdAt?: string;
  updatedAt?: string;
};

export const useFirstAidCases = (initialParams: Record<string, unknown> = {}) => {
  const [records, setRecords] = useState<FirstAidCaseRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const fetchCases = useCallback(
    async (overrideParams?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await listFirstAidCases({ ...params, ...overrideParams });
        const payload = response?.result?.records ?? response?.result ?? [];
        setRecords(Array.isArray(payload) ? payload : []);
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to load first aid records', 'error');
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchCases().catch(() => undefined);
  }, [fetchCases]);

  const createCase = useCallback(
    async (payload: FirstAidPayload) => {
      const response = await createFirstAidCase(payload);
      const record = response?.result;
      if (record) {
        setRecords((prev) => [record, ...prev]);
        showMessage('First aid record added successfully');
        return record;
      }
      await fetchCases();
      return null;
    },
    [fetchCases]
  );

  const updateCase = useCallback(
    async (id: string, payload: Partial<FirstAidPayload>) => {
      const response = await updateFirstAidCase(id, payload);
      const updated = response?.result;
      if (updated) {
        setRecords((prev) => prev.map((item) => (item._id === id ? updated : item)));
        showMessage('First aid record updated');
        return updated;
      }
      await fetchCases();
      return null;
    },
    [fetchCases]
  );

  const options = useMemo(
    () =>
      records.map((record) => ({
        value: record._id,
        label: `${record.injuredPerson} - ${record.treatmentProvided}`,
        description: new Date(record.incidentDate).toLocaleDateString(),
      })),
    [records]
  );

  return {
    records,
    loading,
    fetchCases,
    createCase,
    updateCase,
    setParams,
    params,
    options,
  };
};
