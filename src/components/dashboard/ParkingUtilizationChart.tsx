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
import { useAuth } from "../../contexts/AuthContext";
import { useState, useEffect } from "react";

interface ParkingData {
  name: string;
  occupied: number;
  available: number;
}

// Mock data for Super Admin (MORE parking categories - all societies aggregated)
const superAdminData: ParkingData[] = [
  { name: "2 Wheeler", occupied: 485, available: 145 },      // Total across all societies
  { name: "4 Wheeler", occupied: 342, available: 98 },       // Total across all societies
  { name: "Visitor 2W", occupied: 78, available: 142 },      // Visitor two-wheeler
  { name: "Visitor 4W", occupied: 56, available: 104 },      // Visitor four-wheeler
  { name: "Reserved", occupied: 164, available: 36 },        // Reserved spots
  { name: "Disabled", occupied: 18, available: 32 },         // Disabled parking
  { name: "EV Charging", occupied: 24, available: 16 },      // Electric vehicle spots
];

// Mock data for Society Admin (LESS parking categories - single society only)
const societyAdminData: ParkingData[] = [
  { name: "2 Wheeler", occupied: 82, available: 28 },        // Single society
  { name: "4 Wheeler", occupied: 58, available: 17 },        // Single society
  { name: "Visitor", occupied: 15, available: 25 },          // Combined visitor
];

export const ParkingUtilizationChart = () => {
  const { admin } = useAuth();
  const [parkingData, setParkingData] = useState<ParkingData[]>([]);
  
  // Check if current user is society admin
  const isSocietyAdmin = admin?.roleKey === 'society_admin';

  useEffect(() => {
    // Load data based on role
    if (isSocietyAdmin) {
      setParkingData(societyAdminData);
    } else {
      setParkingData(superAdminData);
    }
  }, [isSocietyAdmin]);

  if (parkingData.length === 0) {
    return null;
  }

  const totalOccupied = parkingData.reduce((sum, item) => sum + item.occupied, 0);
  const totalAvailable = parkingData.reduce((sum, item) => sum + item.available, 0);
  const utilizationPercentage = Math.round(
    (totalOccupied / (totalOccupied + totalAvailable)) * 100
  );

  return (
    <Card
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
              {isSocietyAdmin && <Text size="xs" c="dimmed"> (Your Society)</Text>}
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
          data={parkingData}
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
      
      <Text size="xs" c="dimmed" mt="sm" ta="center">
        {isSocietyAdmin 
          ? `Showing parking data for your society (${parkingData.length} categories)` 
          : `Aggregated parking across all societies (${parkingData.length} categories)`}
      </Text>
    </Card>
  );
};

