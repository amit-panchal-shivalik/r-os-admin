import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SocietySetupForm } from './SocietySetupForm';
import { getSocietyById } from '../../apis/societyApi';
import { Card } from '../../components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const EditSociety: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [societyData, setSocietyData] = useState<any>(null);

  useEffect(() => {
    const fetchSociety = async () => {
      if (!id) {
        console.error('❌ Society ID is missing');
        toast.error('Society ID is required');
        navigate('/societies');
        return;
      }

      console.log('🔍 Fetching society with ID:', id);

      try {
        setLoading(true);
        const data = await getSocietyById(id);
        console.log('✅ Society data fetched:', data);
        setSocietyData(data);
      } catch (error: any) {
        console.error('❌ Error fetching society:', error);
        console.error('❌ Error details:', error.response);
        toast.error(error.message || 'Failed to fetch society details');
        navigate('/societies');
      } finally {
        setLoading(false);
      }
    };

    fetchSociety();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading society details...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!societyData) {
    return null;
  }

  return <SocietySetupForm societyId={id} initialData={societyData} mode="edit" />;
};

