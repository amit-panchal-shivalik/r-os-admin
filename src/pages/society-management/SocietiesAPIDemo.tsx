import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  getAllSocieties, 
  getSocietyById, 
  createSociety, 
  updateSociety, 
  deleteSociety,
  generateSocietyCode,
  getSocietyStats,
  Society 
} from '../../apis/societyApi';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

/**
 * This is a demo component showcasing all Society API integrations
 * Use this as a reference for implementing societies features
 */
export const SocietiesAPIDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);

  // Demo 1: Fetch all societies with pagination and filters
  const demoFetchSocieties = async () => {
    setLoading(true);
    try {
      const data = await getAllSocieties({
        page: 1,
        limit: 10,
        search: '',
        status: 'Pending',
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      });
      
      setSocieties(data.societies);
      console.log('✅ Societies fetched:', data);
      console.log('📊 Pagination:', data.pagination);
      toast.success(`Fetched ${data.societies.length} societies`);
    } catch (error: any) {
      console.error('❌ Error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Demo 2: Fetch single society by ID
  const demoFetchSocietyById = async (id: string) => {
    setLoading(true);
    try {
      const society = await getSocietyById(id);
      setSelectedSociety(society);
      console.log('✅ Society details:', society);
      toast.success('Society details fetched');
    } catch (error: any) {
      console.error('❌ Error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Demo 3: Create new society
  const demoCreateSociety = async () => {
    setLoading(true);
    try {
      // First generate unique code
      const { societyCode } = await generateSocietyCode();
      console.log('✅ Generated code:', societyCode);

      // Prepare society data
      const societyData = {
        societyName: 'Demo Society',
        societyCode,
        description: 'This is a demo society created via API',
        projectType: 'Residential',
        totalUnits: 100,
        totalBlocks: 5,
        totalFloors: 10,
        carpetAreaRange: '800-1200',
        projectStartDate: '2025-01-01',
        completionDate: '2026-12-31',
        developerName: 'Demo Developer',
        contactPersonName: 'John Doe',
        contactNumber: '9876543210',
        email: 'demo@example.com',
        alternateContact: '9876543211',
        address: {
          street: '123 Demo Street',
          city: 'Demo City',
          state: 'Demo State',
          pincode: '123456'
        },
        legalDocuments: {
          rera: {
            number: 'RERA123456',
            expiryDate: '2026-12-31'
          }
        },
        bankDetails: {
          bankName: 'Demo Bank',
          accountNumber: '1234567890',
          accountHolderName: 'Demo Society',
          ifscCode: 'DEMO0001234',
          branchName: 'Demo Branch',
          branchAddress: 'Demo Address'
        },
        taxInformation: {
          gstNumber: '22AAAAA0000A1Z5',
          panNumber: 'AAAAA1234A',
          tanNumber: 'DEMO12345A'
        },
        financialYear: {
          fyStartMonth: 'April',
          currentFinancialYear: '2024-2025'
        },
        maintenanceBillingCycle: 'Monthly',
        registeredMembersCount: 50
      };

      const newSociety = await createSociety(societyData);
      console.log('✅ Society created:', newSociety);
      toast.success('Society created successfully');
      
      // Refresh list
      demoFetchSocieties();
    } catch (error: any) {
      console.error('❌ Error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Demo 4: Update society
  const demoUpdateSociety = async (id: string) => {
    setLoading(true);
    try {
      const updates = {
        description: 'Updated description',
        totalUnits: 150,
        status: 'Active' as const
      };

      const updated = await updateSociety(id, updates);
      console.log('✅ Society updated:', updated);
      toast.success('Society updated successfully');
      
      // Refresh list
      demoFetchSocieties();
    } catch (error: any) {
      console.error('❌ Error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Demo 5: Delete society
  const demoDeleteSociety = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this society?')) {
      return;
    }

    setLoading(true);
    try {
      await deleteSociety(id);
      console.log('✅ Society deleted');
      toast.success('Society deleted successfully');
      
      // Refresh list
      demoFetchSocieties();
    } catch (error: any) {
      console.error('❌ Error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Demo 6: Fetch statistics
  const demoFetchStats = async () => {
    setLoading(true);
    try {
      const statsData = await getSocietyStats();
      setStats(statsData);
      console.log('✅ Statistics:', statsData);
      toast.success('Statistics fetched');
    } catch (error: any) {
      console.error('❌ Error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-load on mount
  useEffect(() => {
    demoFetchSocieties();
    demoFetchStats();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Societies API Integration Demo
        </h1>
        <p className="text-gray-600">
          This page demonstrates all API integrations. Check the browser console for detailed logs.
        </p>
      </div>

      {/* Statistics Card */}
      {stats && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-xl font-bold mb-4">📊 Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalMembers}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">🧪 Test API Functions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Button
            onClick={demoFetchSocieties}
            disabled={loading}
            className="w-full"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            Fetch All
          </Button>
          
          <Button
            onClick={demoFetchStats}
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            Fetch Stats
          </Button>
          
          <Button
            onClick={demoCreateSociety}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            Create Demo
          </Button>
        </div>
      </Card>

      {/* Societies List */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">📋 Societies ({societies.length})</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={demoFetchSocieties}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>

        {loading && societies.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : societies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No societies found. Create a demo society to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {societies.map((society) => (
              <div
                key={society._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">
                      {society.societyName}
                    </h3>
                    <span className="text-sm text-gray-600">
                      {society.societyCode}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        society.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : society.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {society.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {society.address.city}, {society.address.state} | Units: {society.totalUnits}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => demoFetchSocietyById(society._id)}
                    disabled={loading}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => demoUpdateSociety(society._id)}
                    disabled={loading}
                  >
                    Update
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => demoDeleteSociety(society._id)}
                    disabled={loading}
                    className="text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Selected Society Details */}
      {selectedSociety && (
        <Card className="p-6 bg-blue-50">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold">🔍 Selected Society Details</h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedSociety(null)}
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
          
          <pre className="bg-white p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(selectedSociety, null, 2)}
          </pre>
        </Card>
      )}

      {/* API Documentation */}
      <Card className="p-6 bg-gray-50">
        <h2 className="text-xl font-bold mb-4">📚 Quick Reference</h2>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-semibold text-gray-900">1. Fetch All Societies:</p>
            <code className="block bg-white p-2 rounded mt-1 text-xs">
              const data = await getAllSocieties(&#123; page: 1, limit: 10, status: 'Pending' &#125;);
            </code>
          </div>
          
          <div>
            <p className="font-semibold text-gray-900">2. Fetch By ID:</p>
            <code className="block bg-white p-2 rounded mt-1 text-xs">
              const society = await getSocietyById(id);
            </code>
          </div>
          
          <div>
            <p className="font-semibold text-gray-900">3. Create Society:</p>
            <code className="block bg-white p-2 rounded mt-1 text-xs">
              const &#123; societyCode &#125; = await generateSocietyCode();
              <br />
              const society = await createSociety(data, files);
            </code>
          </div>
          
          <div>
            <p className="font-semibold text-gray-900">4. Update Society:</p>
            <code className="block bg-white p-2 rounded mt-1 text-xs">
              const updated = await updateSociety(id, partialData, files);
            </code>
          </div>
          
          <div>
            <p className="font-semibold text-gray-900">5. Delete Society:</p>
            <code className="block bg-white p-2 rounded mt-1 text-xs">
              await deleteSociety(id);
            </code>
          </div>
          
          <div>
            <p className="font-semibold text-gray-900">6. Get Statistics:</p>
            <code className="block bg-white p-2 rounded mt-1 text-xs">
              const stats = await getSocietyStats();
            </code>
          </div>
        </div>
      </Card>
    </div>
  );
};

