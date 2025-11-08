import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { OtpPage } from '../pages/auth/OtpPage';

import DashboardPage from '@/pages/auth/DashboardPage';
import Dashboard from '@/pages/Dashboard';
import LeaveTypes from '@/pages/leave/LeaveTypes';
import LeaveGroups from '@/pages/leave/LeaveGroups';
import BulkLeaveAssignment from '@/pages/leave/BulkLeaveAssignment';
import LeaveBalance from '@/pages/leave/LeaveBalance';
import LeaveRequests from '@/pages/leave/LeaveRequests';
import HolidayList from '@/pages/holidays/HolidayList';
import HolidayGroups from '@/pages/holidays/HolidayGroups';
import AssignHolidayGroups from '@/pages/holidays/AssignHolidayGroups';
import Employees from '@/pages/Employees';
import DashboardLayout from '@/components/layout/DashboardLayout';

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
  SuperAdmin: '/users',
};

/* Component that decides where to redirect  */
const RedirectByRole = () => {
  const location = useLocation();
  const roles = getUserRoles();

  // If we are already on a page that belongs to the user – stay there
  if (location.pathname !== '/' && location.pathname !== '') {
    return null; // let the child route render
  }

  // Find the first matching default route
  for (const role of roles) {
    if (ROLE_DEFAULTS[role]) {
      return <Navigate to={ROLE_DEFAULTS[role]} replace />;
    }
  }

  // Fallback for unknown / Guest
  return <Navigate to="/users" replace />;
};

/* ────── Main router ────── */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* Ensure root dashboard route renders the same layout */}
      <Route path="/" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
      <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/leave/types" element={<DashboardLayout><LeaveTypes /></DashboardLayout>} />
          <Route path="/leave/groups" element={<DashboardLayout><LeaveGroups /></DashboardLayout>} />
          <Route path="/leave/bulk-assign" element={<DashboardLayout><BulkLeaveAssignment /></DashboardLayout>} />
          <Route path="/leave/balance" element={<DashboardLayout><LeaveBalance /></DashboardLayout>} />
          <Route path="/leave/requests" element={<DashboardLayout><LeaveRequests /></DashboardLayout>} />
          <Route path="/holidays/list" element={<DashboardLayout><HolidayList /></DashboardLayout>} />
          <Route path="/holidays/groups" element={<DashboardLayout><HolidayGroups /></DashboardLayout>} />
          <Route path="/holidays/assign" element={<DashboardLayout><AssignHolidayGroups /></DashboardLayout>} />
          <Route path="/employees" element={<DashboardLayout><Employees /></DashboardLayout>} />
      {/* PUBLIC */}
      {/* <Route
        path="/dashboard"
        element={
          <PublicRoute>
            <DashboardPage />
          </PublicRoute>
        }
      /> */}
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

      {/* Private Route */}
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        {/* Default entry point – decides where to go based on current role */}
        <Route index element={<RedirectByRole />} />

        {/* All private pages  */}
        {/* <Route path="users" element={<PeoplePage />} /> */}

        {/* Catch-all inside private area (keeps the layout) */}
        <Route path="*" element={<RedirectByRole />} />
      </Route>

      {/* Global catch-all (outside private area) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};