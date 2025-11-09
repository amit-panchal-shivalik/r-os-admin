import { Card, Text, Group, ThemeIcon } from "@mantine/core";
import { ParkingCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ParkingData {
  name: string;
  occupied: number;
  available: number;
}

const mockData: ParkingData[] = [
  { name: "2 Wheeler", occupied: 128, available: 42 },
  { name: "4 Wheeler", occupied: 95, available: 30 },
  { name: "Visitor", occupied: 22, available: 38 },
  { name: "Reserved", occupied: 48, available: 12 },
];

export const ParkingUtilizationChart = () => {
  const totalOccupied = mockData.reduce((sum, item) => sum + item.occupied, 0);
  const totalAvailable = mockData.reduce((sum, item) => sum + item.available, 0);
  const utilizationPercentage = Math.round(
    (totalOccupied / (totalOccupied + totalAvailable)) * 100
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
          <ThemeIcon size={50} radius="md" variant="light" color="teal">
            <ParkingCircle size={28} />
          </ThemeIcon>
          <div>
            <Text size="sm" c="dimmed" fw={500}>
              Parking Utilization
            </Text>
            <Text size="xl" fw={700}>
              {utilizationPercentage}%
            </Text>
          </div>
        </Group>
        <div className="text-right">
          <Text size="xs" c="dimmed">
            Total Spots
          </Text>
          <Text size="lg" fw={600}>
            {totalOccupied + totalAvailable}
          </Text>
        </div>
      </Group>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={mockData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            stroke="#888"
          />
          <YAxis tick={{ fontSize: 12 }} stroke="#888" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px" }}
            iconType="circle"
          />
          <Bar
            dataKey="occupied"
            fill="#12b886"
            name="Occupied"
            radius={[8, 8, 0, 0]}
          />
          <Bar
            dataKey="available"
            fill="#99e9d4"
            name="Available"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <Group justify="space-between" mt="md" className="px-2">
        <div>
          <Text size="xs" c="dimmed">
            Occupied
          </Text>
          <Text size="lg" fw={600} c="teal">
            {totalOccupied}
          </Text>
        </div>
        <div>
          <Text size="xs" c="dimmed">
            Available
          </Text>
          <Text size="lg" fw={600} c="gray">
            {totalAvailable}
          </Text>
        </div>
      </Group>
    </Card>
  );
};

