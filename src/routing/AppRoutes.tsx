import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { OtpPage } from '../pages/auth/OtpPage';
import { DashboardLayoutAntd } from '../components/layout/DashboardLayoutAntd';
import { BuildingsListPage } from '../pages/buildings/BuildingsListPage';
import { CreateBuildingPage } from '../pages/buildings/CreateBuildingPage';
import { BuildingDetailsPage } from '../pages/buildings/BuildingDetailsPage';
import { BuildingSettingsPage } from '../pages/buildings/BuildingSettingsPage';
import { BlocksPage } from '../pages/buildings/BlocksPage';
import { FloorsPage } from '../pages/buildings/FloorsPage';
import { UnitsPage } from '../pages/buildings/UnitsPage';
import DashboardPage from '../pages/dashboard/DashboardPage';

// Building Settings
import BlocksPageNew from '../pages/building-settings/BlocksPage';
import FloorsPageNew from '../pages/building-settings/FloorsPage';
import UnitsPageNew from '../pages/building-settings/UnitsPage';

// Parking
import ParkingAreasPage from '../pages/parking/ParkingAreasPage';
import ParkingSpotsPage from '../pages/parking/ParkingSpotsPage';
import ParkingRequestsPage from '../pages/parking/ParkingRequestsPage';

// Notices
import NoticesPage from '../pages/notices/NoticesPage';

// Amenities
import AmenitiesPage from '../pages/amenities/AmenitiesPage';
import AmenitySlotsPage from '../pages/amenities/AmenitySlotsPage';
import AmenityBookingsPage from '../pages/amenities/AmenityBookingsPage';

// Committee
import CommitteeMembersPage from '../pages/committee/CommitteeMembersPage';

// Employees
import EmployeesPage from '../pages/employees/EmployeesPage';

// Complaints
import ComplaintsPage from '../pages/complaints/ComplaintsPage';

// Events
import EventsPage from '../pages/events/EventsPage';

// Visitors
import VisitorsPage from '../pages/visitors/VisitorsPage';

// Maintenance
import MaintenanceBillsPage from '../pages/maintenance/MaintenanceBillsPage';

// Members
import { PendingApprovalsPage } from '../pages/members/PendingApprovalsPage';
import MembersAllocationPage from '../pages/members/MembersAllocationPage';

// Developer Tools
import { DeveloperToolsPage } from '../pages/dev/DeveloperToolsPage';

/* current user roles */
const getUserRoles = (): string[] => {
  try {
    const info = JSON.parse(localStorage.getItem('userInfo') ?? '{}');
    return Array.isArray(info.userRoles) ? info.userRoles : ['Guest'];
  } catch {
    return ['Guest'];
  }
};

/* Role default route mapping */
const ROLE_DEFAULTS: Record<string, string> = {
  SuperAdmin: '/buildings',
  BuildingAdmin: '/dashboard',
};

/* Component that decides where to redirect  */
const RedirectByRole = () => {
  const location = useLocation();
  const roles = getUserRoles();

  // If we are already on a page that belongs to the user – stay there
  if (location.pathname !== '/' && location.pathname !== '') {
    return null;
  }

  // Find the first matching default route
  for (const role of roles) {
    if (ROLE_DEFAULTS[role]) {
      return <Navigate to={ROLE_DEFAULTS[role]} replace />;
    }
  }

  // Fallback
  return <Navigate to="/buildings" replace />;
};

/* ────── Main router ────── */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* PUBLIC - Super Admin */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/otp"
        element={
          <PublicRoute>
            <OtpPage />
          </PublicRoute>
        }
      />

      {/* PUBLIC - Building Admin */}
      <Route
        path="/:buildingId/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/:buildingId/otp"
        element={
          <PublicRoute>
            <OtpPage />
          </PublicRoute>
        }
      />

      {/* Private Route */}
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <DashboardLayoutAntd />
          </PrivateRoute>
        }
      >
        {/* Default entry point */}
        <Route index element={<RedirectByRole />} />

        {/* Super Admin Routes */}
        <Route path="buildings" element={<BuildingsListPage />} />
        <Route path="buildings/create" element={<CreateBuildingPage />} />
        <Route path="buildings/:id" element={<BuildingDetailsPage />} />

        {/* Building Admin Routes */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="building-settings" element={<BuildingSettingsPage />} />

        {/* Building Settings - New */}
        <Route path="building/blocks" element={<BlocksPageNew />} />
        <Route path="building/floors" element={<FloorsPageNew />} />
        <Route path="building/units" element={<UnitsPageNew />} />

        {/* Parking */}
        <Route path="parking-areas" element={<ParkingAreasPage />} />
        <Route path="parking-spots" element={<ParkingSpotsPage />} />
        <Route path="parking" element={<ParkingRequestsPage />} />

        {/* Notices */}
        <Route path="notices" element={<NoticesPage />} />

        {/* Amenities */}
        <Route path="amenities" element={<AmenitiesPage />} />
        <Route path="amenities/:amenityId/slots" element={<AmenitySlotsPage />} />
        <Route path="amenity-bookings" element={<AmenityBookingsPage />} />

        {/* Committee */}
        <Route path="committee-members" element={<CommitteeMembersPage />} />

        {/* Employees */}
        <Route path="employees" element={<EmployeesPage />} />

        {/* Complaints */}
        <Route path="complaints" element={<ComplaintsPage />} />

        {/* Events */}
        <Route path="events" element={<EventsPage />} />

        {/* Visitors */}
        <Route path="visitors" element={<VisitorsPage />} />

        {/* Maintenance */}
        <Route path="maintenance" element={<MaintenanceBillsPage />} />

        {/* Members */}
        <Route path="members/pending" element={<PendingApprovalsPage />} />
        <Route path="members/allocation" element={<MembersAllocationPage />} />

        {/* Developer Tools (Super Admin Only) */}
        <Route path="dev/tools" element={<DeveloperToolsPage />} />

        {/* Catch-all inside private area */}
        <Route path="*" element={<RedirectByRole />} />
      </Route>

      {/* Global catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};