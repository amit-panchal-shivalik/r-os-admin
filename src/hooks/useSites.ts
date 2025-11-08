import { useCallback, useEffect, useState } from 'react';
import { listSites, createSite } from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export type SiteOption = {
  _id: string;
  name: string;
  location?: string;
  companyName?: string;
  code?: string;
};

export const useSites = () => {
  const [sites, setSites] = useState<SiteOption[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSites = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listSites({ isActive: true });
      const raw = response?.result;
      const normalized = Array.isArray(raw) ? raw : [];
      setSites(normalized);
    } catch (error: any) {
      showMessage(error?.message ?? 'Unable to load sites', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  const createNewSite = useCallback(
    async (payload: { name: string; location?: string; companyName?: string }) => {
      try {
        const response = await createSite(payload);
        const site = response?.result;
        if (site) {
          setSites((prev) => [...prev, site]);
        } else {
          await fetchSites();
        }
        showMessage('Site added successfully');
        return site;
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to create site', 'error');
        throw error;
      }
    },
    []
  );

  return {
    sites,
    loading,
    refresh: fetchSites,
    createNewSite,
  };
};
