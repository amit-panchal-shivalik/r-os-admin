import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, CheckCircle, Clock, XCircle, CreditCard } from 'lucide-react';
import { getPaymentStatistics, adminGetAllPayments, type PaymentStatistics } from '../../apis/amenityPaymentApi';
import { getAllSocieties } from '../../apis/societyApi';
import { getAllAmenities } from '../../apis/amenityApi';

export const PaymentStatistics: React.FC = () => {
  const [statistics, setStatistics] = useState<PaymentStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [societies, setSocieties] = useState<any[]>([]);
  const [amenities, setAmenities] = useState<any[]>([]);
  
  // Filters
  const [selectedSociety, setSelectedSociety] = useState('');
  const [selectedAmenity, setSelectedAmenity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchStatistics();
    fetchSocieties();
    fetchAmenities();
  }, [selectedSociety, selectedAmenity, startDate, endDate]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const stats = await getPaymentStatistics({
        society: selectedSociety || undefined,
        amenity: selectedAmenity || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });
      setStatistics(stats);
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      alert(error.response?.data?.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchSocieties = async () => {
    try {
      const response = await getAllSocieties({ limit: 100, status: 'Active' });
      setSocieties(response.societies);
    } catch (error) {
      console.error('Error fetching societies:', error);
    }
  };

  const fetchAmenities = async () => {
    try {
      const response = await getAllAmenities({ limit: 100, status: 'ACTIVE' });
      setAmenities(response.amenities);
    } catch (error) {
      console.error('Error fetching amenities:', error);
    }
  };

  const handleClearFilters = () => {
    setSelectedSociety('');
    setSelectedAmenity('');
    setStartDate('');
    setEndDate('');
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 text-lg">Loading statistics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payment Statistics</h1>
        <p className="text-gray-600 mt-1">Overview of amenity bookings and revenue</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Filter Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Society Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Society</label>
            <select
              value={selectedSociety}
              onChange={(e) => setSelectedSociety(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Societies</option>
              {societies.map((society) => (
                <option key={society._id} value={society._id}>
                  {society.societyName}
                </option>
              ))}
            </select>
          </div>

          {/* Amenity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amenity</label>
            <select
              value={selectedAmenity}
              onChange={(e) => setSelectedAmenity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Amenities</option>
              {amenities.map((amenity) => (
                <option key={amenity._id} value={amenity._id}>
                  {amenity.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <>
          {/* Revenue Card - Full Width */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 rounded-lg shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium uppercase tracking-wider">Total Revenue</p>
                <p className="text-5xl font-bold mt-2">₹{statistics.totalRevenue.toLocaleString('en-IN')}</p>
                <p className="text-green-100 mt-2">
                  From {statistics.successfulPayments} successful payments
                </p>
              </div>
              <div className="bg-white/20 p-6 rounded-full">
                <DollarSign className="w-16 h-16" />
              </div>
            </div>
          </div>

          {/* Main Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Bookings */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{statistics.totalBookings}</p>
                </div>
                <div className="bg-blue-100 p-4 rounded-full">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Successful Payments */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Successful</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{statistics.successfulPayments}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {statistics.successRate}% success rate
                  </p>
                </div>
                <div className="bg-green-100 p-4 rounded-full">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Pending Payments */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{statistics.pendingPayments}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {((statistics.pendingPayments / statistics.totalBookings) * 100).toFixed(1)}% of total
                  </p>
                </div>
                <div className="bg-yellow-100 p-4 rounded-full">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </div>

            {/* Failed Payments */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Failed</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{statistics.failedPayments}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {((statistics.failedPayments / statistics.totalBookings) * 100).toFixed(1)}% of total
                  </p>
                </div>
                <div className="bg-red-100 p-4 rounded-full">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Success Rate Card */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Success Rate</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Success Rate</span>
                  <span className="text-2xl font-bold text-green-600">{statistics.successRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${statistics.successRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Avg. per Booking</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    ₹{statistics.totalBookings > 0 ? (statistics.totalRevenue / statistics.totalBookings).toFixed(0) : '0'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Avg. Success Revenue</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    ₹{statistics.successfulPayments > 0 ? (statistics.totalRevenue / statistics.successfulPayments).toFixed(0) : '0'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Conversion</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {statistics.totalBookings > 0 ? ((statistics.successfulPayments / statistics.totalBookings) * 100).toFixed(1) : '0'}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900">Success</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{statistics.successfulPayments}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-gray-900">Pending</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-600">{statistics.pendingPayments}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-gray-900">Failed</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">{statistics.failedPayments}</span>
                </div>
              </div>
            </div>

            {/* Quick Insights */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Insights</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Total Transactions</p>
                    <p className="text-sm text-gray-600">{statistics.totalBookings} bookings processed</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Revenue Generated</p>
                    <p className="text-sm text-gray-600">₹{statistics.totalRevenue.toLocaleString('en-IN')} collected successfully</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Pending Revenue</p>
                    <p className="text-sm text-gray-600">{statistics.pendingPayments} payments awaiting completion</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

