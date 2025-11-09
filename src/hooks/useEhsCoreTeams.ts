import { useCallback, useEffect, useState } from 'react';
import {
  createEhsCoreTeam,
  listEhsCoreTeams,
  updateEhsCoreTeam,
  EhsCoreTeamPayload,
  EhsCoreTeamRecord,
} from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export const useEhsCoreTeams = (initialParams: Record<string, unknown> = {}) => {
  const [records, setRecords] = useState<EhsCoreTeamRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const fetchTeams = useCallback(
    async (overrideParams?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await listEhsCoreTeams({ ...params, ...overrideParams });
        const payload = response?.result?.records ?? response?.result ?? [];
        setRecords(Array.isArray(payload) ? payload : []);
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to load EHS core team structures', 'error');
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchTeams().catch(() => undefined);
  }, [fetchTeams]);

  const createTeam = useCallback(async (payload: EhsCoreTeamPayload) => {
    const response = await createEhsCoreTeam(payload);
    const record = response?.result;
    if (record) {
      setRecords((prev) => [record, ...prev]);
      showMessage('EHS core team saved');
      return record;
    }
    await fetchTeams();
    return null;
  }, [fetchTeams]);

  const updateTeam = useCallback(
    async (id: string, payload: Partial<EhsCoreTeamPayload>) => {
      const response = await updateEhsCoreTeam(id, payload);
      const record = response?.result;
      if (record) {
        setRecords((prev) => prev.map((item) => (item._id === id ? record : item)));
        showMessage('EHS core team updated');
        return record;
      }
      await fetchTeams();
      return null;
    },
    [fetchTeams]
  );

  return {
    records,
    loading,
    params,
    setParams,
    fetchTeams,
    createTeam,
    updateTeam,
  };
};
