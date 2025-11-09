import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import SelectInput from '../components/CustomInput/SelectInput';
import { AlertTriangle, FileText, Eye, Edit, Trash2, Loader2, Plus, Search, Calendar, Clock } from 'lucide-react';
import { getAllNotices, deleteNotice, Notice, NoticeStats } from '../apis/noticeApi';
import { getAllSocieties, Society } from '../apis/societyApi';
import { toast } from 'sonner';

interface NoticeFilters {
  searchTerm: string;
  societyFilter: string;
  statusFilter: string;
  categoryFilter: string;
}

export const Notice: React.FC = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [stats, setStats] = useState<NoticeStats>({
    total: 0,
    active: 0,
    inactive: 0,
    draft: 0,
  });
  const [filters, setFilters] = useState<NoticeFilters>({
    searchTerm: '',
    societyFilter: '',
    statusFilter: '',
    categoryFilter: '',
  });
  const [loading, setLoading] = useState(true);
  const [societiesLoading, setSocietiesLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Fetch notices
  const fetchNotices = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        search: filters.searchTerm || undefined,
        societyId: filters.societyFilter || undefined,
        status: filters.statusFilter || undefined,
        category: filters.categoryFilter || undefined,
        sortBy: 'createdAt',
        sortOrder: 'DESC' as const,
      };

      const data = await getAllNotices(params);
      if (data && data.notices) {
      setNotices(data.notices);
        setTotalPages(data.pagination?.totalPages || 1);
        // Calculate stats from fetched notices
        calculateStats(data.notices);
      } else {
        setNotices([]);
        setTotalPages(1);
      }
    } catch (error: any) {
      console.error('Error fetching notices:', error);
      toast.error(error.message || 'Failed to fetch notices');
      setNotices([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fetch societies for filter
  const fetchSocieties = async () => {
    try {
      setSocietiesLoading(true);
      const data = await getAllSocieties({ limit: 100, page: 1 }); // Use limit 100 instead of 1000
      setSocieties(data.societies);
    } catch (error: any) {
      console.error('Error fetching societies:', error);
      toast.error('Failed to load societies for filter');
    } finally {
      setSocietiesLoading(false);
    }
  };

  // Calculate stats from notices (since backend doesn't have stats endpoint)
  const calculateStats = (allNotices: Notice[]) => {
    const total = allNotices.length;
    const active = allNotices.filter(n => n.status === 'ACTIVE').length;
    const inactive = allNotices.filter(n => n.status === 'INACTIVE').length;
    const draft = allNotices.filter(n => n.status === 'DRAFT').length;
    setStats({ total, active, inactive, draft });
  };

  useEffect(() => {
    fetchSocieties();
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [page, filters.societyFilter, filters.statusFilter, filters.categoryFilter]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchNotices();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.searchTerm]);

  const handleAddNew = () => {
    navigate('/notice/add');
  };

  const handleView = (id: string) => {
    navigate(`/notice/view/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/notice/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await deleteNotice(id);
        toast.success('Notice deleted successfully');
        fetchNotices(); // This will also recalculate stats
      } catch (error: any) {
        console.error('Error deleting notice:', error);
        toast.error(error.message || 'Failed to delete notice');
      }
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryBadgeClass = (category?: string | null) => {
    switch (category) {
      case 'Maintenance':
        return 'bg-blue-100 text-blue-800';
      case 'Events':
        return 'bg-purple-100 text-purple-800';
      case 'Security':
        return 'bg-red-100 text-red-800';
      case 'Financial':
        return 'bg-green-100 text-green-800';
      case 'Administrative':
        return 'bg-gray-100 text-gray-800';
      case 'Health':
        return 'bg-pink-100 text-pink-800';
      case 'Amenities':
        return 'bg-indigo-100 text-indigo-800';
      case 'Emergency':
        return 'bg-orange-100 text-orange-800';
      case 'Guidelines':
        return 'bg-teal-100 text-teal-800';
      case 'General':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="w-full mx-auto p-2">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-design-primary">Notice Board</h1>
          <p className="text-design-secondary mt-1">Manage society notices and announcements</p>
        </div>
        <Button
          onClick={handleAddNew}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Notice
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by notice title or content..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Society Filter */}
          <div>
            <select
              value={filters.societyFilter}
              onChange={(e) => setFilters({ ...filters, societyFilter: e.target.value })}
              disabled={societiesLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">All Societies</option>
              {societies.map((society) => (
                <option key={society._id} value={society._id}>
                  {society.societyName}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filters.categoryFilter}
              onChange={(e) => setFilters({ ...filters, categoryFilter: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Events">Events</option>
              <option value="Security">Security</option>
              <option value="Financial">Financial</option>
              <option value="Administrative">Administrative</option>
              <option value="Health">Health</option>
              <option value="Amenities">Amenities</option>
              <option value="Emergency">Emergency</option>
              <option value="Guidelines">Guidelines</option>
              <option value="General">General</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.statusFilter}
              onChange={(e) => setFilters({ ...filters, statusFilter: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Notices</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-design-description rounded-lg flex items-center justify-start xl:justify-center">
              <FileText className="w-6 h-6 text-design-primary" />
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
              <AlertTriangle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.inactive}</p>
            </div>
            <div className="w-12 h-12 bg-design-description rounded-lg flex items-center justify-start xl:justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.draft}</p>
            </div>
            <div className="w-12 h-12 bg-design-description rounded-lg flex items-center justify-start xl:justify-center">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Loading State */}
      {loading ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading notices...</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Notices List */}
          <div className="space-y-4">
            {notices.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No notices found</h3>
                <p className="text-gray-600 mb-4">
                  {filters.searchTerm || filters.societyFilter || filters.statusFilter || filters.categoryFilter
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first notice'}
                </p>
                {!filters.searchTerm && !filters.societyFilter && !filters.statusFilter && !filters.categoryFilter && (
                  <Button onClick={handleAddNew} className="bg-gray-900 hover:bg-gray-800 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Notice
                  </Button>
                )}
              </Card>
            ) : (
              notices.map((notice) => (
                <Card key={notice._id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-900 truncate">
                                {notice.title || 'Notice'}
                              </h3>
                              <div className="flex gap-2 flex-shrink-0">
                                {notice.category && (
                                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryBadgeClass(notice.category)}`}>
                                    {notice.category}
                                  </span>
                                )}
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(notice.status)}`}>
                                  {notice.status}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                              {notice.text.length > 200 ? `${notice.text.substring(0, 200)}...` : notice.text}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(notice.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 ml-4 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(notice._id)}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(notice._id)}
                            className="text-green-600 hover:bg-green-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(notice._id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
