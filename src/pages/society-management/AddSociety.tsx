import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SocietySetupForm } from './SocietySetupForm';
import { Button } from '../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const AddSociety: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/societies');
  };

  return (
    <div className="space-y-2">
      {/* Back Button */}
      <div className="flex items-center justify-start">
        <Button
          onClick={handleBack}
          variant="outline"
          className="flex items-center gap-2 text-design-primary hover:bg-design-description"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Societies
        </Button>
      </div>

      {/* Society Setup Form */}
      <SocietySetupForm />
    </div>
  );
};
