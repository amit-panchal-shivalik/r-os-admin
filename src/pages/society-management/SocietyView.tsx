import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  ArrowLeft,
  Building,
  MapPin,
  Phone,
  Users,
  Calendar,
  Home,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import { getSocietyDetails, deleteSociety, type SocietyDetails } from '../../apis/societyApi';
import { useToast } from '../../hooks/use-toast';

const SocietyView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State management
  const [societyData, setSocietyData] = useState<SocietyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  // Fetch society details from API
  useEffect(() => {
    const fetchSocietyDetails = async () => {
      if (!id) {
        setError('Society ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getSocietyDetails(id, selectedBlock || undefined);
        setSocietyData(data);

        // Set first block as default if not selected
        if (!selectedBlock && data.blocks.length > 0) {
          setSelectedBlock(data.blocks[0].blockLetter);
        }
      } catch (err: any) {
        console.error('Error fetching society details:', err);
        setError(err.message || 'Failed to fetch society details');
        toast({
          title: 'Error',
          description: 'Failed to load society details. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSocietyDetails();
  }, [id, selectedBlock, toast]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUnitStatusBadgeClass = (booked: boolean) => {
    return booked ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const handleBack = () => {
    navigate('/societies');
  };

  const handleEdit = () => {
    navigate(`/societies/edit/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this society? This action cannot be undone.')) {
      try {
        if (id) {
          await deleteSociety(id);
          toast({
            title: 'Success',
            description: 'Society deleted successfully',
          });
          navigate('/societies');
        }
      } catch (err: any) {
        console.error('Error deleting society:', err);
        toast({
          title: 'Error',
          description: err.message || 'Failed to delete society',
          variant: 'destructive',
        });
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full mx-auto p-2 flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-design-primary mx-auto mb-4" />
          <p className="text-design-secondary">Loading society details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !societyData) {
    return (
      <div className="w-full mx-auto p-2">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={handleBack}
            variant="outline"
            className="flex items-center text-design-primary hover:bg-design-description"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-design-primary">Society Not Found</h1>
        </div>
        <Card className="p-6 text-center">
          <p className="text-design-secondary">{error || 'Society details could not be loaded'}</p>
          <Button onClick={handleBack} className="mt-4">
            Back to Societies
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-2 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={handleBack}
            variant="outline"
            className="flex items-center text-design-primary hover:bg-design-description"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div>
            <h1 className="text-3xl font-bold text-design-primary">{societyData.societyInfo.name}</h1>
            <p className="text-design-secondary mt-1">Society Details & Unit Management</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleEdit}
            variant="outline"
            className="flex items-center gap-2 text-design-primary hover:bg-design-description"
          >
            <Edit className="w-4 h-4" />
            Edit Society
          </Button>
          <Button
            onClick={handleDelete}
            variant="outline"
            className="flex items-center gap-2 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Society Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-design-secondary">Total Blocks</p>
              <p className="text-2xl font-bold text-design-primary mt-1">{societyData.societyInfo.totalBlocks}</p>
            </div>
            <div className="w-12 h-12 bg-design-description rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-design-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-design-secondary">Total Units</p>
              <p className="text-2xl font-bold text-design-primary mt-1">{societyData.statistics.totalUnits}</p>
            </div>
            <div className="w-12 h-12 bg-design-description rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-design-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-design-secondary">Floors per Block</p>
              <p className="text-2xl font-bold text-design-primary mt-1">{societyData.societyInfo.floorsPerBlock}</p>
            </div>
            <div className="w-12 h-12 bg-design-description rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-design-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-design-secondary">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${getStatusBadgeClass(societyData.societyInfo.status)}`}>
                {societyData.societyInfo.status}
              </span>
            </div>
            <div className="w-12 h-12 bg-design-description rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-design-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Occupancy Statistics */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-design-primary mb-4">Occupancy Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-design-secondary">Booked Units</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{societyData.statistics.bookedUnits}</p>
          </div>
          <div>
            <p className="text-sm text-design-secondary">Unbooked Units</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{societyData.statistics.unbookedUnits}</p>
          </div>
          <div>
            <p className="text-sm text-design-secondary">Occupancy Rate</p>
            <p className="text-3xl font-bold text-design-primary mt-1">{societyData.statistics.occupancyRate.toFixed(2)}%</p>
          </div>
        </div>
      </Card>

      {/* Block Tabs */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-design-primary mb-6">Block & Unit Details</h2>

        <Tabs value={selectedBlock || undefined} onValueChange={setSelectedBlock} className="w-full">
          <TabsList className={`grid w-full mb-6`} style={{ gridTemplateColumns: `repeat(${societyData.blocks.length}, 1fr)` }}>
            {societyData.blocks.map((block) => (
              <TabsTrigger key={block.blockLetter} value={block.blockLetter} className="text-sm">
                Block {block.blockLetter}
              </TabsTrigger>
            ))}
          </TabsList>

          {societyData.blocks.map((block) => (
            <TabsContent key={block.blockLetter} value={block.blockLetter} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-design-primary">Block {block.blockLetter}</h3>
                  <p className="text-sm text-design-secondary">
                    {block.totalFloors} Floors • {block.totalUnits} Units • {block.bookedUnits} Booked
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-design-secondary">Occupancy Rate</p>
                  <p className="text-lg font-bold text-design-primary">
                    {block.totalUnits > 0 ? ((block.bookedUnits / block.totalUnits) * 100).toFixed(2) : 0}%
                  </p>
                </div>
              </div>

              {/* Group units by floor */}
              <div className="space-y-6">
                {block.floors.map((floor) => (
                  <div key={floor.floorNumber} className="border border-design-border rounded-lg p-4">
                    <h4 className="text-md font-medium text-design-primary mb-3">
                      Floor {floor.floorNumber}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {floor.units.map((unit) => (
                        <Card
                          key={unit.unitNumber}
                          className="p-4 hover:shadow-md transition-shadow cursor-pointer hover:bg-design-description/20"
                          onClick={() => {
                            // TODO: Navigate to unit detail page or show unit details modal
                            toast({
                              title: unit.unitNumber,
                              description: `Status: ${unit.booked ? 'Booked' : 'Unbooked'} | Type: ${unit.residentType}${unit.phoneNumber ? ` | Phone: ${unit.phoneNumber}` : ''}`,
                            });
                          }}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="font-semibold text-design-primary">{unit.unitNumber}</h5>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getUnitStatusBadgeClass(unit.booked)}`}>
                                {unit.booked ? 'Booked' : 'Unbooked'}
                              </span>
                            </div>
                            <div className="text-xs text-design-secondary">
                              <p>{unit.residentType}</p>
                              {unit.phoneNumber && <p className="truncate">📞 {unit.phoneNumber}</p>}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
};

export default SocietyView;
