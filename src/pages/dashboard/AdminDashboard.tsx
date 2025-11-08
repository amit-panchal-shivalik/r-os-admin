import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { adminAPI } from '../../api/admin';
import CreateCommunityForm from '../../components/community/CreateCommunityForm';

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [stats, setStats] = useState({
    totalCommunities: 0,
    totalUsers: 0,
    totalEvents: 0,
    pendingApprovals: 0,
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await adminAPI.getAnalytics();
      setStats(response.data.stats || stats);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const tabs = [
    { path: '/admin/overview', label: 'Overview', icon: '📊' },
    { path: '/admin/communities', label: 'Communities', icon: '🏘️' },
    { path: '/admin/approvals', label: 'Approvals', icon: '✅' },
    { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Manage the entire platform</p>
      </div>

      <div className="admin-tabs">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`admin-tab ${location.pathname === tab.path ? 'active' : ''}`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        ))}
      </div>

      <Routes>
        <Route
          path="overview"
          element={
            <div className="admin-overview">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>🏘️ Communities</h3>
                  <p className="stat-value">{stats.totalCommunities}</p>
                </div>
                <div className="stat-card">
                  <h3>👥 Users</h3>
                  <p className="stat-value">{stats.totalUsers}</p>
                </div>
                <div className="stat-card">
                  <h3>📅 Events</h3>
                  <p className="stat-value">{stats.totalEvents}</p>
                </div>
                <div className="stat-card">
                  <h3>⏳ Pending</h3>
                  <p className="stat-value">{stats.pendingApprovals}</p>
                </div>
              </div>
            </div>
          }
        />
        <Route
          path="communities"
          element={
            <div className="admin-communities">
              <div className="section-header">
                <h2>Manage Communities</h2>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="btn-primary"
                >
                  Create Community
                </button>
              </div>

              {showCreateForm && (
                <div className="modal-overlay">
                  <CreateCommunityForm
                    onSuccess={() => {
                      setShowCreateForm(false);
                      loadAnalytics();
                    }}
                    onCancel={() => setShowCreateForm(false)}
                  />
                </div>
              )}

              <p>Community management interface coming soon...</p>
            </div>
          }
        />
        <Route
          path="approvals"
          element={
            <div className="admin-approvals">
              <h2>Approval Queue</h2>
              <p>View and manage all pending approvals across the platform.</p>
            </div>
          }
        />
        <Route
          path="analytics"
          element={
            <div className="admin-analytics">
              <h2>Platform Analytics</h2>
              <p>Detailed analytics and reports coming soon...</p>
            </div>
          }
        />
        <Route path="*" element={<div>Select a tab to view content</div>} />
      </Routes>
    </div>
  );
};

export default AdminDashboard;
