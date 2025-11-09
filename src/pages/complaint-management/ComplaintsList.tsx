import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, Filter, Search } from 'lucide-react';
import {
  getAllComplaints,
  deleteComplaint,
  getComplaintStats,
} from '../../apis/complaintApi';
import { getAllSocieties } from '../../apis/societyApi';
import {
  Complaint,
  ComplaintListParams,
  COMPLAINT_TYPES,
  COMPLAINT_STATUSES,
  COMPLAINT_PRIORITIES,
  getStatusColor,
  getPriorityColor,
} from '../../types/ComplaintTypes';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { toast } from '../../hooks/use-toast';

export const ComplaintsList: React.FC = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [societies, setSocieties] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Filters and pagination
  const [filters, setFilters] = useState<ComplaintListParams>({
    page: 1,
    limit: 10,
    search: '',
    society: '',
    type: '',
    status: '',
    priority: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Fetch complaints
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await getAllComplaints(filters);
      setComplaints(data.complaints);
      setPagination(data.pagination);
    } catch (error: any) {
      console.error('Error fetching complaints:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch complaints',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch societies for filter
  const fetchSocieties = async () => {
    try {
      const data = await getAllSocieties({ limit: 100 });
      setSocieties(data.societies);
    } catch (error) {
      console.error('Error fetching societies:', error);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const data = await getComplaintStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchSocieties();
    fetchStats();
  }, [filters]);

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this complaint?')) return;

    try {
      await deleteComplaint(id);
      toast({
        title: 'Success',
        description: 'Complaint deleted successfully',
      });
      fetchComplaints();
      fetchStats();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete complaint',
      });
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof ComplaintListParams, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-2 w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Complaints Management</h1>
          <p className="text-gray-500 mt-1">Manage all society complaints</p>
        </div>
        <Button onClick={() => navigate('/complaints/add')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Complaint
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byStatus.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Open</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byStatus.open}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byStatus.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byStatus.resolved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Closed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byStatus.closed}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by ID or description..."
                  value={filters.search}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Society Filter */}
            <Select
              value={filters.society || 'all'}
              onValueChange={(value) => handleFilterChange('society', value === 'all' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Societies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Societies</SelectItem>
                {societies.map((society) => (
                  <SelectItem key={society._id} value={society._id}>
                    {society.societyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select
              value={filters.type || 'all'}
              onValueChange={(value) => handleFilterChange('type', value === 'all' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {COMPLAINT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {COMPLAINT_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading complaints...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No complaints found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Society</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map((complaint) => (
                    <TableRow key={complaint._id}>
                      <TableCell className="font-medium">{complaint.complaintId}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{complaint.society?.societyName || 'N/A'}</div>
                          <div className="text-sm text-gray-500">
                            {complaint.society?.societyCode || '-'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{complaint.type}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {complaint.description}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(complaint.status)}>
                          {complaint.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(complaint.priority)}>
                          {complaint.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(complaint.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/complaints/view/${complaint._id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/complaints/edit/${complaint._id}`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(complaint._id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Showing {(filters.page! - 1) * filters.limit! + 1} to{' '}
                  {Math.min(filters.page! * filters.limit!, pagination.total)} of{' '}
                  {pagination.total} complaints
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(filters.page! - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(filters.page! + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

