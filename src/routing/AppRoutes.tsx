import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import { PublicRoute } from "./PublicRoute";
import { EmailLoginPage } from "../pages/auth/EmailLoginPage";
import { OtpVerificationPage } from "../pages/auth/OtpVerificationPage";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { DashboardPage } from "../pages/DashboardPage";
import { PeoplePage } from "../pages/PeoplePage";
import { UserProfile } from "../pages/UserProfile";
import { InputDemo } from "../pages/InputDemo";
import { SocietiesList } from "../pages/society-management/SocietiesList";
import { AddSociety } from "../pages/society-management/AddSociety";
import { EditSociety } from "../pages/society-management/EditSociety";
import { BookAmenity } from "../pages/society-management/BookAmenity";
import { PendingEnquiries } from "../pages/society-management/PendingEnquiries";
import SocietyView from "../pages/society-management/SocietyView";
import { SocietiesAPIDemo } from "../pages/society-management/SocietiesAPIDemo";
import { ComplaintsList } from "../pages/complaint-management/ComplaintsList";
import { AddComplaint } from "../pages/complaint-management/AddComplaint";
import { EditComplaint } from "../pages/complaint-management/EditComplaint";
import ViewComplaint from "../pages/complaint-management/ViewComplaint";
import ParkingSettings from "../pages/ParkingSettings";
import { Notice } from "../pages/Notice";
import { AddNotice } from "../pages/AddNotice";
import { AmenitiesList } from "../pages/amenities/AmenitiesList";
import { ViewAmenity } from "../pages/amenities/ViewAmenity";
import { EditAmenity } from "../pages/amenities/EditAmenity";
import { UserAmenitiesList } from "../pages/user-amenities/UserAmenitiesList";
import { SOSReportList } from "../pages/sos-report/SOSReportList";
import { SOSReportView } from "../pages/sos-report/SOSReportView";
import { AmenityPaymentsList } from "../pages/amenity-payments/AmenityPaymentsList";
import { PaymentStatistics } from "../pages/amenity-payments/PaymentStatistics";

/* current user roles */
const getUserRoles = (): string[] => {
  try {
    const info = JSON.parse(localStorage.getItem("admin_data") ?? "{}");
    return info.roleKey ? [info.roleKey] : ["Guest"];
  } catch {
    return ["Guest"];
  }
};

/* Role default route mapping */
const ROLE_DEFAULTS: Record<string, string> = {
  SuperAdmin: "/dashboard",
  Admin: "/dashboard",
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
  return <Navigate to="/dashboard" replace />;
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

        {/* Dashboard */}
        <Route path="dashboard" element={<DashboardPage />} />

        {/* All private pages  */}
        <Route path="users" element={<PeoplePage />} />
        <Route path="user-profile" element={<UserProfile />} />
        <Route path="input-demo" element={<InputDemo />} />

        {/* Society Management Routes */}
        <Route path="societies" element={<SocietiesList />} />
        <Route path="societies/add" element={<AddSociety />} />
        <Route path="societies/edit/:id" element={<EditSociety />} />
        <Route path="societies/book-amenity" element={<BookAmenity />} />
        <Route path="societies/view/:id" element={<SocietyView />} />
        <Route
          path="societies/view/:societyId/unit/:unitId"
          element={<div>Unit Detail Page (Coming Soon)</div>}
        />
        <Route path="societies/enquiries" element={<PendingEnquiries />} />
        <Route path="societies/api-demo" element={<SocietiesAPIDemo />} />

        {/* Amenities Management Routes */}
        <Route path="amenities" element={<AmenitiesList />} />
        <Route path="amenities/edit/:id" element={<EditAmenity />} />
        <Route path="amenities/view/:id" element={<ViewAmenity />} />

        {/* User Amenities Routes */}
        <Route path="user-amenities" element={<UserAmenitiesList />} />

        {/* Amenity Payments Routes */}
        <Route path="amenity-payments" element={<AmenityPaymentsList />} />
        <Route
          path="amenity-payments/statistics"
          element={<PaymentStatistics />}
        />

        <Route path="parking-settings" element={<ParkingSettings />} />
        <Route path="notice" element={<Notice />} />
        <Route path="notice/add" element={<AddNotice />} />
        <Route path="notice/edit/:id" element={<AddNotice isEdit />} />
        <Route
          path="notice/view/:id"
          element={
            <div className="p-6">
              <h1 className="text-2xl font-bold">Notice View</h1>
              <p className="text-gray-600 mt-2">
                Notice view functionality coming soon...
              </p>
            </div>
          }
        />

        {/* Complaint Management Routes */}
        <Route path="complaints" element={<ComplaintsList />} />
        <Route path="complaints/add" element={<AddComplaint />} />
        <Route path="complaints/edit/:id" element={<EditComplaint />} />
        <Route path="complaints/view/:id" element={<ViewComplaint />} />

        {/* SOS Report Routes */}
        <Route path="sos-report" element={<SOSReportList />} />
        <Route path="sos-report/view/:id" element={<SOSReportView />} />

        {/* Catch-all inside private area (keeps the layout) */}
        <Route path="*" element={<RedirectByRole />} />
      </Route>

      {/* Global catch-all (outside private area) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
