import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, MapPin, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface TerritoryStatsProps {
  territoryData: Record<string, { pincode: string; members: number; communities: number }>;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(217, 91%, 60%)'];

export const TerritoryStats = ({ territoryData }: TerritoryStatsProps) => {
  // Growth trends data (mock data - in real app would come from database)
  const growthData = [
    { month: 'Jan', members: 6800, communities: 85 },
    { month: 'Feb', members: 7200, communities: 88 },
    { month: 'Mar', members: 7800, communities: 92 },
    { month: 'Apr', members: 8300, communities: 96 },
    { month: 'May', members: 8900, communities: 101 },
    { month: 'Jun', members: 9570, communities: 111 }
  ];

  // Territory distribution for pie chart
  const territoryDistribution = Object.entries(territoryData).map(([name, data]) => ({
    name,
    value: data.members
  }));

  // Top communities by members
  const topTerritories = Object.entries(territoryData)
    .sort((a, b) => b[1].members - a[1].members)
    .slice(0, 5)
    .map(([name, data]) => ({ name, members: data.members }));

  // Activity metrics
  const totalMembers = Object.values(territoryData).reduce((sum, t) => sum + t.members, 0);
  const totalCommunities = Object.values(territoryData).reduce((sum, t) => sum + t.communities, 0);
  const avgMembersPerTerritory = Math.round(totalMembers / Object.keys(territoryData).length);
  const growthRate = '+15%';

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">{growthRate}</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Communities</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCommunities}</div>
            <p className="text-xs text-muted-foreground">Across {Object.keys(territoryData).length} territories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Members/Territory</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgMembersPerTerritory}</div>
            <p className="text-xs text-muted-foreground">Active engagement rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Active</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topTerritories[0]?.name.split(' ')[0]}</div>
            <p className="text-xs text-muted-foreground">{topTerritories[0]?.members} members</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Growth Trends</CardTitle>
            <CardDescription>Member and community growth over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                members: { label: 'Members', color: 'hsl(var(--primary))' },
                communities: { label: 'Communities', color: 'hsl(var(--secondary))' }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="members" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="communities" stroke="hsl(var(--secondary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Territory Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Member Distribution</CardTitle>
            <CardDescription>Members across territories</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                members: { label: 'Members', color: 'hsl(var(--primary))' }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={territoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {territoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Territories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Territories</CardTitle>
            <CardDescription>By member count</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                members: { label: 'Members', color: 'hsl(var(--primary))' }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topTerritories}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="members" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Popular Communities */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Communities</CardTitle>
            <CardDescription>Most active communities by territory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topTerritories.map((territory, index) => (
                <div key={territory.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium">{territory.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {territoryData[territory.name]?.communities} communities
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{territory.members.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">members</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
