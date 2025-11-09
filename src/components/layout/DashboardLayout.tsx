import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppShell,
  Text,
  Group,
  Avatar,
  Menu,
  UnstyledButton,
  Box,
  Burger,
  rem,
  Divider,
  Modal,
  Stack,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconUsers,
  IconMapPin,
  IconChartBar,
  IconBook,
  IconLogout,
  IconCaretDown,
  IconDeviceDesktop,
  IconSpeakerphone,
  IconCalendar,
  IconMessageCircle2,
  IconTrendingUp,
  IconShield
} from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import { User, Users2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { ComponentType } from 'react';

// Navigation array
type NavigationSubItem = {
  name: string;
  href?: string;
  children?: NavigationSubItem[];
};

type NavigationIcon = ComponentType<Record<string, unknown>>;

type NavigationItem = {
  name: string;
  href: string;
  icon: NavigationIcon;
  subItems?: NavigationSubItem[];
};

const navigation: NavigationItem[] = [
  { name: 'People', href: '/users', icon: IconUsers },
  {
    name: 'Territory',
    href: '/territory',
    icon: IconMapPin,
    subItems: [
      { name: 'Dashboard', href: '/territory/dashboard' },
      { name: 'Projects', href: '/territory/project' },
      { name: 'Land', href: '/territory/land/dashboard' },
      { name: 'Vendors', href: '/territory/vendor/dashboard' },
      { name: 'Store', href: '/territory/store/dashboard' },
      { name: 'Institute', href: '/territory/institute/dashboard' },
    ],
  },
  { name: 'Desk', href: '/follow-up', icon: IconDeviceDesktop },
  { name: 'Event', href: '/event', icon: IconCalendar },
  { name: 'Knowledge', href: '/article-listing', icon: IconBook },
  { name: 'Channel Sales', href: '/channel-sales', icon: IconChartBar },
  {
    name: 'Campaign',
    href: '/campaign-list',
    icon: IconSpeakerphone,
    subItems: [
      { name: 'Campaign', href: '/campaign-list' },
      { name: 'Add Campaign', href: '/campaign-add' },
    ],
  },
  {
    name: 'Employee',
    href: '/employee/dashboard',
    icon: Users2,
    subItems: [
      { name: 'Dashboard', href: '/employee/dashboard' },
      { name: 'Employee List', href: '/employee/employee-list' },
      { name: 'Designation', href: '/employee/designation' },
      { name: 'Department', href: '/employee/department' },
      { name: 'Branch', href: '/employee/branch' },
      { name: 'Seating Office', href: '/employee/seating-office' },
      { name: 'Shift Management', href: '/employee/shift-management' },
      { name: 'Jobs', href: '/employee/jobs' },
      { name: 'Report', href: '/employee/report' },
    ],
  },
  {
    name: 'Feedback',
    href: '/feedback-list',
    icon: IconMessageCircle2,
    subItems: [
      { name: 'Feedback Modules', href: '/feedback-modules-list' },
      { name: 'Feedback List', href: '/feedback-list' },
    ],
  },
  {
    name: 'Growth Partner',
    href: '/growth-partner-list',
    icon: IconTrendingUp,
  },
  {
    name: 'EHS',
    href: '/ehs/dashboard',
    icon: IconShield,
    subItems: [
      { name: 'Dashboard', href: '/ehs/dashboard' },
      {
        name: 'Induction & Training',
        children: [
          { name: 'Site Directory', href: '/ehs/sites' },
          { name: 'Safety Induction Form', href: '/ehs/safety-induction' },
          { name: 'Contractor Directory', href: '/ehs/contractors' },
          { name: 'Induction Tracking List', href: '/ehs/induction-tracking' }
        ]
      },
      {
        name: 'Meetings & Communication',
        children: [
          { name: 'Tool Box Talk Attendance', href: '/ehs/tool-box-talk' },
          { name: 'EHS Committee MOM', href: '/ehs/committee-mom' }
        ]
      },
      {
        name: 'First Aid & Medical',
        children: [
          { name: 'First Aid Treatment Register', href: '/ehs/first-aid' },
          { name: 'First Aid Box Checklist', href: '/ehs/first-aid-checklist' }
        ]
      },
      {
        name: 'Equipment & Monitoring',
        children: [
          { name: 'Equipment Testing Monitoring', href: '/ehs/equipment-testing' },
          { name: 'Portable Electrical Tools Register', href: '/ehs/portable-tools' },
          { name: 'Fire Extinguisher Monitoring', href: '/ehs/fire-extinguisher' }
        ]
      },
      {
        name: 'Heavy Equipment Checklists',
        children: [
          { name: 'Excavator Checklist', href: '/ehs/excavator-checklist' },
          { name: 'JCB Checklist', href: '/ehs/jcb-checklist' },
          { name: 'Truck Checklist', href: '/ehs/truck-checklist' }
        ]
      },
      {
        name: 'Machinery & Fabrication',
        children: [
          { name: 'Welding Machine Checklist', href: '/ehs/welding-machine-checklist' },
          { name: 'Reinforcement Cutting Checklist', href: '/ehs/reinforcement-cutting-checklist' },
          { name: 'Reinforcement Bending Checklist', href: '/ehs/reinforcement-bending-checklist' }
        ]
      },
      {
        name: 'Permits & Height Safety',
        children: [
          { name: 'Work Permit Register', href: '/ehs/work-permit' },
          { name: 'Height Safety Compliance', href: '/ehs/height-safety' },
          { name: 'Ladder Inspection Checklist', href: '/ehs/ladder-inspection' },
          { name: 'Scaffold Inspection Checklist', href: '/ehs/scaffold-inspection' },
          { name: 'Full Body Harness Inspection', href: '/ehs/full-body-harness' }
        ]
      },
      {
        name: 'Observations & Compliance',
        children: [
          { name: 'Safety Observation Sheet', href: '/ehs/observation-sheet' },
          { name: 'PPE Register', href: '/ehs/ppe-register' },
          { name: 'Safety Violation Debit Note', href: '/ehs/safety-violation' },
          { name: 'Near Miss / Unsafe Act Report', href: '/ehs/near-miss' },
          { name: 'Suggestions Review Sheet', href: '/ehs/suggestions-review' }
        ]
      },
      {
        name: 'Emergency Preparedness',
        children: [
          { name: 'Mock Drill Schedule', href: '/ehs/mock-drill-schedule' },
          { name: 'Mock Drill Report', href: '/ehs/mock-drill-report' },
          { name: 'EHS Core Team Structure', href: '/ehs/core-team' }
        ]
      },
      {
        name: 'Reporting & Analytics',
        children: [
          { name: 'Safety Statistics Board', href: '/ehs/safety-statistics' },
          { name: 'Accident Investigation Report', href: '/ehs/accident-investigation' }
        ]
      }
    ],
  },
];

const flattenSubItemHrefs = (items: NavigationSubItem[] = []): string[] => {
  return items.flatMap((item) => {
    if (item.children?.length) {
      return flattenSubItemHrefs(item.children);
    }
    return item.href ? [item.href] : [];
  });
};

const findFirstLeafHref = (items: NavigationSubItem[] = []): string | undefined => {
  for (const item of items) {
    if (item.href) {
      return item.href;
    }
    if (item.children?.length) {
      const childHref = findFirstLeafHref(item.children);
      if (childHref) return childHref;
    }
  }
  return undefined;
};

const findParentForHref = (items: NavigationItem[], href: string): NavigationItem | undefined => {
  for (const item of items) {
    if (item.href === href) return item;
    if (item.subItems?.length && flattenSubItemHrefs(item.subItems).includes(href)) {
      return item;
    }
  }
  return undefined;
};

const isHrefWithinSubItems = (items: NavigationSubItem[] = [], href: string): boolean => {
  return items.some((item) => {
    if (item.href === href) return true;
    if (item.children?.length) {
      return isHrefWithinSubItems(item.children, href);
    }
    return false;
  });
};

// Mapping of roles allowed tabs
const roleToTabs: Record<string, string[]> = {
  SuperAdmin: navigation.map((item) => item.name), // all
  LandManager: ['Desk', 'Territory'],
  LandExecutive: ['Desk', 'Territory'],
  FundManager: ['Desk'],
  FundExecutive: ['Desk'],
  ProjectSalesManager: ['Desk'],
  ProjectPreSales: ['Desk'],
  ProjectSiteSales: ['Desk'],
  EventAdmin: ['Event'],
  KnowledgeAdmin: ['Knowledge'],
  CPManager: ['Desk', 'Channel Sales'],
  CPExecutive: ['Desk', 'Channel Sales'],
  CampaignAdmin: ['Campaign'],
  VendorAdmin: ['Territory'],
  HRManager: ['Employee'],
  HRExecutive: ['Employee'],
  CSWebsiteAdmin: ['Desk'],
  FurnitureManager: ['Desk', 'Territory'],
  FurnitureSalesExecutive: ['Desk', 'Territory'],
  FurnitureB2BAdmin: ['Desk', 'Territory'],
  FurnitureDealerAdmin: ['Desk', 'Territory'],
  GrowthPartnerAdmin: ['Growth Partner'],
  InstituteManager: ['Desk'],
  InstituteExecutive: ['Desk'],
  EHSManager: ['EHS'],
  EHSExecutive: ['EHS'],
  EHSSupervisor: ['EHS']
};

// Filter navigation based on user roles
const getFilteredNavigation = (roles: string[] = []) => {
  if (roles.includes('SuperAdmin')) {
    return navigation; // full access
  }

  const allowed = new Set<string>();
  const landRestricted = roles?.some((r) =>
    ['LandManager', 'LandExecutive']?.includes(r)
  );

  const furnitureRestricted = roles?.some((role) =>
    ['FurnitureManager', 'FurnitureSalesExecutive', 'FurnitureB2BAdmin', 'FurnitureDealerAdmin']?.includes(role)
  );

  const vendorRestricted = roles.includes('VendorAdmin');

  roles?.forEach((role) => {
    const tabs = roleToTabs[role];
    if (tabs) {
      tabs?.forEach((tab) => allowed.add(tab));
    }
  });

  return navigation
    ?.filter((item) => {
      // Allow Feedback section for all roles
      if (item.name === 'Feedback') return true;
      return allowed?.has(item.name);
    })
    ?.map((item) => {
      if (item?.name === 'Territory') {
        const subItems: { name: string; href: string }[] = [];

        // Add Land tab if land-related role
        if (landRestricted) {
          subItems?.push({ name: 'Land', href: '/territory/land/dashboard' });
        }

        // Add Store tab if furniture-related role
        if (furnitureRestricted) {
          subItems?.push({ name: 'Store', href: '/territory/store/dashboard' });
        }

        // Add Vendor tabs if vendor role
        if (vendorRestricted) {
          subItems?.push(
            { name: 'Dashboard', href: '/territory/dashboard' },
            { name: 'Vendors', href: '/territory/vendor/dashboard' }
          );
        }

        // Only return if we actually have subItems
        if (subItems?.length > 0) {
          return { ...item, subItems };
        }
      }

      // Alllow Feedback Modules section only for SuperAdmin role
      if (item?.name === 'Feedback') {
        return {
          ...item,
          subItems: item?.subItems?.filter(
            (sub) => sub?.name !== 'Feedback Modules'
          ),
        };
      }

      return item;
    });
};

export const DashboardLayout = () => {
  const [opened, { toggle, close }] = useDisclosure();
  const { user, logout }: any = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activePath, setActivePath] = useState(() => {
    const storedPath = localStorage.getItem('lastActivePath');
    return storedPath || '/ehs/dashboard';
  });
  const [tabOpenStates, setTabOpenStates] = useState<{ [key: string]: boolean }>(() => {
    try {
      return JSON.parse(localStorage.getItem('tabOpenStates') || '{}');
    } catch {
      return navigation.reduce((acc, item) => (item.subItems ? { ...acc, [item.href]: false } : acc), {});
    }
  });
  const [logoutModal, setLogoutModal] = useState(false);
  const isInitialMount = useRef(true);

  let userInfo;
  // Retrieve user roles from localStorage, fallback to user?.role
  let userRoles: string[] = [];
  try {
    userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    userRoles = Array.isArray(userInfo.userRoles) ? userInfo.userRoles : [];
  } catch (error) {
    console.error('Error parsing userInfo from localStorage:', error);
  }
  const effectiveRoles = userRoles.length > 0 ? userRoles : (user?.role ? [user?.role] : []);

  // Apply filtered navigation based on roles
  const filteredNavigation = getFilteredNavigation(effectiveRoles);

  useEffect(() => {
    if (isInitialMount.current) {
      const storedPath = localStorage.getItem('lastActivePath');
      const isValidPath = filteredNavigation.some((item) => {
        if (item.href === storedPath) return true;
        if (item.subItems?.length) {
          return isHrefWithinSubItems(item.subItems, storedPath || '');
        }
        return false;
      });
      if (storedPath && isValidPath && storedPath !== location.pathname) {
        navigate(storedPath, { replace: true });
      } else if (!isValidPath && storedPath) {
        // If stored path is invalid, clear it and navigate to default
        localStorage.setItem('lastActivePath', '/ehs/dashboard');
        navigate('/ehs/dashboard', { replace: true });
      }
      isInitialMount.current = false;
    }
  }, [navigate, filteredNavigation]);

  useEffect(() => {
    if (activePath !== location.pathname) {
      setActivePath(location.pathname);
      localStorage.setItem('lastActivePath', location.pathname);
    }

    const updatedTabOpenStates = { ...tabOpenStates };
    let hasChanges = false;

    filteredNavigation.forEach((item) => {
      if (item.subItems) {
        const leafHrefs = flattenSubItemHrefs(item.subItems);
        const isSubActive = leafHrefs.includes(location.pathname);
        const isParentActive = location.pathname === item.href;
        const shouldBeOpen = isSubActive || isParentActive;
        if (updatedTabOpenStates[item.href] !== shouldBeOpen) {
          updatedTabOpenStates[item.href] = shouldBeOpen;
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setTabOpenStates(updatedTabOpenStates);
      localStorage.setItem('tabOpenStates', JSON.stringify(updatedTabOpenStates));
    }
  }, [location.pathname, activePath, filteredNavigation]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('lastActivePath');
    localStorage.removeItem('tabOpenStates');
    navigate('/login');
  };

  const handleTabClick = (item: NavigationItem) => {
    if (item.subItems?.length) {
      setTabOpenStates((prev) => {
        const isCurrentlyOpen = !!prev[item.href];
        const newState = { ...prev, [item.href]: !isCurrentlyOpen };
        localStorage.setItem('tabOpenStates', JSON.stringify(newState));
        if (!isCurrentlyOpen) {
          const targetPath = findFirstLeafHref(item.subItems) ?? item.href;
          if (targetPath && location.pathname !== targetPath) {
            navigate(targetPath);
            setActivePath(targetPath);
            localStorage.setItem('lastActivePath', targetPath);
          }
        }
        return newState;
      });
    } else {
      navigate(item.href);
      setActivePath(item.href);
      localStorage.setItem('lastActivePath', item.href);
      close();
    }
  };

  const handleSubItemClick = (href: string) => {
    navigate(href);
    setActivePath(href);
    localStorage.setItem('lastActivePath', href);
    const parentItem = findParentForHref(filteredNavigation, href);
    if (parentItem) {
      setTabOpenStates((prev) => {
        const newState = { ...prev, [parentItem.href]: true };
        localStorage.setItem('tabOpenStates', JSON.stringify(newState));
        return newState;
      });
    }
    close();
  };

  const NavItem = ({ item }: { item: NavigationItem }) => {
    const hasSubItems = !!item.subItems?.length;
    const leafHrefs = item.subItems ? flattenSubItemHrefs(item.subItems) : [];
    const isActive =
      activePath === item.href ||
      leafHrefs.includes(activePath) ||
      (hasSubItems && tabOpenStates[item.href]);

    const renderLeaf = (subItem: NavigationSubItem) => {
      if (!subItem.href) {
        return null;
      }
      const isLeafActive = activePath === subItem.href;
      return (
        <div
          key={subItem.name}
          style={{
            padding: '8px 10px',
            borderRadius: rem(6),
            color: isLeafActive ? '#ffffff' : '#e0e7ff',
            backgroundColor: isLeafActive ? 'rgba(37, 99, 235, 0.35)' : 'transparent',
            fontSize: rem(13),
            display: 'flex',
            alignItems: 'center',
            gap: rem(8),
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onClick={(event) => {
            event.stopPropagation();
            handleSubItemClick(subItem.href!);
          }}
        >
          <span
            style={{
              width: rem(4),
              height: rem(4),
              backgroundColor: isLeafActive ? '#60a5fa' : '#cbd5f5',
              borderRadius: '50%',
            }}
          />
          <Text size="sm" style={{ flex: 1 }} c={isLeafActive ? '#ffffff' : undefined}>
            {subItem.name}
          </Text>
        </div>
      );
    };

    return (
      <li
        style={{
          display: 'block',
          width: '100%',
          padding: rem(12),
          borderRadius: rem(8),
          textDecoration: 'none',
          color: isActive ? '#ffffff' : '#9ca3af',
          backgroundColor: isActive ? '#2a4365' : 'transparent',
          fontWeight: isActive ? 600 : 500,
          fontSize: rem(14),
          transition: 'all 0.3s ease-in-out',
          listStyle: 'none',
          position: 'relative',
          boxShadow:
            hasSubItems && tabOpenStates[item.href]
              ? '0 4px 6px rgba(0, 0, 0, 0.1)'
              : 'none',
          borderLeft: isActive ? '4px solid #60a5fa' : 'none',
          marginBottom: hasSubItems ? rem(4) : 0,
          minHeight: hasSubItems ? rem(48) : 'auto',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          if (!isActive && !hasSubItems) {
            (e.target as HTMLElement).style.backgroundColor = 'transparent';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive && !hasSubItems) {
            (e.target as HTMLElement).style.backgroundColor = 'transparent';
          }
        }}
        onClick={() => handleTabClick(item)}
      >
        <Group gap="sm" style={{ position: 'relative', zIndex: 1 }}>
          <item.icon size={20} />
          <Text size="sm">{item.name}</Text>
          {hasSubItems && (
            <Box
              style={{
                transition: 'transform 0.3s ease',
                transform: tabOpenStates[item.href] ? 'rotate(180deg)' : 'rotate(0deg)',
                marginLeft: 'auto',
              }}
            >
              <IconCaretDown size={16} />
            </Box>
          )}
        </Group>
        {hasSubItems && tabOpenStates[item.href] && (
          <div
            style={{
              marginTop: 20,
              padding: '12px 0 0 16px',
              listStyle: 'none',
              background: 'linear-gradient(135deg, #2a4365, #3b82f6)',
              borderRadius: rem(6),
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <Stack gap={12}>
              {item.subItems?.map((subItem) =>
                subItem.children?.length ? (
                  <Stack key={subItem.name} gap={8}>
                    <Text size="xs" c="#bfdbfe" fw={600} tt="uppercase">
                      {subItem.name}
                    </Text>
                    <Stack gap={6}>{subItem.children.map((child) => renderLeaf(child))}</Stack>
                  </Stack>
                ) : (
                  renderLeaf(subItem)
                )
              )}
            </Stack>
          </div>
        )}
      </li>
    );
  };
  return (
    <AppShell
      header={{ height: { base: 60, sm: 70 } }}
      navbar={{
        width: { base: 280, sm: 300 },
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding={{ base: 'sm', sm: 'md', lg: 'lg' }}
      styles={(theme) => ({
        main: {
          backgroundColor: '#f9fafb',
          minHeight: 'calc(100vh - 70px)',
          '@keyframes slideDown': {
            '0%': { maxHeight: 0, opacity: 0 },
            '100%': { maxHeight: '200px', opacity: 1 },
          },
        },
      })}
    >
      <Modal
        opened={logoutModal}
        onClose={() => setLogoutModal(false)}
        title={<h2 className="text-lg font-semibold text-gray-800">Confirm Logout</h2>}
        centered
      >
        <div className="space-y-6">
          <p className="text-gray-700 text-sm">
            Are you sure you want to log out?
          </p>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              onClick={() => setLogoutModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded hover:bg-red-700 transition-colors"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </Modal>

      <AppShell.Header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <Group h="100%" px={{ base: 'md', sm: 'xl' }} justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color="#6c757d" />
            <Text
              size="xl"
              fw={700}
              c="#111827"
              hiddenFrom="base"
              visibleFrom="xs"
            >
              Welcome back, {userInfo.firstName || 'User'} {userInfo.lastName || ''}
            </Text>
          </Group>

          <Group gap="md">
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <UnstyledButton>
                  <Group gap="sm">
                    <Avatar
                      size={36}
                      radius="xl"
                      src={user?.avatar}
                      style={{ backgroundColor: '#e5e7eb' }}
                    />
                    <Box visibleFrom="sm">
                      <Text size="sm" fw={500} c="#111827">
                        {userInfo.firstName || 'User'} {userInfo.lastName || ''}
                      </Text>
                      <Text size="xs" c="#6b7280">
                        {effectiveRoles.join(', ') || 'No Role'}
                      </Text>
                    </Box>
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconLogout size={14} />}
                  color="red"
                  onClick={() => setLogoutModal(true)}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="md"
        style={{
          backgroundColor: '#1f2937',
          border: 'none',
        }}
      >
        <AppShell.Section>
          <Group mb="xl" px="xs">
            <Box
              style={{
                width: rem(40),
                height: rem(40),
                backgroundColor: '#ffffff',
                borderRadius: rem(8),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text size="lg" fw={700} c="#1f2937">
                R
              </Text>
            </Box>
            <Text size="lg" fw={700} c="#ffffff">
              R-OS
            </Text>
          </Group>
        </AppShell.Section>

        <AppShell.Section grow>
          <div
            style={{
              maxHeight: 'calc(100vh - 250px)',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <style>
              {`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}
            </style>
            <ul style={{ padding: 0, margin: 0 }}>
              {filteredNavigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </ul>
          </div>
        </AppShell.Section>

        <AppShell.Section>
          <Divider my="md" color="#374151" />
          <Box px="xs">
            <Text size="xs" c="#6b7280" mb={4}>
              Version
            </Text>
            <Text size="sm" fw={500} c="#9ca3af">
              v1.0.0
            </Text>
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};