import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import SelectInput from '../../components/CustomInput/SelectInput';
import { Building, Phone, MapPin, Users, Plus, Search, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import { getAllSocieties, deleteSociety, getSocietyStats, Society } from '../../apis/societyApi';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

interface Stats {
  total: number;
  active: number;
  pending: number;
  inactive: number;
  totalMembers: number;
}

export const SocietiesList: React.FC = () => {
  const navigate = useNavigate();
  const { admin } = useAuth();
  const [societies, setSocieties] = useState<Society[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0,
    totalMembers: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Check if current user is super admin
  const isSuperAdmin = admin?.roleKey === 'super_admin';

  // Fetch societies
  const fetchSocieties = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        search: searchTerm,
        status: filterStatus,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };

      const data = await getAllSocieties(params);
      setSocieties(data.societies);
      setTotalPages(data.pagination.totalPages);
    } catch (error: any) {
      console.error('Error fetching societies:', error);
      toast.error(error.message || 'Failed to fetch societies');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const data = await getSocietyStats();
      setStats(data);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchSocieties();
    fetchStats();
  }, [page, filterStatus]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchSocieties();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleAddNew = () => {
    navigate('/societies/add');
  };

  const handleView = (id: string) => {
    navigate(`/societies/view/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/societies/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this society?')) {
      try {
        await deleteSociety(id);
        toast.success('Society deleted successfully');
        fetchSocieties();
        fetchStats();
      } catch (error: any) {
        console.error('Error deleting society:', error);
        toast.error(error.message || 'Failed to delete society');
      }
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-design-primary text-design-white';
      case 'Pending':
        return 'bg-design-secondary text-design-white';
      case 'Inactive':
        return 'bg-design-description text-design-primary';
      default:
        return 'bg-design-description text-design-primary';
    }
  };

  return (
    <div className="w-full mx-auto p-2">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-design-primary">Society Management</h1>
          <p className="text-design-secondary mt-1">
            {isSuperAdmin ? 'Manage all registered societies' : 'View your society details'}
          </p>
        </div>
        {isSuperAdmin && (
          <Button
            onClick={handleAddNew}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Society
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by society name, code, or contact person..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Societies</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-design-description rounded-lg flex items-center justify-start xl:justify-center">
              <Building className="w-6 h-6 text-design-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-design-description rounded-lg flex items-center justify-start xl:justify-center">
              <Building className="w-6 h-6 text-design-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-design-description rounded-lg flex items-center justify-start xl:justify-center">
              <Building className="w-6 h-6 text-design-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalMembers}</p>
            </div>
            <div className="w-12 h-12 bg-design-description rounded-lg flex items-center justify-start xl:justify-center">
              <Users className="w-6 h-6 text-design-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Loading State */}
      {loading ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading societies...</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Societies List */}
          <div className="space-y-4">
            {societies.length === 0 ? (
              <Card className="p-12 text-center">
                <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No societies found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterStatus
                    ? 'Try adjusting your search or filters'
                    : isSuperAdmin 
                      ? 'Get started by adding your first society'
                      : 'No society assigned to you'}
                </p>
                {!searchTerm && !filterStatus && isSuperAdmin && (
                  <Button onClick={handleAddNew} className="bg-gray-900 hover:bg-gray-800 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Society
                  </Button>
                )}
              </Card>
            ) : (
              societies.map((society) => (
                <Card key={society._id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                            <Building className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-bold text-gray-900">{society.societyName}</h3>
                              <span className="text-sm text-gray-600">({society.societyCode})</span>
                            </div>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(society.status)}`}>
                              {society.status}
                            </span>
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
                            onClick={() => handleView(society._id)}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Society</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          
                          

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                              {isSuperAdmin && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(society._id)}
                                className="text-green-600 hover:bg-green-50"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(society._id)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit Society</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(society._id)}
                                  className="text-red-600 hover:bg-red-500 hover:text-design-white"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete Society</p>
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
                            <p className="text-sm text-gray-900">
                              {society.address.street}, {society.address.city}, {society.address.state} - {society.address.pincode}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-600">Contact Person</p>
                            <p className="text-sm text-gray-900">{society.contactPersonName}</p>
                            <p className="text-sm text-gray-600">{society.contactNumber}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Users className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-600">Units</p>
                            <p className="text-sm text-gray-900">{society.totalUnits}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
