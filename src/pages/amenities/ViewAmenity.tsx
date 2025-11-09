import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  ArrowLeft, 
  Building2, 
  Clock, 
  DollarSign, 
  CheckCircle,
  XCircle,
  Edit,
  Download,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { getAmenityById, type Amenity } from '../../apis/amenityApi';
import { getSocietyById, type Society } from '../../apis/societyApi';
import QRCode from 'react-qr-code';

export const ViewAmenity: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [amenity, setAmenity] = useState<Amenity | null>(null);
  const [society, setSociety] = useState<Society | null>(null);

  useEffect(() => {
    if (id) {
      fetchAmenityDetails();
    }
  }, [id]);

  const fetchAmenityDetails = async () => {
    try {
      setLoading(true);
      const amenityData = await getAmenityById(id!);
      setAmenity(amenityData);

      // Fetch society details
      if (amenityData.society) {
        const societyData = await getSocietyById(amenityData.society);
        setSociety(societyData);
      }
    } catch (error: any) {
      console.error('Error fetching amenity details:', error);
      toast.error('Failed to load amenity details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/amenities');
  };

  const handleEdit = () => {
    navigate(`/amenities/edit/${id}`);
  };

  const handleDownloadQR = () => {
    if (!amenity?.qrCode) return;

    // Create a temporary link to download the QR code
    const link = document.createElement('a');
    link.href = amenity.qrCode;
    link.download = `${amenity.name}-QR-Code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR Code downloaded successfully');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
      ACTIVE: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: <CheckCircle className="w-3 h-3" /> 
      },
      INACTIVE: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: <Clock className="w-3 h-3" /> 
      },
      DELETED: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: <XCircle className="w-3 h-3" /> 
      },
    };

    const config = statusConfig[status] || statusConfig.ACTIVE;

    return (
      <Badge className={`${config.color} border flex items-center gap-1 w-fit`}>
        {config.icon}
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-start">
          <Button
            onClick={handleBack}
            variant="outline"
            className="flex items-center gap-2 text-design-primary hover:bg-design-description"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Amenities
          </Button>
        </div>
        <Card className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-design-primary"></div>
            <span className="ml-3 text-design-secondary">Loading amenity details...</span>
          </div>
        </Card>
      </div>
    );
  }

  if (!amenity) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-start">
          <Button
            onClick={handleBack}
            variant="outline"
            className="flex items-center gap-2 text-design-primary hover:bg-design-description"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Amenities
          </Button>
        </div>
        <Card className="p-6">
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Amenity Not Found</h3>
            <p className="text-gray-500">The amenity you're looking for doesn't exist.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button and Actions */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handleBack}
          variant="outline"
          className="flex items-center gap-2 text-design-primary hover:bg-design-description"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Amenities
        </Button>
        <Button
          onClick={handleEdit}
          className="btn-primary flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit Amenity
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-design-description rounded-lg flex items-center justify-center">
          <Building2 className="w-6 h-6 text-design-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-design-primary">{amenity.name}</h1>
          <p className="text-design-secondary mt-1">Amenity Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-design-primary mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Amenity Name</label>
                <p className="text-base font-semibold text-gray-900 mt-1">{amenity.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">{getStatusBadge(amenity.status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Society</label>
                <p className="text-base font-semibold text-gray-900 mt-1">
                  {society ? `${society.societyName} (${society.societyCode})` : amenity.society}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Payment Type</label>
                <div className="mt-1">
                  {amenity.isPaid ? (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 border flex items-center gap-1 w-fit">
                      <DollarSign className="w-3 h-3" />
                      Paid (₹{amenity.amount})
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800 border-gray-200 border">
                      Free
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Operating Hours */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-design-primary mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Operating Hours
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Start Time</label>
                <p className="text-base font-semibold text-gray-900 mt-1">{amenity.startTime}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">End Time</label>
                <p className="text-base font-semibold text-gray-900 mt-1">{amenity.endTime}</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <Clock className="w-4 h-4 inline mr-1" />
                This amenity is available from {amenity.startTime} to {amenity.endTime}
              </p>
            </div>
          </Card>

          {/* Timestamps */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-design-primary mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Timestamps
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p className="text-base font-semibold text-gray-900 mt-1">
                  {new Date(amenity.createdAt).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-base font-semibold text-gray-900 mt-1">
                  {new Date(amenity.updatedAt).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* QR Code Section */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-design-primary mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Payment Information
            </h2>
            {amenity.isPaid && amenity.qrCode ? (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  <div className="flex justify-center">
                    <img 
                      src={amenity.qrCode} 
                      alt={`QR Code for ${amenity.name}`}
                      className="w-full max-w-[250px] h-auto"
                    />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 mb-1">Amount</p>
                  <p className="text-2xl font-bold text-blue-600">₹{amenity.amount}</p>
                </div>
                <Button
                  onClick={handleDownloadQR}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download QR Code
                </Button>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700 text-center">
                    Scan this QR code to make payment for this amenity
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Free Amenity</p>
                <p className="text-sm text-gray-500 mt-1">
                  No payment required for this amenity
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

