import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Clock,
  IndianRupee,
  Calendar,
  CheckCircle,
  QrCode,
  Filter,
  Search
} from 'lucide-react';
import { getAllAmenities, type Amenity } from '../../apis/amenityApi';

export const UserAmenitiesList: React.FC = () => {
  const navigate = useNavigate();
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPaid, setFilterPaid] = useState<string>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchAmenities();
  }, [currentPage, filterPaid]);

  const fetchAmenities = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        status: 'ACTIVE'
      };
      
      if (filterPaid !== 'all') {
        params.isPaid = filterPaid === 'paid' ? 'true' : 'false';
      }

      const response = await getAllAmenities(params);
      setAmenities(response.amenities);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
    } catch (error: any) {
      console.error('Error fetching amenities:', error);
      alert(error.message || 'Failed to fetch amenities');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (amenity: Amenity) => {
    // Navigate to booking page with amenity details
    navigate(`/amenities/book/${amenity._id}`, { state: { amenity } });
  };

  const filteredAmenities = amenities.filter(amenity =>
    amenity.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (time: string) => {
    return time;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Building2 className="w-8 h-8 text-blue-600" />
                Society Amenities
              </h1>
              <p className="text-gray-600 mt-2">Browse and book amenities in your society</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search amenities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
              <button
                onClick={() => setFilterPaid('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  filterPaid === 'all'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterPaid('free')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  filterPaid === 'free'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Free
              </button>
              <button
                onClick={() => setFilterPaid('paid')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  filterPaid === 'paid'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Paid
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-gray-600">
              <Building2 className="w-5 h-5" />
              <span className="text-sm font-medium">{totalItems} Amenities Available</span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading amenities...</p>
            </div>
          </div>
        ) : filteredAmenities.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Amenities Found</h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Try adjusting your search or filter options.'
                : 'No amenities are currently available in your society.'}
            </p>
          </div>
        ) : (
          <>
            {/* Amenities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAmenities.map((amenity) => (
                <div
                  key={amenity._id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
                >
                  {/* Image Section */}
                  {amenity.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={amenity.image} 
                        alt={amenity.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Header with status badge */}
                  <div className={`relative ${amenity.image ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'} p-6`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:scale-105 transition-transform">
                          {amenity.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          {amenity.isPaid ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                              <IndianRupee className="w-3 h-3" />
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              Free
                            </span>
                          )}
                        </div>
                      </div>
                      <Building2 className="w-8 h-8 text-white/80" />
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-4">
                    {/* Timing */}
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">Operating Hours</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatTime(amenity.startTime)} - {formatTime(amenity.endTime)}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    {amenity.isPaid && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <div className="bg-orange-50 p-2 rounded-lg">
                          <IndianRupee className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium">Booking Fee</p>
                          <p className="text-xl font-bold text-gray-900">
                            ₹{amenity.amount}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* QR Code */}
                    {amenity.isPaid && amenity.qrCode && (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-600">
                          <QrCode className="w-4 h-4" />
                          <span className="text-xs font-medium">QR Code Available for Payment</span>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => handleBookNow(amenity)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 group-hover:scale-105 transform"
                    >
                      <Calendar className="w-5 h-5" />
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalItems)}
                  </span>{' '}
                  of <span className="font-medium">{totalItems}</span> amenities
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first page, last page, current page, and pages around current
                      return page === 1 || 
                             page === totalPages || 
                             Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, index, array) => {
                      // Add ellipsis if there's a gap
                      if (index > 0 && page - array[index - 1] > 1) {
                        return [
                          <span key={`ellipsis-${page}`} className="px-2 py-2 text-gray-500">...</span>,
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                              page === currentPage
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ];
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                            page === currentPage
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

