import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { OtpPage } from '../pages/auth/OtpPage';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { BuildingsListPage } from '../pages/buildings/BuildingsListPage';
import { CreateBuildingPage } from '../pages/buildings/CreateBuildingPage';
import { BuildingDetailsPage } from '../pages/buildings/BuildingDetailsPage';
import { BuildingSettingsPage } from '../pages/buildings/BuildingSettingsPage';
import { BlocksPage } from '../pages/buildings/BlocksPage';
import { FloorsPage } from '../pages/buildings/FloorsPage';
import { UnitsPage } from '../pages/buildings/UnitsPage';

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
            <DashboardLayout />
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
        <Route path="dashboard" element={<BuildingSettingsPage />} />
        <Route path="building/blocks" element={<BlocksPage />} />
        <Route path="building/floors" element={<FloorsPage />} />
        <Route path="building/units" element={<UnitsPage />} />

        {/* Catch-all inside private area */}
        <Route path="*" element={<RedirectByRole />} />
      </Route>

      {/* Global catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};