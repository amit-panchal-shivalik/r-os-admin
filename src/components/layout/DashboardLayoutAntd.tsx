import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Button, theme } from 'antd';
import {
  DashboardOutlined,
  HomeOutlined,
  NotificationOutlined,
  TeamOutlined,
  UserOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CarOutlined,
  AlertOutlined,
  DollarOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BuildOutlined,
  UserAddOutlined,
  ToolOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';

const { Header, Sider, Content } = Layout;

export const DashboardLayoutAntd = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const userRoles = userInfo.userRoles || [];
  const isSuperAdmin = userRoles.includes('SuperAdmin');
  const isBuildingAdmin = userRoles.includes('BuildingAdmin');

  // Menu items for roles
  const superAdminMenuItems = [
    {
      key: '/buildings',
      icon: <BuildOutlined />,
      label: 'Buildings',
      onClick: () => navigate('/buildings')
    },
    {
      key: '/dev/tools',
      icon: <ToolOutlined />,
      label: 'Developer Tools',
      onClick: () => navigate('/dev/tools')
    }
  ];

  const buildingAdminMenuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/dashboard')
    },
    {
      key: '/members/pending',
      icon: <UserAddOutlined />,
      label: 'Pending Approvals',
      onClick: () => navigate('/members/pending')
    },
    {
      key: '/members/allocation',
      icon: <UserAddOutlined />,
      label: 'Members & Units',
      onClick: () => navigate('/members/allocation')
    },
    {
      key: '/building-settings',
      icon: <SettingOutlined />,
      label: 'Building Settings',
      children: [
        {
          key: '/building/blocks',
          label: 'Blocks',
          onClick: () => navigate('/building/blocks')
        },
        {
          key: '/building/floors',
          label: 'Floors',
          onClick: () => navigate('/building/floors')
        },
        {
          key: '/building/units',
          label: 'Units',
          onClick: () => navigate('/building/units')
        }
      ]
    },
    {
      key: '/notices',
      icon: <NotificationOutlined />,
      label: 'Notice Board',
      onClick: () => navigate('/notices')
    },
    {
      key: '/amenities',
      icon: <HomeOutlined />,
      label: 'Amenities',
      onClick: () => navigate('/amenities')
    },
    {
      key: '/amenity-bookings',
      icon: <CalendarOutlined />,
      label: 'Amenity Bookings',
      onClick: () => navigate('/amenity-bookings')
    },
    {
      key: '/committee-members',
      icon: <TeamOutlined />,
      label: 'Committee Members',
      onClick: () => navigate('/committee-members')
    },
    {
      key: '/complaints',
      icon: <AlertOutlined />,
      label: 'Complaints',
      onClick: () => navigate('/complaints')
    },
    {
      key: '/events',
      icon: <CalendarOutlined />,
      label: 'Events',
      onClick: () => navigate('/events')
    },
    {
      key: '/visitors',
      icon: <UserOutlined />,
      label: 'Visitors',
      onClick: () => navigate('/visitors')
    },
    {
      key: '/maintenance',
      icon: <DollarOutlined />,
      label: 'Maintenance & Bills',
      onClick: () => navigate('/maintenance')
    }
  ];

  const menuItems = isSuperAdmin ? superAdminMenuItems : buildingAdminMenuItems;

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => {
        logout();
        navigate('/login');
      }
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        width={250}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          backgroundColor: '#1f1f1f',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 18,
            color: '#f0f0f0',
            backgroundColor: '#141414',
          }}
        >
          {collapsed ? 'SM' : 'Society Manager'}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['/building-settings']}
          items={menuItems}
          style={{
            backgroundColor: '#1f1f1f',
            color: '#d9d9d9',
            fontSize: 14,
          }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'all 0.3s ease' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: 16,
              width: 48,
              height: 48,
              color: '#333',
            }}
          />

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <span style={{ color: '#333', fontWeight: 500 }}>
                {userInfo.firstName || 'User'}
              </span>
              <Avatar
                style={{
                  backgroundColor: '#555',
                  color: '#fff',
                }}
                icon={<UserOutlined />}
              />
            </div>
          </Dropdown>
        </Header>

        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
