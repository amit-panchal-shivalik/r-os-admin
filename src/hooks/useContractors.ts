import { useCallback, useEffect, useState } from 'react';
import { listContractors, createContractor } from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

export type ContractorOption = {
  _id: string;
  name: string;
  companyName?: string;
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  partyProfileId?: string | null;
};

export const useContractors = () => {
  const [contractors, setContractors] = useState<ContractorOption[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchContractors = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listContractors({ isActive: true });
      const raw = response?.result;
      setContractors(Array.isArray(raw) ? raw : []);
    } catch (error: any) {
      showMessage(error?.message ?? 'Unable to load contractors', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContractors();
  }, [fetchContractors]);

  const createNewContractor = useCallback(
    async (payload: {
      name: string;
      companyName?: string;
      contactPerson?: string;
      contactNumber?: string;
      email?: string;
      address?: string;
    }) => {
      try {
        const response = await createContractor(payload);
        const contractor = response?.result;
        if (contractor) {
          setContractors((prev) => [...prev, contractor]);
        } else {
          await fetchContractors();
        }
        showMessage('Contractor added successfully');
        return contractor;
      } catch (error: any) {
        showMessage(error?.message ?? 'Unable to create contractor', 'error');
        throw error;
      }
    },
    [fetchContractors]
  );

  return {
    contractors,
    loading,
    refresh: fetchContractors,
    createNewContractor,
  };
};
