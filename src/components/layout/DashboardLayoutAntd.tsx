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
  BuildOutlined
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

  // Menu items for different roles
  const superAdminMenuItems = [
    {
      key: '/buildings',
      icon: <BuildOutlined />,
      label: 'Buildings',
      onClick: () => navigate('/buildings')
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
      key: '/committee-members',
      icon: <TeamOutlined />,
      label: 'Committee Members',
      onClick: () => navigate('/committee-members')
    },
    {
      key: '/employees',
      icon: <UserOutlined />,
      label: 'Employees',
      onClick: () => navigate('/employees')
    },
    {
      key: '/complaints',
      icon: <AlertOutlined />,
      label: 'Complaints',
      onClick: () => navigate('/complaints')
    },
    {
      key: '/parking',
      icon: <CarOutlined />,
      label: 'Parking',
      onClick: () => navigate('/parking')
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
        }}
      >
        <div className="flex items-center justify-center h-16 bg-blue-600 text-white font-bold text-xl">
          {collapsed ? 'SM' : 'Society Manager'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['/building-settings']}
          items={menuItems}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 250 }}>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="flex items-center gap-2 cursor-pointer">
              <span className="text-gray-700">{userInfo.firstName || 'User'}</span>
              <Avatar
                style={{ backgroundColor: '#1890ff' }}
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
