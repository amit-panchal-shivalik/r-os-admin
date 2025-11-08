import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, isManager, isAdmin } = useAuth();

  const quickLinks = [
    { to: '/communities', label: 'Browse Communities', icon: '🏘️', roles: ['user', 'manager', 'admin'] },
    { to: '/events', label: 'Upcoming Events', icon: '📅', roles: ['user', 'manager', 'admin'] },
    { to: '/marketplace', label: 'Marketplace', icon: '🛒', roles: ['user', 'manager', 'admin'] },
    { to: '/pulses', label: 'Community Pulses', icon: '📢', roles: ['user', 'manager', 'admin'] },
    { to: '/directory', label: 'Member Directory', icon: '👥', roles: ['user', 'manager', 'admin'] },
    { to: '/admin/overview', label: 'Admin Panel', icon: '⚙️', roles: ['admin'] },
  ];

  const filteredLinks = quickLinks.filter(link => link.roles.includes(user?.role || 'user'));

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name}!</h1>
        <p>Your role: <strong>{user?.role}</strong></p>
      </div>

      <div className="quick-links">
        <h2>Quick Links</h2>
        <div className="quick-links-grid">
          {filteredLinks.map((link) => (
            <Link key={link.to} to={link.to} className="quick-link-card">
              <span className="icon">{link.icon}</span>
              <span className="label">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="dashboard-stats">
        <h2>Your Activity</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Communities</h3>
            <p className="stat-value">-</p>
            <p className="stat-label">Joined</p>
          </div>
          <div className="stat-card">
            <h3>Events</h3>
            <p className="stat-value">-</p>
            <p className="stat-label">Registered</p>
          </div>
          <div className="stat-card">
            <h3>Pulses</h3>
            <p className="stat-value">-</p>
            <p className="stat-label">Posted</p>
          </div>
          <div className="stat-card">
            <h3>Listings</h3>
            <p className="stat-value">-</p>
            <p className="stat-label">Created</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
