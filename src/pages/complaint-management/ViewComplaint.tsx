import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, MapPin, Calendar, User, Phone, Mail } from 'lucide-react';
import { getComplaintById, deleteComplaint, updateComplaintStatus } from '../../apis/complaintApi';
import {
  Complaint,
  getStatusColor,
  getPriorityColor,
  COMPLAINT_STATUSES,
} from '../../types/ComplaintTypes';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { toast } from '../../hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

export const ViewComplaint: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch complaint
  useEffect(() => {
    const fetchComplaint = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await getComplaintById(id);
        setComplaint(data);
      } catch (error: any) {
        console.error('Error fetching complaint:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.response?.data?.message || 'Failed to fetch complaint',
        });
        navigate('/complaints');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id, navigate]);

  // Handle delete
  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this complaint?')) return;

    try {
      await deleteComplaint(id);
      toast({
        title: 'Success',
        description: 'Complaint deleted successfully',
      });
      navigate('/complaints');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete complaint',
      });
    }
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!id || !newStatus) return;

    try {
      setUpdatingStatus(true);
      await updateComplaintStatus(id, newStatus, resolutionNotes || undefined);
      
      // Refresh complaint data
      const updatedComplaint = await getComplaintById(id);
      setComplaint(updatedComplaint);
      
      toast({
        title: 'Success',
        description: 'Status updated successfully',
      });
      
      setShowStatusDialog(false);
      setNewStatus('');
      setResolutionNotes('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update status',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading complaint...</p>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="p-6">
        <p>Complaint not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/complaints')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Complaints
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Complaint Details</h1>
            <p className="text-gray-500 mt-1">ID: {complaint.complaintId}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowStatusDialog(true)}
            >
              Update Status
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/complaints/edit/${complaint._id}`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Complaint Information */}
          <Card>
            <CardHeader>
              <CardTitle>Complaint Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Type</Label>
                  <p className="font-medium mt-1">{complaint.type}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(complaint.status)}>
                      {complaint.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500">Priority</Label>
                  <div className="mt-1">
                    <Badge className={getPriorityColor(complaint.priority)}>
                      {complaint.priority}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500">Created At</Label>
                  <p className="font-medium mt-1">{formatDate(complaint.createdAt)}</p>
                </div>
              </div>

              <div>
                <Label className="text-gray-500">Description</Label>
                <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                  {complaint.description}
                </p>
              </div>

              {complaint.image && (
                <div>
                  <Label className="text-gray-500">Image</Label>
                  <img
                    src={complaint.image}
                    alt="Complaint"
                    className="mt-2 w-full max-w-lg h-auto rounded-lg border"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resolution Details */}
          {(complaint.status === 'Resolved' || complaint.status === 'Closed') && complaint.resolution && (
            <Card>
              <CardHeader>
                <CardTitle>Resolution Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {complaint.resolution.resolvedAt && (
                  <div>
                    <Label className="text-gray-500">Resolved At</Label>
                    <p className="font-medium mt-1">
                      {formatDate(complaint.resolution.resolvedAt)}
                    </p>
                  </div>
                )}
                {complaint.resolution.notes && (
                  <div>
                    <Label className="text-gray-500">Resolution Notes</Label>
                    <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                      {complaint.resolution.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Society Information */}
          <Card>
            <CardHeader>
              <CardTitle>Society Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {complaint.society.logo && (
                <img
                  src={complaint.society.logo}
                  alt={complaint.society.societyName}
                  className="w-full h-32 object-cover rounded-lg"
                />
              )}
              
              <div>
                <Label className="text-gray-500">Name</Label>
                <p className="font-medium mt-1">{complaint.society.societyName}</p>
              </div>

              <div>
                <Label className="text-gray-500">Code</Label>
                <p className="font-medium mt-1">{complaint.society.societyCode}</p>
              </div>

              {complaint.society.address && (
                <div>
                  <Label className="text-gray-500">Location</Label>
                  <div className="flex items-start mt-1">
                    <MapPin className="w-4 h-4 mr-2 mt-1 text-gray-400" />
                    <p className="text-sm">
                      {complaint.society.address.street && `${complaint.society.address.street}, `}
                      {complaint.society.address.city}
                      {complaint.society.address.state && `, ${complaint.society.address.state}`}
                      {complaint.society.address.pincode && ` - ${complaint.society.address.pincode}`}
                    </p>
                  </div>
                </div>
              )}

              {complaint.society.contactPersonName && (
                <div>
                  <Label className="text-gray-500">Contact Person</Label>
                  <div className="flex items-center mt-1">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <p className="text-sm">{complaint.society.contactPersonName}</p>
                  </div>
                </div>
              )}

              {complaint.society.contactNumber && (
                <div>
                  <Label className="text-gray-500">Phone</Label>
                  <div className="flex items-center mt-1">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <p className="text-sm">{complaint.society.contactNumber}</p>
                  </div>
                </div>
              )}

              {complaint.society.email && (
                <div>
                  <Label className="text-gray-500">Email</Label>
                  <div className="flex items-center mt-1">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <p className="text-sm break-all">{complaint.society.email}</p>
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/societies/view/${complaint.society._id}`)}
              >
                View Society Details
              </Button>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start">
                <Calendar className="w-4 h-4 mr-2 mt-1 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-xs text-gray-500">{formatDate(complaint.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar className="w-4 h-4 mr-2 mt-1 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-xs text-gray-500">{formatDate(complaint.updatedAt)}</p>
                </div>
              </div>
              {complaint.resolution?.resolvedAt && (
                <div className="flex items-start">
                  <Calendar className="w-4 h-4 mr-2 mt-1 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-green-600">Resolved</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(complaint.resolution.resolvedAt)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
            <DialogDescription>
              Change the status of this complaint
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {COMPLAINT_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(newStatus === 'Resolved' || newStatus === 'Closed') && (
              <div className="space-y-2">
                <Label htmlFor="notes">Resolution Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add resolution notes..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={4}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStatusDialog(false)}
              disabled={updatingStatus}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={!newStatus || updatingStatus}
            >
              {updatingStatus ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewComplaint;

