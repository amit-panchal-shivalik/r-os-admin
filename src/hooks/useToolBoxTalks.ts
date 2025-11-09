import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createToolBoxTalk,
  listToolBoxTalks,
  updateToolBoxTalk,
  ToolBoxTalkPayload,
} from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export type ToolBoxTalkRecord = ToolBoxTalkPayload & {
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
  talkDate: string;
  createdAt?: string;
  updatedAt?: string;
};

export const useToolBoxTalks = (initialParams: Record<string, unknown> = {}) => {
  const [records, setRecords] = useState<ToolBoxTalkRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const fetchTalks = useCallback(
    async (overrideParams?: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await listToolBoxTalks({ ...params, ...overrideParams });
        const payload = response?.result?.records ?? response?.result ?? [];
        setRecords(Array.isArray(payload) ? payload : []);
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to load toolbox talks', 'error');
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetchTalks().catch(() => undefined);
  }, [fetchTalks]);

  const createTalk = useCallback(
    async (payload: ToolBoxTalkPayload) => {
      const response = await createToolBoxTalk(payload);
      const record = response?.result;
      if (record) {
        setRecords((prev) => [record, ...prev]);
        showMessage('Tool box talk recorded');
        return record;
      }
      await fetchTalks();
      return null;
    },
    [fetchTalks]
  );

  const updateTalk = useCallback(
    async (id: string, payload: Partial<ToolBoxTalkPayload>) => {
      const response = await updateToolBoxTalk(id, payload);
      const updated = response?.result;
      if (updated) {
        setRecords((prev) => prev.map((item) => (item._id === id ? updated : item)));
        showMessage('Tool box talk updated');
        return updated;
      }
      await fetchTalks();
      return null;
    },
    [fetchTalks]
  );

  const options = useMemo(
    () =>
      records.map((record) => ({
        value: record._id,
        label: record.discussionPoint,
        description: new Date(record.talkDate).toLocaleDateString(),
      })),
    [records]
  );

  return {
    records,
    loading,
    fetchTalks,
    createTalk,
    updateTalk,
    setParams,
    params,
    options,
  };
};
