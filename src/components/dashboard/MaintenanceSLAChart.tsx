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

interface SLAData {
  month: string;
  responseTime: number;
  resolutionTime: number;
  target: number;
}

const mockData: SLAData[] = [
  { month: "Jan", responseTime: 88, resolutionTime: 85, target: 90 },
  { month: "Feb", responseTime: 91, resolutionTime: 87, target: 90 },
  { month: "Mar", responseTime: 93, resolutionTime: 90, target: 90 },
  { month: "Apr", responseTime: 89, resolutionTime: 86, target: 90 },
  { month: "May", responseTime: 94, resolutionTime: 91, target: 90 },
  { month: "Jun", responseTime: 92, resolutionTime: 89, target: 90 },
];

export const MaintenanceSLAChart = () => {
  const currentMonth = mockData[mockData.length - 1];
  const avgCompliance = Math.round(
    (currentMonth.responseTime + currentMonth.resolutionTime) / 2
  );

  return (
    <Card
      shadow="sm"
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
            </Text>
            <Text size="xl" fw={700}>
              {avgCompliance}%
            </Text>
          </div>
        </Group>
        <Badge
          color={avgCompliance >= 90 ? "teal" : "orange"}
          variant="light"
          size="lg"
        >
          {avgCompliance >= 90 ? "On Track" : "Needs Attention"}
        </Badge>
      </Group>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={mockData}
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
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
            formatter={(value: number) => `${value}%`}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px" }}
            iconType="circle"
          />
          <Area
            type="monotone"
            dataKey="target"
            stroke="#e9ecef"
            fill="none"
            strokeDasharray="5 5"
            name="Target (90%)"
          />
          <Area
            type="monotone"
            dataKey="responseTime"
            stroke="#fab005"
            fillOpacity={1}
            fill="url(#colorResponse)"
            name="Response Time"
          />
          <Area
            type="monotone"
            dataKey="resolutionTime"
            stroke="#ffd43b"
            fillOpacity={1}
            fill="url(#colorResolution)"
            name="Resolution Time"
          />
        </AreaChart>
      </ResponsiveContainer>

      <Group justify="space-around" mt="md" className="px-2">
        <div className="text-center">
          <Text size="xs" c="dimmed">
            Response Time
          </Text>
          <Text size="lg" fw={600} c="yellow">
            {currentMonth.responseTime}%
          </Text>
        </div>
        <div className="text-center">
          <Text size="xs" c="dimmed">
            Resolution Time
          </Text>
          <Text size="lg" fw={600} c="yellow">
            {currentMonth.resolutionTime}%
          </Text>
        </div>
        <div className="text-center">
          <Text size="xs" c="dimmed">
            Target
          </Text>
          <Text size="lg" fw={600} c="gray">
            {currentMonth.target}%
          </Text>
        </div>
      </Group>
    </Card>
  );
};

