import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import { PublicRoute } from "./PublicRoute";
import { LoginPage } from "../pages/auth/LoginPage";
import { OtpPage } from "../pages/auth/OtpPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { TerritoryDashboardPage } from "@/pages/territory/Dashboard";
import { TerritoryProjectsPage } from "@/pages/territory/Projects";
import { TerritoryLandPage } from "@/pages/territory/Land";
import { TerritoryVendorPage } from "@/pages/territory/Vendor";
import { TerritoryStorePage } from "@/pages/territory/Store";
import { TerritoryInstitutePage } from "@/pages/territory/Institute";
import { TerritorySocietyAdminPage } from "@/pages/territory/SocietyAdmin";
import { TerritoryOpportunityPage } from "@/pages/territory/Opportunity";
import { TerritoryBlueCollarJobPage } from "@/pages/territory/BlueCollarJob";
import { TerritoryEventPage } from "@/pages/territory/EventPage";

/* current user roles */
const getUserRoles = (): string[] => {
  try {
    const info = JSON.parse(localStorage.getItem("userInfo") ?? "{}");
    return Array.isArray(info.userRoles) ? info.userRoles : ["Guest"];
  } catch {
    return ["Guest"];
  }
};

/* Role default route mapping */
const ROLE_DEFAULTS: Record<string, string> = {
  SuperAdmin: "/users",
};

/* Component that decides where to redirect  */
const RedirectByRole = () => {
  const location = useLocation();
  const roles = getUserRoles();

  // If we are already on a page that belongs to the user – stay there
  if (location.pathname !== "/" && location.pathname !== "") {
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
      {/* PUBLIC */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
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
        {/* Territory */}
        <Route
          path="territory/dashboard"
          element={<TerritoryDashboardPage />}
        />
        <Route path="territory/project" element={<TerritoryProjectsPage />} />
        <Route path="territory/land" element={<TerritoryLandPage />} />
        <Route path="territory/vendor" element={<TerritoryVendorPage />} />
        <Route path="territory/store" element={<TerritoryStorePage />} />
        <Route
          path="territory/institute"
          element={<TerritoryInstitutePage />}
        />
        <Route
          path="territory/society-admin"
          element={<TerritorySocietyAdminPage />}
        />
        <Route
          path="territory/opportunity"
          element={<TerritoryOpportunityPage />}
        />
        <Route
          path="territory/blue-collar-job"
          element={<TerritoryBlueCollarJobPage />}
        />
        <Route path="territory/event" element={<TerritoryEventPage />} />

        {/* Catch-all inside private area (keeps the layout) */}
        <Route path="*" element={<RedirectByRole />} />
      </Route>

      {/* Global catch-all (outside private area) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
