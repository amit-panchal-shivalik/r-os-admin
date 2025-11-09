import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  ShieldAlert,
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Hash,
  FileText,
  Edit,
} from 'lucide-react';
import { getSOSReportById, updateSOSStatus, type SOSReport } from '../../apis/sosApi';
import toast from 'react-hot-toast';

export const SOSReportView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [report, setReport] = useState<SOSReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSOSReport();
    }
  }, [id]);

  const fetchSOSReport = async () => {
    try {
      setLoading(true);
      const data = await getSOSReportById(id!);
      setReport(data);
    } catch (error: any) {
      console.error('Error fetching SOS report:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch SOS report');
      navigate('/sos-report');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!id || !report) return;

    try {
      setUpdating(true);
      await updateSOSStatus(id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      await fetchSOSReport(); // Refresh data
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
      ACTIVE: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: <AlertCircle className="w-4 h-4" /> 
      },
      RESOLVED: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: <CheckCircle className="w-4 h-4" /> 
      },
      CANCELLED: { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        icon: <XCircle className="w-4 h-4" /> 
      },
    };

    const config = statusConfig[status] || statusConfig.ACTIVE;

    return (
      <Badge className={`${config.color} border flex items-center gap-2 text-base px-4 py-2`}>
        {config.icon}
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig: Record<string, string> = {
      'Medical Emergency': 'bg-purple-100 text-purple-800 border-purple-200',
      'Security Threat': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Fire Emergency': 'bg-red-100 text-red-800 border-red-200',
      'Accident': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };

    const color = typeConfig[type] || 'bg-gray-100 text-gray-800 border-gray-200';

    return (
      <Badge className={`${color} border text-base px-4 py-2`}>
        {type}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatAddress = (address: any) => {
    if (!address) return 'N/A';
    if (typeof address === 'string') return address;
    return `${address.street}, ${address.city}, ${address.state} ${address.pincode}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading SOS report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <ShieldAlert className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Report Not Found</h2>
        <p className="text-gray-500 mb-6">The SOS report you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/sos-report')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Reports
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/sos-report')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-design-primary">SOS Report Details</h1>
              <p className="text-design-secondary mt-1">
                Report ID: {report._id}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status and Type */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">Emergency Type</h3>
            </div>
            {getTypeBadge(report.type)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">Current Status</h3>
            </div>
            {getStatusBadge(report.status)}
          </div>
        </div>

        {/* Status Update Actions */}
        {report.status === 'ACTIVE' && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center gap-2 mb-3">
              <Edit className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">Update Status</h3>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => handleStatusUpdate('RESOLVED')}
                disabled={updating}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Resolved
              </Button>
              <Button
                onClick={() => handleStatusUpdate('CANCELLED')}
                disabled={updating}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Report
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Reporter Information */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Reporter Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">Full Name</label>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-base text-gray-900">{report.user?.name || 'N/A'}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">Mobile Number</label>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <a 
                  href={`tel:${report.user?.mobileNumber}`}
                  className="text-base text-blue-600 hover:underline"
                >
                  {report.user?.mobileNumber || 'N/A'}
                </a>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">Email Address</label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <a 
                  href={`mailto:${report.user?.email}`}
                  className="text-base text-blue-600 hover:underline"
                >
                  {report.user?.email || 'N/A'}
                </a>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">User ID</label>
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-400" />
                <span className="text-base text-gray-900 font-mono text-sm">{report.user?._id || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Society Information */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-bold text-gray-900">Society Information</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">Society Name</label>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span className="text-base text-gray-900">{report.society?.name || 'N/A'}</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">Address</label>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <span className="text-base text-gray-900">{formatAddress(report.society?.address)}</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1">Society ID</label>
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-gray-400" />
              <span className="text-base text-gray-900 font-mono text-sm">{report.society?._id || 'N/A'}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Timeline Information */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">Timeline</h2>
        </div>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Report Created</h3>
              <p className="text-sm text-gray-500 mt-1">
                {formatDateTime(report.createdAt)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Emergency was reported by {report.user?.name}
              </p>
            </div>
          </div>
          {report.updatedAt !== report.createdAt && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Last Updated</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDateTime(report.updatedAt)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Most recent status change
                </p>
              </div>
            </div>
          )}
          {report.status === 'RESOLVED' && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Resolved</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Emergency was successfully resolved
                </p>
              </div>
            </div>
          )}
          {report.status === 'CANCELLED' && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <XCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Cancelled</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Emergency report was cancelled
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => window.open(`tel:${report.user?.mobileNumber}`, '_self')}
          >
            <Phone className="w-4 h-4 mr-2" />
            Call Reporter
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(`mailto:${report.user?.email}`, '_blank')}
          >
            <Mail className="w-4 h-4 mr-2" />
            Email Reporter
          </Button>
          {report.society?.address && typeof report.society.address === 'object' && (
            <Button
              variant="outline"
              onClick={() => {
                const address = formatAddress(report.society.address);
                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
              }}
            >
              <MapPin className="w-4 h-4 mr-2" />
              View on Map
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};


