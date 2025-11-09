import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ShieldAlert, 
  Search, 
  Filter,
  Eye,
  MapPin,
  User,
  Clock,
  Phone,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { getAllSOSReports, getSOSStatistics, type SOSReport } from '../../apis/sosApi';
import toast from 'react-hot-toast';

export const SOSReportList: React.FC = () => {
  const navigate = useNavigate();
  
  // State management
  const [reports, setReports] = useState<SOSReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    resolved: 0,
    cancelled: 0,
  });
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  
  // Filter state
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    search: '',
    page: 1,
    limit: 10,
  });

  // Fetch SOS reports
  const fetchSOSReports = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        page: filters.page,
        limit: filters.limit,
      };

      if (filters.status !== 'all') {
        params.status = filters.status;
      }

      if (filters.type !== 'all') {
        params.type = filters.type;
      }

      if (filters.search) {
        params.search = filters.search;
      }

      const response = await getAllSOSReports(params);
      setReports(response.sosReports);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error('Error fetching SOS reports:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch SOS reports');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const stats = await getSOSStatistics();
      setStatistics(stats);
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchSOSReports();
    fetchStatistics();
  }, [filters]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filter changes
    }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      search: e.target.value,
      page: 1,
    }));
  };

  const handleRefresh = () => {
    fetchSOSReports();
    fetchStatistics();
    toast.success('Data refreshed');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
      ACTIVE: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: <AlertCircle className="w-3 h-3" /> 
      },
      RESOLVED: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: <CheckCircle className="w-3 h-3" /> 
      },
      CANCELLED: { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        icon: <XCircle className="w-3 h-3" /> 
      },
    };

    const config = statusConfig[status] || statusConfig.ACTIVE;

    return (
      <Badge className={`${config.color} border flex items-center gap-1 w-fit`}>
        {config.icon}
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, string> = {
      CRITICAL: 'bg-red-600 text-white border-red-700',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
      MEDIUM: 'bg-blue-100 text-blue-800 border-blue-200',
      LOW: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    const color = priorityConfig[priority] || priorityConfig.MEDIUM;

    return (
      <Badge className={`${color} border font-semibold`}>
        {priority}
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
      <Badge className={`${color} border`}>
        {type}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-design-primary">SOS Reports</h1>
            <p className="text-design-secondary mt-1">
              Emergency reports from residents
            </p>
          </div>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-red-600">
                {statistics.active}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">
                {statistics.resolved}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-gray-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-gray-600">
                {statistics.cancelled}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-gray-600" />
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-blue-600">
                {statistics.total}
              </p>
            </div>
            <ShieldAlert className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-design-primary" />
          <h3 className="text-lg font-semibold text-design-primary">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email..."
                value={filters.search}
                onChange={handleSearch}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Type</label>
            <input
              type="text"
              placeholder="Filter by type..."
              value={filters.type === 'all' ? '' : filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value || 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Active Filters Summary */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Active Filters:</span>
          {filters.status !== 'all' && (
            <Badge variant="outline" className="bg-blue-50">
              Status: {filters.status.replace('_', ' ')}
            </Badge>
          )}
          {filters.type !== 'all' && (
            <Badge variant="outline" className="bg-purple-50">
              Type: {filters.type}
            </Badge>
          )}
          {filters.search && (
            <Badge variant="outline" className="bg-orange-50">
              Search: {filters.search}
            </Badge>
          )}
          {(filters.status !== 'all' || filters.type !== 'all' || filters.search) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilters({ 
                  status: 'all', 
                  type: 'all', 
                  search: '',
                  page: 1,
                  limit: 10,
                });
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
          Showing <span className="font-semibold">{reports.length}</span> of{' '}
          <span className="font-semibold">{pagination.totalItems}</span> reports
          {loading && <span className="ml-2 text-blue-600">Loading...</span>}
        </div>
      </div>

      {/* SOS Reports Table */}
      <Card className="overflow-hidden">
        {reports.length === 0 ? (
          <div className="text-center py-12">
            <ShieldAlert className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No SOS Reports Found</h3>
            <p className="text-gray-500 mb-4">
              {filters.search || filters.status !== 'all' || filters.type !== 'all'
                ? 'Try adjusting your filters or search term'
                : 'No emergency reports have been filed yet'}
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Society</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reported At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report._id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 font-medium text-gray-900">
                          <User className="w-3 h-3 text-gray-400" />
                          {report.user?.name || 'N/A'}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone className="w-3 h-3" />
                          {report.user?.mobileNumber || 'N/A'}
                        </div>
                        {report.user?.email && (
                          <div className="text-xs text-gray-500">
                            {report.user.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="text-sm font-medium">{report.society?.name || 'N/A'}</div>
                        {report.society?.address && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {typeof report.society.address === 'object' 
                              ? `${report.society.address.street}, ${report.society.address.city}, ${report.society.address.state} ${report.society.address.pincode}`
                              : report.society.address}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(report.type)}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDateTime(report.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/sos-report/view/${report._id}`)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="border-t px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPreviousPage || loading}
                    >
                      Previous
                    </Button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.currentPage >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={pagination.currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className={pagination.currentPage === pageNum ? 'btn-primary' : ''}
                            disabled={loading}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage || loading}
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
    </div>
  );
};

