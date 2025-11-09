import { Card, Text, Group, ThemeIcon, Badge } from "@mantine/core";
import { ClipboardCheck } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { useAuth } from "../../contexts/AuthContext";
import { useState, useEffect } from "react";

interface SLAData {
  month: string;
  avgResponseDays: number;
  avgResolutionDays: number;
  targetDays: number;
}

// Mock data for Super Admin (MORE data points - 24 months / 2 years)
// Professional data showing long-term improvement journey: High days (worse) → Mid-range (moderate)
// Extended timeline shows comprehensive performance tracking for all societies
const superAdminData: SLAData[] = [
  // Year 1 - Starting poor and gradual improvement
  { month: "Jan '23", avgResponseDays: 7.5, avgResolutionDays: 11.2, targetDays: 3.0 },  // Very poor start
  { month: "Feb '23", avgResponseDays: 7.2, avgResolutionDays: 10.8, targetDays: 3.0 },
  { month: "Mar '23", avgResponseDays: 6.9, avgResolutionDays: 10.4, targetDays: 3.0 },
  { month: "Apr '23", avgResponseDays: 6.6, avgResolutionDays: 10.0, targetDays: 3.0 },
  { month: "May '23", avgResponseDays: 6.3, avgResolutionDays: 9.6, targetDays: 3.0 },
  { month: "Jun '23", avgResponseDays: 6.0, avgResolutionDays: 9.2, targetDays: 3.0 },
  { month: "Jul '23", avgResponseDays: 5.7, avgResolutionDays: 8.8, targetDays: 3.0 },
  { month: "Aug '23", avgResponseDays: 5.4, avgResolutionDays: 8.4, targetDays: 3.0 },
  { month: "Sep '23", avgResponseDays: 5.1, avgResolutionDays: 8.0, targetDays: 3.0 },
  { month: "Oct '23", avgResponseDays: 4.8, avgResolutionDays: 7.6, targetDays: 3.0 },
  { month: "Nov '23", avgResponseDays: 4.5, avgResolutionDays: 7.2, targetDays: 3.0 },
  { month: "Dec '23", avgResponseDays: 4.2, avgResolutionDays: 6.8, targetDays: 3.0 },
  
  // Year 2 - Continued improvement towards target
  { month: "Jan '24", avgResponseDays: 3.9, avgResolutionDays: 6.4, targetDays: 3.0 },
  { month: "Feb '24", avgResponseDays: 3.7, avgResolutionDays: 6.0, targetDays: 3.0 },
  { month: "Mar '24", avgResponseDays: 3.5, avgResolutionDays: 5.6, targetDays: 3.0 },
  { month: "Apr '24", avgResponseDays: 3.4, avgResolutionDays: 5.2, targetDays: 3.0 },
  { month: "May '24", avgResponseDays: 3.3, avgResolutionDays: 4.8, targetDays: 3.0 },
  { month: "Jun '24", avgResponseDays: 3.2, avgResolutionDays: 4.6, targetDays: 3.0 },
  { month: "Jul '24", avgResponseDays: 3.1, avgResolutionDays: 4.4, targetDays: 3.0 },
  { month: "Aug '24", avgResponseDays: 3.0, avgResolutionDays: 4.2, targetDays: 3.0 },  // Response meets target!
  { month: "Sep '24", avgResponseDays: 2.9, avgResolutionDays: 4.0, targetDays: 3.0 },
  { month: "Oct '24", avgResponseDays: 2.8, avgResolutionDays: 3.9, targetDays: 3.0 },
  { month: "Nov '24", avgResponseDays: 2.8, avgResolutionDays: 3.8, targetDays: 3.0 },
  { month: "Dec '24", avgResponseDays: 2.8, avgResolutionDays: 3.8, targetDays: 3.0 },  // Stabilized at mid-range
];

// Mock data for Society Admin (LESS data points - 4 months only)
// Shows only recent performance for single society
const societyAdminData: SLAData[] = [
  { month: "Sep", avgResponseDays: 3.7, avgResolutionDays: 5.8, targetDays: 3.0 },  // Starting point
  { month: "Oct", avgResponseDays: 3.2, avgResolutionDays: 5.0, targetDays: 3.0 },  // Improving
  { month: "Nov", avgResponseDays: 2.9, avgResolutionDays: 4.4, targetDays: 3.0 },  // Better
  { month: "Dec", avgResponseDays: 2.7, avgResolutionDays: 4.0, targetDays: 3.0 },  // Current - approaching target
];

export const MaintenanceSLAChart = () => {
  const { admin } = useAuth();
  const [slaData, setSlaData] = useState<SLAData[]>([]);
  
  // Check if current user is society admin
  const isSocietyAdmin = admin?.roleKey === 'society_admin';

  useEffect(() => {
    // Load data based on role
    if (isSocietyAdmin) {
      setSlaData(societyAdminData);
    } else {
      setSlaData(superAdminData);
    }
  }, [isSocietyAdmin]);

  if (slaData.length === 0) {
    return null;
  }

  const currentMonth = slaData[slaData.length - 1];
  const avgDays = ((currentMonth.avgResponseDays + currentMonth.avgResolutionDays) / 2).toFixed(1);
  const isCompliant = (currentMonth.avgResponseDays <= currentMonth.targetDays && 
                       currentMonth.avgResolutionDays <= currentMonth.targetDays);

  return (
    <Card
      padding="lg"
      radius="md"
      withBorder
      className="hover:shadow-md transition-shadow duration-200 h-full"
    >
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          <ThemeIcon size={50} radius="md" variant="light" color="yellow">
            <ClipboardCheck size={28} />
          </ThemeIcon>
          <div>
            <Text size="sm" c="dimmed" fw={500}>
              Maintenance SLA Compliance
              {isSocietyAdmin 
                ? <Text size="xs" c="dimmed"> (Last 4 months)</Text>
                : <Text size="xs" c="dimmed"> (Last 24 months)</Text>
              }
            </Text>
            <Text size="xl" fw={700}>
              {avgDays} days
            </Text>
            <Text size="xs" c="dimmed">
              {parseFloat(avgDays) <= 3 ? '✓ Meeting SLA target' : 'Working towards target'}
            </Text>
          </div>
        </Group>
        <Badge
          color={isCompliant ? "teal" : "orange"}
          variant="light"
          size="lg"
        >
          {isCompliant ? "✓ On Track" : "⚠ Improving"}
        </Badge>
      </Group>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={slaData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fab005" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#fab005" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorResolution" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ffd43b" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ffd43b" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12 }}
            stroke="#888"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#888"
            domain={[0, 10]}
            label={{ value: 'Days (Lower is Better)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
            formatter={(value: number) => `${value.toFixed(1)} days`}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px" }}
            iconType="circle"
          />
          <Area
            type="monotone"
            dataKey="targetDays"
            stroke="#e9ecef"
            fill="none"
            strokeDasharray="5 5"
            strokeWidth={2}
            name="Target (3 days)"
          />
          <Area
            type="monotone"
            dataKey="avgResponseDays"
            stroke="#fab005"
            fillOpacity={1}
            fill="url(#colorResponse)"
            name="Avg Response Time"
          />
          <Area
            type="monotone"
            dataKey="avgResolutionDays"
            stroke="#ffd43b"
            fillOpacity={1}
            fill="url(#colorResolution)"
            name="Avg Resolution Time"
          />
        </AreaChart>
      </ResponsiveContainer>

      <Group justify="space-around" mt="md" className="px-2">
        <div className="text-center">
          <Text size="xs" c="dimmed">
            Avg Response Time
          </Text>
          <Text size="lg" fw={600} c={currentMonth.avgResponseDays <= 3 ? "teal" : "yellow"}>
            {currentMonth.avgResponseDays.toFixed(1)}d
          </Text>
          <Text size="xs" c="dimmed">
            {currentMonth.avgResponseDays <= 3 ? '✓ Target met' : 'Improving'}
          </Text>
        </div>
        <div className="text-center">
          <Text size="xs" c="dimmed">
            Avg Resolution Time
          </Text>
          <Text size="lg" fw={600} c={currentMonth.avgResolutionDays <= 3 ? "teal" : "yellow"}>
            {currentMonth.avgResolutionDays.toFixed(1)}d
          </Text>
          <Text size="xs" c="dimmed">
            {currentMonth.avgResolutionDays <= 3 ? '✓ Target met' : 'In progress'}
          </Text>
        </div>
        <div className="text-center">
          <Text size="xs" c="dimmed">
            SLA Target
          </Text>
          <Text size="lg" fw={600} c="gray">
            {currentMonth.targetDays.toFixed(1)}d
          </Text>
          <Text size="xs" c="dimmed">
            Benchmark
          </Text>
        </div>
      </Group>
      
      <Text size="xs" c="dimmed" mt="sm" ta="center">
        {isSocietyAdmin 
          ? `Showing last 4 months of performance for your society` 
          : `Comprehensive 2-year performance trend across all societies (${slaData.length} months) - showing ${parseFloat(avgDays) <= 3 ? 'sustained' : 'positive'} improvement`}
      </Text>
    </Card>
  );
};

