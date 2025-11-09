import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NoticeForm } from './NoticeForm';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface AddNoticeProps {
  isEdit?: boolean;
}

export const AddNotice: React.FC<AddNoticeProps> = ({ isEdit = false }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/notice');
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-start">
        <Button
          onClick={handleBack}
          variant="outline"
          className="flex items-center gap-2 text-design-primary hover:bg-design-description"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Notice Board
        </Button>
      </div>

      {/* Notice Form */}
      <NoticeForm isEdit={isEdit} />
    </div>
  );
};
