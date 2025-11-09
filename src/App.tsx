import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { AdminLayout } from "./components/layout/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Communities from "./pages/admin/Communities";
import CommunityDetail from "./pages/admin/CommunityDetail";
import CreateCommunity from "./pages/admin/CreateCommunity";
import JoinRequests from "./pages/admin/JoinRequests";
import PulsesManagement from "./pages/admin/PulsesManagement";
import MarketplaceManagement from "./pages/admin/MarketplaceManagement";
import Events from "./pages/admin/Events";
import CreateEvent from "./pages/admin/CreateEvent";
import EventDetail from "./pages/admin/EventDetail";
import EventRegistration from "./pages/user/EventRegistration";
import Settings from "./pages/admin/Settings";
import UserManagement from "./pages/admin/UserManagement";
import UserApp from "./pages/user/UserApp";
import CommunityView from "./pages/user/CommunityView";
import CreatePulse from "./pages/user/CreatePulse";
import CreateListing from "./pages/user/CreateListing";
import Pulses from "./pages/user/Pulses";
import CreatePulseNew from "./pages/user/CreatePulseNew";
import UserCommunities from "./pages/user/Communities";
import Volunteer from "./pages/user/Volunteer";
import Profile from "./pages/user/Profile";
import ProfileEdit from "./pages/user/ProfileEdit";
import Members from "./pages/user/Members";
import Territories from "./pages/user/Territories";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./hooks/useAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* User App Routes */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <UserApp />
                </ProtectedRoute>
              }
            />
            <Route
              path="/community/:id"
              element={
                <ProtectedRoute>
                  <CommunityView />
                </ProtectedRoute>
              }
            />
            <Route path="/community/:id/pulse/new" element={<ProtectedRoute><CreatePulse /></ProtectedRoute>} />
            <Route path="/community/:id/listing/new" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
            <Route path="/event/:id/register" element={<ProtectedRoute><EventRegistration /></ProtectedRoute>} />
            <Route path="/pulses" element={<ProtectedRoute><Pulses /></ProtectedRoute>} />
            <Route path="/pulses/create" element={<ProtectedRoute><CreatePulseNew /></ProtectedRoute>} />
            <Route path="/communities" element={<ProtectedRoute><UserCommunities /></ProtectedRoute>} />
            <Route path="/app/volunteer" element={<ProtectedRoute><Volunteer /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
            <Route path="/members" element={<ProtectedRoute><Members /></ProtectedRoute>} />
            <Route path="/territories" element={<ProtectedRoute><Territories /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout><Dashboard /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/communities"
              element={
                <ProtectedRoute>
                  <AdminLayout><Communities /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/communities/new"
              element={
                <ProtectedRoute>
                  <AdminLayout><CreateCommunity /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/communities/:id"
              element={
                <ProtectedRoute>
                  <CommunityDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/join-requests"
              element={
                <ProtectedRoute>
                  <AdminLayout><JoinRequests /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pulses"
              element={
                <ProtectedRoute>
                  <AdminLayout><PulsesManagement /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/marketplace"
              element={
                <ProtectedRoute>
                  <AdminLayout><MarketplaceManagement /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route path="/admin/events" element={<ProtectedRoute><AdminLayout><Events /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/events/new" element={<ProtectedRoute><AdminLayout><CreateEvent /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/events/:id" element={<ProtectedRoute><AdminLayout><EventDetail /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><AdminLayout><UserManagement /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><AdminLayout><Settings /></AdminLayout></ProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
