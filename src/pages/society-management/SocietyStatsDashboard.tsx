import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { getSocietyStats } from '../../apis/societyApi';
import { toast } from 'sonner';
import { Building, Users, TrendingUp, Loader2, RefreshCw, BarChart3 } from 'lucide-react';

/**
 * Society Statistics Dashboard
 * Displays comprehensive statistics including breakdowns by type and project type
 */
export const SocietyStatsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{
    total: number;
    active: number;
    pending: number;
    inactive: number;
    totalMembers: number;
    byType: Record<string, number>;
    byProjectType: Record<string, number>;
  } | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getSocietyStats();
      setStats(data);
      console.log('✅ Stats fetched:', data);
    } catch (error: any) {
      console.error('❌ Error:', error);
      toast.error(error.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-600">Failed to load statistics</p>
        <Button onClick={fetchStats} className="mt-4">
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Statistics Dashboard</h2>
          <p className="text-gray-600 mt-1">Real-time society analytics</p>
        </div>
        <Button
          onClick={fetchStats}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Societies</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Active</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{stats.active}</p>
              <p className="text-xs text-green-600 mt-1">
                {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Pending</p>
              <p className="text-3xl font-bold text-yellow-900 mt-2">{stats.pending}</p>
              <p className="text-xs text-yellow-600 mt-1">
                {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}% of total
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Total Members</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">
                {stats.totalMembers.toLocaleString()}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                {stats.total > 0 ? Math.round(stats.totalMembers / stats.total) : 0} avg/society
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Type */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">By Type</h3>
              <p className="text-sm text-gray-600">Distribution by society type</p>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(stats.byType).length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No data available</p>
            ) : (
              Object.entries(stats.byType).map(([type, count]) => {
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                const displayType = type === 'null' ? 'Not Specified' : type;
                
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{displayType}</span>
                      <span className="text-sm text-gray-600">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Type Summary */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">Total Types</span>
              <span className="text-sm font-bold text-indigo-600">
                {Object.keys(stats.byType).length}
              </span>
            </div>
          </div>
        </Card>

        {/* By Project Type */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">By Project Type</h3>
              <p className="text-sm text-gray-600">Distribution by project category</p>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(stats.byProjectType).length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No data available</p>
            ) : (
              Object.entries(stats.byProjectType).map(([projectType, count]) => {
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                
                return (
                  <div key={projectType} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{projectType}</span>
                      <span className="text-sm text-gray-600">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Project Type Summary */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">Total Project Types</span>
              <span className="text-sm font-bold text-emerald-600">
                {Object.keys(stats.byProjectType).length}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Raw JSON View (for developers) */}
      <Card className="p-6 bg-gray-50">
        <details className="cursor-pointer">
          <summary className="text-sm font-semibold text-gray-700 mb-2">
            📋 View Raw JSON Response
          </summary>
          <pre className="bg-white p-4 rounded-lg overflow-auto text-xs mt-2 border">
            {JSON.stringify(stats, null, 2)}
          </pre>
        </details>
      </Card>

      {/* Integration Code Example */}
      <Card className="p-6 bg-blue-50">
        <h3 className="text-lg font-bold text-gray-900 mb-4">💻 Integration Code</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">1. Import the function:</p>
            <pre className="bg-white p-3 rounded text-xs overflow-auto">
{`import { getSocietyStats } from '../../apis/societyApi';`}
            </pre>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">2. Fetch statistics:</p>
            <pre className="bg-white p-3 rounded text-xs overflow-auto">
{`const stats = await getSocietyStats();

// Returns:
// {
//   total: 1,
//   active: 0,
//   pending: 1,
//   inactive: 0,
//   totalMembers: 10,
//   byType: { "null": 1 },
//   byProjectType: { "Residential": 1 }
// }`}
            </pre>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">3. Use in your component:</p>
            <pre className="bg-white p-3 rounded text-xs overflow-auto">
{`const [stats, setStats] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await getSocietyStats();
      setStats(data);
    } catch (error) {
      console.error(error);
    }
  };
  fetchData();
}, []);`}
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
};

