import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';
import { EmailLoginPage } from '../pages/auth/EmailLoginPage';
import { OtpVerificationPage } from '../pages/auth/OtpVerificationPage';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { PeoplePage } from '../pages/PeoplePage';
import { UserProfile } from '../pages/UserProfile';
import { InputDemo } from '../pages/InputDemo';
import { SocietiesList } from '../pages/society-management/SocietiesList';
import { AddSociety } from '../pages/society-management/AddSociety';
import { EditSociety } from '../pages/society-management/EditSociety';
import { PendingEnquiries } from '../pages/society-management/PendingEnquiries';
import { SocietiesAPIDemo } from '../pages/society-management/SocietiesAPIDemo';

/* current user roles */
const getUserRoles = (): string[] => {
  try {
    const info = JSON.parse(localStorage.getItem('admin_data') ?? '{}');
    return info.roleKey ? [info.roleKey] : ['Guest'];
  } catch {
    return ['Guest'];
  }
};

/* Role default route mapping */
const ROLE_DEFAULTS: Record<string, string> = {
  SuperAdmin: '/users',
  Admin: '/societies',
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
  return <Navigate to="/societies" replace />;
};

/* ────── Main router ────── */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* PUBLIC - Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <EmailLoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/verify-otp"
        element={
          <PublicRoute>
            <OtpVerificationPage />
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
        <Route path="users" element={<PeoplePage />} />
        <Route path="user-profile" element={<UserProfile />} />
        <Route path="input-demo" element={<InputDemo />} />
        
        {/* Society Management Routes */}
        <Route path="societies" element={<SocietiesList />} />
        <Route path="societies/add" element={<AddSociety />} />
        <Route path="societies/edit/:id" element={<EditSociety />} />
        <Route path="societies/enquiries" element={<PendingEnquiries />} />
        <Route path="societies/api-demo" element={<SocietiesAPIDemo />} />

        {/* Catch-all inside private area (keeps the layout) */}
        <Route path="*" element={<RedirectByRole />} />
      </Route>

      {/* Global catch-all (outside private area) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};