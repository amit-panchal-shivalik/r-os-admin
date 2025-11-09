import { useCallback, useEffect, useState } from 'react';
import {
  createAccidentInvestigationReport,
  listAccidentInvestigationReports,
  updateAccidentInvestigationReport,
  AccidentInvestigationReportPayload,
} from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export type AccidentInvestigationReportRecord = AccidentInvestigationReportPayload & {
  _id: string;
  site?: {
    id?: string;
    name?: string;
    location?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export const useAccidentInvestigationReports = (initialParams: Record<string, unknown> = {}) => {
  const [records, setRecords] = useState<AccidentInvestigationReportRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const fetchReports = useCallback(
    async (overrideParams?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await listAccidentInvestigationReports({ ...params, ...overrideParams });
        const payload = response?.result?.records ?? response?.result ?? [];
        setRecords(Array.isArray(payload) ? payload : []);
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to load accident investigation reports', 'error');
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchReports().catch(() => undefined);
  }, [fetchReports]);

  const createReport = useCallback(async (payload: AccidentInvestigationReportPayload) => {
    const response = await createAccidentInvestigationReport(payload);
    const record = response?.result;
    if (record) {
      setRecords((prev) => [record, ...prev]);
      showMessage('Accident investigation report saved');
      return record;
    }
    await fetchReports();
    return null;
  }, [fetchReports]);

  const updateReport = useCallback(
    async (id: string, payload: Partial<AccidentInvestigationReportPayload>) => {
      const response = await updateAccidentInvestigationReport(id, payload);
      const record = response?.result;
      if (record) {
        setRecords((prev) => prev.map((item) => (item._id === id ? record : item)));
        showMessage('Accident investigation report updated');
        return record;
      }
      await fetchReports();
      return null;
    },
    [fetchReports]
  );

  return {
    records,
    loading,
    fetchReports,
    createReport,
    updateReport,
    params,
    setParams,
  };
};

