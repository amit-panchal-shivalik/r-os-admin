import { Container, Title, Grid, Text } from "@mantine/core";
import { StatCard } from "../components/dashboard/StatCard";
import { ParkingUtilizationChart } from "../components/dashboard/ParkingUtilizationChart";
import { MaintenanceSLAChart } from "../components/dashboard/MaintenanceSLAChart";
import {
  Building2,
  IndianRupee,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";

interface DashboardStats {
  occupancy: {
    bookedFlats: number;
    totalFlats: number;
    percentage: number;
    pendingOccupancy: number;
  };
  maintenance: {
    totalDue: number;
    amount: string;
  };
  complaints: {
    pending: number;
    critical: number;
  };
}

export const DashboardPage = () => {
  const { admin } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  
  // Check if current user is society admin
  const isSocietyAdmin = admin?.roleKey === 'society_admin';

  useEffect(() => {
    // Load stats based on role
    if (isSocietyAdmin) {
      // Society Admin: Shows stats for THEIR SINGLE SOCIETY only
      setDashboardStats({
        occupancy: {
          bookedFlats: 142,
          totalFlats: 180,
          percentage: 78.9,
          pendingOccupancy: 8,
        },
        maintenance: {
          totalDue: 12,
          amount: "₹84,500",
        },
        complaints: {
          pending: 7,
          critical: 2,
        },
      });
    } else {
      // Super Admin: Shows aggregated stats across ALL SOCIETIES
      setDashboardStats({
        occupancy: {
          bookedFlats: 1247,
          totalFlats: 1580,
          percentage: 78.9,
          pendingOccupancy: 85,
        },
        maintenance: {
          totalDue: 156,
          amount: "₹12,45,750",
        },
        complaints: {
          pending: 67,
          critical: 14,
        },
      });
    }
  }, [isSocietyAdmin]);

  if (!dashboardStats) {
    return null;
  }

  return (
    <Container fluid className="p-6">
      <div className="mb-8">
        <Title order={2} className="text-gray-800 mb-2">
          Dashboard
        </Title>
        <Text size="sm" c="dimmed">
          {isSocietyAdmin 
            ? "Overview of your society management metrics"
            : "Comprehensive overview across all societies"}
        </Text>
      </div>

      {/* Top Row - 3 Stat Cards */}
      <Grid gutter="lg" mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <div className="h-full">
            <StatCard
              title="Flat Occupancy"
              value={`${dashboardStats.occupancy.bookedFlats}/${dashboardStats.occupancy.totalFlats}`}
              icon={Building2}
              color="blue"
              percentage={dashboardStats.occupancy.percentage}
              percentageLabel={`${dashboardStats.occupancy.percentage}% Occupied`}
              subtitle={`${dashboardStats.occupancy.pendingOccupancy} pending occupancy`}
            />
          </div>
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
          <div className="h-full">
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
          </div>
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

