import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, Search, Navigation, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TerritoryMap } from '@/components/TerritoryMap';
import { TerritoryStats } from '@/components/TerritoryStats';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGeolocation, calculateDistance } from '@/hooks/useGeolocation';
import { Alert, AlertDescription } from '@/components/ui/alert';

const territoryData = {
  'Mumbai': { pincode: '400001', members: 1250, communities: 15 },
  'Delhi': { pincode: '110001', members: 980, communities: 12 },
  'Bangalore': { pincode: '560001', members: 1450, communities: 18 },
  'Kolkata': { pincode: '700001', members: 890, communities: 10 },
  'Hyderabad': { pincode: '500001', members: 1100, communities: 14 },
  'Katra (Vaishno Devi)': { pincode: '182301', members: 450, communities: 6 },
  'Ahmedabad': { pincode: '380001', members: 1350, communities: 16 },
  'Surat': { pincode: '395001', members: 920, communities: 11 },
  'Vadodara': { pincode: '390001', members: 780, communities: 9 }
};

// Territory centers for distance calculation
const territoryCenters: Record<string, [number, number]> = {
  'Mumbai': [19.0760, 72.8777],
  'Delhi': [28.7041, 77.1025],
  'Bangalore': [12.9716, 77.5946],
  'Kolkata': [22.5726, 88.3639],
  'Hyderabad': [17.3850, 78.4867],
  'Katra (Vaishno Devi)': [32.9915, 74.9320],
  'Ahmedabad': [23.0225, 72.5714],
  'Surat': [21.1702, 72.8311],
  'Vadodara': [22.3072, 73.2080]
};

export default function Territories() {
  const navigate = useNavigate();
  const [selectedTerritory, setSelectedTerritory] = useState<string>('');
  const { latitude, longitude, error: locationError, loading: locationLoading } = useGeolocation();

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return data;
    }
  });

  const { data: territoryCommunities } = useQuery({
    queryKey: ['territory-communities', selectedTerritory],
    queryFn: async () => {
      if (!selectedTerritory) return [];

      const { data } = await supabase
        .from('communities')
        .select('id, name, description, category, banner_url')
        .eq('territory', selectedTerritory)
        .eq('status', 'active')
        .limit(5);

      return data || [];
    },
    enabled: !!selectedTerritory
  });

  // Calculate distances and find nearest territories
  const territoriesWithDistance = latitude && longitude
    ? Object.entries(territoryCenters).map(([name, [lat, lng]]) => ({
        name,
        distance: calculateDistance(latitude, longitude, lat, lng),
        ...territoryData[name as keyof typeof territoryData]
      })).sort((a, b) => a.distance - b.distance)
    : [];

  const nearestTerritory = territoriesWithDistance[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Territories</h1>
            <p className="text-muted-foreground">Explore communities across different regions</p>
          </div>
        </div>

        {/* Location Detection Alert */}
        {!locationLoading && latitude && longitude && nearestTerritory && (
          <Alert className="mb-6 border-primary/50 bg-primary/5">
            <Navigation className="h-4 w-4 text-primary" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <span className="font-medium">Nearest Territory: {nearestTerritory.name}</span>
                <span className="text-muted-foreground ml-2">
                  (~{nearestTerritory.distance} km away)
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => setSelectedTerritory(nearestTerritory.name)}
              >
                Explore
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Location Error */}
        {locationError && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>
              Unable to detect location: {locationError}
            </AlertDescription>
          </Alert>
        )}

        {/* Current Territory Badge */}
        {userProfile?.territory && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Your Territory</p>
                  <p className="font-semibold">{userProfile.territory}</p>
                </div>
                <Badge variant="secondary" className="ml-auto">
                  {userProfile.pincode}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="map" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-6">
            {/* Territory Selector */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Select value={selectedTerritory} onValueChange={setSelectedTerritory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a territory to explore" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(territoryData).map((territory) => (
                    <SelectItem key={territory} value={territory}>
                      {territory}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Nearby Territories */}
        {territoriesWithDistance.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Nearby Territories</CardTitle>
              <CardDescription>Sorted by distance from your location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {territoriesWithDistance.slice(0, 6).map((territory) => (
                  <div
                    key={territory.name}
                    className="p-4 rounded-lg border hover:border-primary hover:bg-accent cursor-pointer transition-all"
                    onClick={() => setSelectedTerritory(territory.name)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{territory.name}</h3>
                      <Badge variant="outline" className="ml-2">
                        {territory.distance} km
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {territory.members}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {territory.communities}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Map */}
        <div className="mb-6">
          <TerritoryMap
            selectedTerritory={selectedTerritory}
            onTerritorySelect={setSelectedTerritory}
            showLabels={true}
          />
        </div>

        {/* Territory Info */}
        {selectedTerritory && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{selectedTerritory}</CardTitle>
                <CardDescription>Territory Overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Pincode</span>
                    </div>
                    <Badge variant="outline">
                      {territoryData[selectedTerritory as keyof typeof territoryData]?.pincode}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Members</span>
                    </div>
                    <Badge variant="outline">
                      {territoryData[selectedTerritory as keyof typeof territoryData]?.members}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Communities</span>
                    </div>
                    <Badge variant="outline">
                      {territoryData[selectedTerritory as keyof typeof territoryData]?.communities}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Communities</CardTitle>
                <CardDescription>Active communities in {selectedTerritory}</CardDescription>
              </CardHeader>
              <CardContent>
                {territoryCommunities && territoryCommunities.length > 0 ? (
                  <div className="space-y-3">
                    {territoryCommunities.map((community) => (
                      <div
                        key={community.id}
                        className="p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => navigate(`/community/${community.id}`)}
                      >
                        <div className="font-medium">{community.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {community.description}
                        </div>
                        <Badge variant="secondary" className="mt-2">
                          {community.category}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No communities found in this territory</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
          </TabsContent>

          <TabsContent value="stats">
            <TerritoryStats territoryData={territoryData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
