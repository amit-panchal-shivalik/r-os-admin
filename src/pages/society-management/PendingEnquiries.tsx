import React, { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { Building, Phone, MapPin, Users, Check, X, Eye } from 'lucide-react';

interface Enquiry {
  id: string;
  societyName: string;
  address: string;
  contactPersonName: string;
  contactNumber: string;
  approxMembers: string;
  notes: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

// Sample data - replace with API call
const sampleEnquiries: Enquiry[] = [
  {
    id: '1',
    societyName: 'Sunset Gardens',
    address: '321 Garden Street, Green Area, City - 400004',
    contactPersonName: 'Sarah Williams',
    contactNumber: '+91 9876543213',
    approxMembers: '180',
    notes: 'Looking to onboard society management system for better administration',
    submittedAt: '2024-02-15',
    status: 'Pending'
  },
  {
    id: '2',
    societyName: 'Royal Heights',
    address: '654 Heights Road, Hill Area, City - 400005',
    contactPersonName: 'Robert Brown',
    contactNumber: '+91 9876543214',
    approxMembers: '250',
    notes: 'Need help with maintenance billing and parking management',
    submittedAt: '2024-02-16',
    status: 'Pending'
  },
];

export const PendingEnquiries: React.FC = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>(sampleEnquiries);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleApprove = (id: string) => {
    if (window.confirm('Are you sure you want to approve this enquiry?')) {
      setEnquiries(enquiries.map(e => 
        e.id === id ? { ...e, status: 'Approved' as const } : e
      ));
      alert('Enquiry approved successfully');
    }
  };

  const handleReject = (id: string) => {
    if (window.confirm('Are you sure you want to reject this enquiry?')) {
      setEnquiries(enquiries.map(e => 
        e.id === id ? { ...e, status: 'Rejected' as const } : e
      ));
      alert('Enquiry rejected');
    }
  };

  const handleViewDetails = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setShowDetailsModal(true);
  };

  const pendingEnquiries = enquiries.filter(e => e.status === 'Pending');

  return (
    <div className="w-full mx-auto p-2">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pending Enquiries</h1>
        <p className="text-gray-600 mt-1">Review and approve society onboarding requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Enquiries</p>
              <p className="text-2xl font-bold text-primary mt-1">{enquiries.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-primary mt-1">
                {pendingEnquiries.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/50 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-primary mt-1">
                {enquiries.filter(e => e.status === 'Approved').length}
              </p>
            </div>
            <div className="w-12 h-12 border border-primary rounded-lg flex items-center justify-center">
              <Check className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Enquiries List */}
      <div className="space-y-4">
        {pendingEnquiries.length === 0 ? (
          <Card className="p-12 text-center">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No pending enquiries</h3>
            <p className="text-gray-600">All enquiries have been reviewed</p>
          </Card>
        ) : (
          pendingEnquiries.map((enquiry) => (
            <Card key={enquiry.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 bg-primary/50 rounded-lg flex items-center justify-center">
                        <Building className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{enquiry.societyName}</h3>
                        <p className="text-sm text-gray-500">Submitted on {new Date(enquiry.submittedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-2 ml-4">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(enquiry)}
                              className="text-primary"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View enquiry details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(enquiry.id)}
                              className="text-design-primary"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Approve this enquiry</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleReject(enquiry.id)}
                              className="text-white"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Reject this enquiry</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Address</p>
                        <p className="text-sm text-gray-900">{enquiry.address}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Contact Person</p>
                        <p className="text-sm text-gray-900">{enquiry.contactPersonName}</p>
                        <p className="text-sm text-gray-600">{enquiry.contactNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Users className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Members/Units</p>
                        <p className="text-sm text-gray-900">{enquiry.approxMembers}</p>
                      </div>
                    </div>
                  </div>

                  {enquiry.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-bold text-gray-600 mb-1">Notes:</p>
                      <p className="text-sm text-gray-900">{enquiry.notes}</p>
                    </div>
                  )}
                </div>

                
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedEnquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Enquiry Details</h2>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setShowDetailsModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Close</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Society Name</p>
                  <p className="text-base text-gray-900 mt-1">{selectedEnquiry.societyName}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Address</p>
                  <p className="text-base text-gray-900 mt-1">{selectedEnquiry.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Contact Person</p>
                    <p className="text-base text-gray-900 mt-1">{selectedEnquiry.contactPersonName}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600">Contact Number</p>
                    <p className="text-base text-gray-900 mt-1">{selectedEnquiry.contactNumber}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Approx. Members/Units</p>
                  <p className="text-base text-gray-900 mt-1">{selectedEnquiry.approxMembers}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Notes/Message</p>
                  <p className="text-base text-gray-900 mt-1">{selectedEnquiry.notes || 'No additional notes'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Submitted On</p>
                  <p className="text-base text-gray-900 mt-1">
                    {new Date(selectedEnquiry.submittedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleReject(selectedEnquiry.id);
                          setShowDetailsModal(false);
                        }}
                        className="text-red-600 hover:bg-red-500 hover:text-white"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reject this enquiry</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => {
                          handleApprove(selectedEnquiry.id);
                          setShowDetailsModal(false);
                        }}
                        className="bg-primary hover:bg-primary text-white"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Approve this enquiry</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

