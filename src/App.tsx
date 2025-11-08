import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import CommunitiesPage from './pages/communities/CommunitiesPage';
import CommunityDetailPage from './pages/communities/CommunityDetailPage';
import ManageCommunityPage from './pages/communities/ManageCommunityPage';
import EventsPage from './pages/events/EventsPage';
import EventDetailPage from './pages/events/EventDetailPage';
import PulsesPage from './pages/pulses/PulsesPage';
import MarketplacePage from './pages/marketplace/MarketplacePage';
import DirectoryPage from './pages/directory/DirectoryPage';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import './App.css';

const PrivateRoute: React.FC<{ children: React.ReactNode; requireManager?: boolean; requireAdmin?: boolean }> = ({ 
  children, 
  requireManager = false,
  requireAdmin = false 
}) => {
  const { user, loading, isManager, isAdmin } = useAuth();
  
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireManager && !isManager) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          
          {/* Protected Routes with Layout */}
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Communities */}
            <Route path="/communities" element={<CommunitiesPage />} />
            <Route path="/communities/:id" element={<CommunityDetailPage />} />
            <Route path="/communities/:id/manage" element={
              <PrivateRoute requireManager>
                <ManageCommunityPage />
              </PrivateRoute>
            } />
            
            {/* Events */}
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            
            {/* Pulses */}
            <Route path="/pulses" element={<PulsesPage />} />
            
            {/* Marketplace */}
            <Route path="/marketplace" element={<MarketplacePage />} />
            
            {/* Directory */}
            <Route path="/directory" element={<DirectoryPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <PrivateRoute requireAdmin>
                <AdminDashboard />
              </PrivateRoute>
            } />
          </Route>
          
          {/* Default Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
