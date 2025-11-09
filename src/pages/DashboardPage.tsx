import { Container, Title, Grid, Text } from "@mantine/core";
import { StatCard } from "../components/dashboard/StatCard";
import { ParkingUtilizationChart } from "../components/dashboard/ParkingUtilizationChart";
import { MaintenanceSLAChart } from "../components/dashboard/MaintenanceSLAChart";
import {
  Building2,
  IndianRupee,
  AlertCircle,
} from "lucide-react";

export const DashboardPage = () => {
  // Mock data - replace with actual API calls
  const dashboardStats = {
    occupancy: {
      bookedFlats: 285,
      totalFlats: 350,
      percentage: 81.4,
      pendingOccupancy: 18,
    },
    maintenance: {
      totalDue: 67,
      amount: "₹4,58,750",
    },
    complaints: {
      pending: 23,
      critical: 5,
    },
  };

  return (
    <Container fluid>
      <div className="mb-6">
        <Title order={2} className="text-gray-800 mb-2">
          Dashboard
        </Title>
        <Text size="sm" c="dimmed">
          Overview of your society management metrics
        </Text>
      </div>

      {/* Top Row - 3 Stat Cards */}
      <Grid gutter="lg" mb="lg">
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Flat Occupancy"
            value={`${dashboardStats.occupancy.bookedFlats}/${dashboardStats.occupancy.totalFlats}`}
            icon={Building2}
            color="blue"
            percentage={dashboardStats.occupancy.percentage}
            percentageLabel={`${dashboardStats.occupancy.percentage}% Occupied`}
            subtitle={`${dashboardStats.occupancy.pendingOccupancy} pending occupancy`}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Maintenance Due"
            value={dashboardStats.maintenance.totalDue}
            icon={IndianRupee}
            color="red"
            badge={{
              text: dashboardStats.maintenance.amount,
              color: "red",
            }}
            subtitle="Units with pending payments"
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Pending Complaints"
            value={dashboardStats.complaints.pending}
            icon={AlertCircle}
            color="yellow"
            badge={{
              text: `${dashboardStats.complaints.critical} Critical`,
              color: "orange",
            }}
            subtitle="Awaiting resolution"
          />
        </Grid.Col>
      </Grid>

      {/* Bottom Row - 2 Graph Cards */}
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <ParkingUtilizationChart />
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 6 }}>
          <MaintenanceSLAChart />
        </Grid.Col>
      </Grid>
    </Container>
  );
};

