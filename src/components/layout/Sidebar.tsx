import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, isManager, isAdmin } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['user', 'manager', 'admin'] },
    { path: '/communities', label: 'Communities', icon: '🏘️', roles: ['user', 'manager', 'admin'] },
    { path: '/events', label: 'Events', icon: '📅', roles: ['user', 'manager', 'admin'] },
    { path: '/marketplace', label: 'Marketplace', icon: '🛒', roles: ['user', 'manager', 'admin'] },
    { path: '/pulses', label: 'Pulses', icon: '📢', roles: ['user', 'manager', 'admin'] },
    { path: '/directory', label: 'Directory', icon: '👥', roles: ['user', 'manager', 'admin'] },
    { path: '/admin/overview', label: 'Admin Panel', icon: '⚙️', roles: ['admin'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role || 'user'));

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>🏘️ Community Platform</h2>
      </div>
      <nav className="sidebar-nav">
        {filteredMenu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
