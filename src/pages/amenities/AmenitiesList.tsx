import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAllAmenities, 
  deleteAmenity, 
  type Amenity,
  type GetAmenitiesParams 
} from '../../apis/amenityApi';
import { getAllSocieties, type Society } from '../../apis/societyApi';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Building2, 
  Search, 
  Filter,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export const AmenitiesList: React.FC = () => {
  const navigate = useNavigate();
  
  // State management
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSocieties, setLoadingSocieties] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filter state
  const [filters, setFilters] = useState<GetAmenitiesParams>({
    page: 1,
    limit: 10,
    status: undefined,
    isPaid: undefined,
    society: undefined,
  });
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    amenity: Amenity | null;
  }>({
    open: false,
    amenity: null,
  });

  // Fetch societies on mount
  useEffect(() => {
    fetchSocieties();
  }, []);

  // Fetch amenities when filters change
  useEffect(() => {
    fetchAmenities();
  }, [filters]);

  const fetchSocieties = async () => {
    try {
      setLoadingSocieties(true);
      const response = await getAllSocieties({ limit: 100 });
      setSocieties(response.societies);
    } catch (error: any) {
      console.error('Error fetching societies:', error);
      toast.error('Failed to load societies');
    } finally {
      setLoadingSocieties(false);
    }
  };

  const fetchAmenities = async () => {
    try {
      setLoading(true);
      const response = await getAllAmenities(filters);
      setAmenities(response.amenities);
      setCurrentPage(response.pagination.currentPage);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
      setItemsPerPage(response.pagination.itemsPerPage);
    } catch (error: any) {
      console.error('Error fetching amenities:', error);
      toast.error('Failed to load amenities');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleFilterChange = (key: keyof GetAmenitiesParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
      page: 1, // Reset to first page when filter changes
    }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteClick = (amenity: Amenity) => {
    setDeleteDialog({ open: true, amenity });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.amenity) return;

    try {
      setDeleting(deleteDialog.amenity._id);
      await deleteAmenity(deleteDialog.amenity._id);
      
      toast.success(
        `Amenity "${deleteDialog.amenity.name}" deleted successfully`
      );
      
      // Refresh the list
      fetchAmenities();
      
      // Close dialog
      setDeleteDialog({ open: false, amenity: null });
    } catch (error: any) {
      console.error('Error deleting amenity:', error);
      toast.error(error.message || 'Failed to delete amenity');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, amenity: null });
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

  const getPaidBadge = (isPaid: boolean, amount: number | null) => {
    if (isPaid && amount) {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 border flex items-center gap-1 w-fit">
          <DollarSign className="w-3 h-3" />
          ₹{amount}
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200 border">
        Free
      </Badge>
    );
  };

  const getSocietyName = (societyId: string) => {
    const society = societies.find((s) => s._id === societyId);
    return society ? `${society.societyName} (${society.societyCode})` : societyId;
  };

  const formatTime = (time: string) => {
    return time || '-';
  };

  // Filter amenities by search term (client-side)
  const filteredAmenities = amenities.filter((amenity) =>
    amenity.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-design-description rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-design-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-design-primary">Amenities Management</h1>
            <p className="text-design-secondary mt-1">
              Manage all amenities across societies
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate('/societies/book-amenity')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Amenity
        </Button>
      </div>

      {/* Filters & Search */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-design-primary" />
          <h3 className="text-lg font-semibold text-design-primary">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Society Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Society</label>
            <select
              value={filters.society || 'all'}
              onChange={(e) => handleFilterChange('society', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loadingSocieties}
            >
              <option value="all">All Societies</option>
              {societies.map((society) => (
                <option key={society._id} value={society._id}>
                  {society.societyName} ({society.societyCode})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              value={filters.status || 'all'}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="DELETED">Deleted</option>
            </select>
          </div>

          {/* Payment Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Payment</label>
            <select
              value={filters.isPaid === undefined ? 'all' : filters.isPaid.toString()}
              onChange={(e) => {
                const value = e.target.value;
                handleFilterChange('isPaid', value === 'all' ? undefined : value === 'true');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="true">Paid</option>
              <option value="false">Free</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Active Filters:</span>
          {filters.society && (
            <Badge variant="outline" className="bg-blue-50">
              Society: {getSocietyName(filters.society)}
            </Badge>
          )}
          {filters.status && (
            <Badge variant="outline" className="bg-green-50">
              Status: {filters.status}
            </Badge>
          )}
          {filters.isPaid !== undefined && (
            <Badge variant="outline" className="bg-purple-50">
              Payment: {filters.isPaid ? 'Paid' : 'Free'}
            </Badge>
          )}
          {searchTerm && (
            <Badge variant="outline" className="bg-yellow-50">
              Search: {searchTerm}
            </Badge>
          )}
          {(filters.society || filters.status || filters.isPaid !== undefined || searchTerm) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilters({ page: 1, limit: 10 });
                setSearchTerm('');
              }}
              className="text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing <span className="font-semibold">{filteredAmenities.length}</span> of{' '}
          <span className="font-semibold">{totalItems}</span> amenities
        </div>
        {loading && (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-design-primary"></div>
            <span>Loading...</span>
          </div>
        )}
      </div>

      {/* Amenities Table */}
      <Card className="overflow-hidden">
        {loading && amenities.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-design-primary"></div>
            <span className="ml-3 text-design-secondary">Loading amenities...</span>
          </div>
        ) : filteredAmenities.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Amenities Found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filters.society || filters.status || filters.isPaid !== undefined
                ? 'Try adjusting your filters or search term'
                : 'Get started by adding your first amenity'}
            </p>
            <Button onClick={() => navigate('/societies/book-amenity')} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Amenity
            </Button>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amenity Name</TableHead>
                  <TableHead>Society</TableHead>
                  <TableHead>Operating Hours</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAmenities.map((amenity) => (
                  <TableRow key={amenity._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        {amenity.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {getSocietyName(amenity.society)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {formatTime(amenity.startTime)} - {formatTime(amenity.endTime)}
                      </div>
                    </TableCell>
                    <TableCell>{getPaidBadge(amenity.isPaid, amenity.amount)}</TableCell>
                    <TableCell>{getStatusBadge(amenity.status)}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(amenity.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/amenities/view/${amenity._id}`)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/amenities/edit/${amenity._id}`)}
                          title="Edit Amenity"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(amenity)}
                          disabled={deleting === amenity._id}
                          title="Delete Amenity"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {deleting === amenity._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                    >
                      Previous
                    </Button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            disabled={loading}
                            className={currentPage === pageNum ? 'btn-primary' : ''}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Amenity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the amenity{' '}
              <span className="font-semibold text-gray-900">
                "{deleteDialog.amenity?.name}"
              </span>
              ? This action will soft-delete the amenity and it can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel} disabled={!!deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={!!deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};


