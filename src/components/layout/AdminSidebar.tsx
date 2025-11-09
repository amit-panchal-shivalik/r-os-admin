import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  Home,
  Building2,
  MessageSquare,
  Car,
  AlertTriangle,
  Building,
  CreditCard,
  ShieldAlert
} from 'lucide-react';

interface MenuItem {
  name: string;
  href?: string;
  icon: React.ComponentType<any>;
  subItems?: { name: string; href: string }[];
  allowedRoles?: string[]; // If not specified, available to all roles
}

// Get current admin role from localStorage
const getAdminRole = (): string => {
  try {
    const adminData = JSON.parse(localStorage.getItem('admin_data') ?? '{}');
    return adminData.roleKey || 'guest';
  } catch {
    return 'guest';
  }
};

// All menu items with role-based access control (Only implemented features)
const allMenuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    // Available to all roles
  },
  {
    name: 'Society Management',
    icon: Building,
    subItems: [
      { name: 'All Societies', href: '/societies' },
      { name: 'Pending Enquiries', href: '/societies/enquiries' },
    ],
    allowedRoles: ['super_admin', 'society_admin'],
  },
  {
    name: 'Amenities',
    icon: Building2,
    subItems: [
      { name: 'All Amenities', href: '/amenities' },
      { name: 'Add Amenity', href: '/societies/book-amenity' },
    ],
    allowedRoles: ['super_admin', 'society_admin'],
  },
  {
    name: 'Browse Amenities',
    icon: Building2,
    href: '/user-amenities',
    allowedRoles: ['super_admin', 'society_admin'],
  },
  {
    name: 'Amenity Payments',
    icon: CreditCard,
    subItems: [
      { name: 'All Bookings', href: '/amenity-payments' },
      { name: 'Payment Statistics', href: '/amenity-payments/statistics' },
    ],
    allowedRoles: ['super_admin', 'society_admin', 'finance_admin'],
  },
  {
    name: 'Complaints',
    icon: MessageSquare,
    subItems: [
      { name: 'All Complaints', href: '/complaints' },
      { name: 'Add Complaint', href: '/complaints/add' },
    ],
    allowedRoles: ['super_admin', 'society_admin', 'helpdesk_operator'],
  },
  {
    name: 'Notice',
    href: '/notice',
    icon: AlertTriangle,
    allowedRoles: ['super_admin', 'society_admin', 'community_manager'],
  },
  {
    name: 'Parking',
    icon: Car,
    subItems: [
      { name: 'Parking Settings', href: '/parking-settings' },
    ],
    allowedRoles: ['super_admin', 'society_admin'],
  },
  {
    name: 'SOS Report',
    href: '/sos-report',
    icon: ShieldAlert,
    allowedRoles: ['super_admin', 'society_admin', 'security_manager'],
  },
  {
    name: 'Input Demo',
    href: '/input-demo',
    icon: Home,
    allowedRoles: ['super_admin'], // Demo page only for super admin
  },
];

// Filter menu items based on role
const getMenuItemsForRole = (roleKey: string): MenuItem[] => {
  // Super admin sees everything
  if (roleKey === 'super_admin') {
    return allMenuItems;
  }

  // Filter items based on allowed roles
  return allMenuItems.filter(item => {
    // If no allowedRoles specified, it's available to everyone
    if (!item.allowedRoles || item.allowedRoles.length === 0) {
      return true;
    }
    // Check if user's role is in allowed roles
    return item.allowedRoles.includes(roleKey);
  });
};

interface AdminSidebarProps {
  collapsed?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  // Get filtered menu items based on current role
  const menuItems = useMemo(() => {
    const roleKey = getAdminRole();
    return getMenuItemsForRole(roleKey);
  }, []); // Empty dependency array since role doesn't change without page reload

  const toggleExpanded = (itemName: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemName)) {
      newExpanded.delete(itemName);
    } else {
      newExpanded.add(itemName);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.subItems) {
      toggleExpanded(item.name);
      // If expanding and has subItems, navigate to first subItem
      if (!expandedItems.has(item.name) && item.subItems.length > 0) {
        navigate(item.subItems[0].href);
      }
    } else if (item.href) {
      navigate(item.href);
    }
  };

  const handleSubItemClick = (href: string) => {
    navigate(href);
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const isItemActive = (item: MenuItem) => {
    if (item.href && isActive(item.href)) return true;
    if (item.subItems) {
      return item.subItems.some(subItem => isActive(subItem.href));
    }
    return false;
  };

  return (
    <div className={`sidebar-container z-[1] bg-background text-primary h-[calc(100vh-70px)] flex flex-col border-r fixed left-0 top-[70px] transition-all duration-300 ${
      collapsed ? 'w-16 overflow-y-visible' : 'w-64 overflow-y-auto'
    }`}>
      {/* No Logo Section - moved to header */}

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-visible py-4">
        <div className="px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const itemIsActive = isItemActive(item);
            const isExpanded = expandedItems.has(item.name);

            return (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => collapsed && item.subItems && setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <button
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left group ${
                    itemIsActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  } ${collapsed ? 'justify-center px-3' : ''}`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-sm font-medium">{item.name}</span>
                      {item.subItems && (
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </>
                  )}
                </button>

                {/* Submenu - Responsive behavior */}
                {item.subItems && (
                  <>
                    {/* Normal expanded state (not collapsed) */}
                    {isExpanded && !collapsed && (
                      <div className="ml-4 mt-1 space-y-1 animate-in slide-in-from-top-1 duration-200">
                        {item.subItems.map((subItem) => (
                          <button
                            key={subItem.name}
                            onClick={() => handleSubItemClick(subItem.href)}
                            className={`w-full flex items-center gap-3 px-4 py-2 rounded text-left transition-all duration-200 ${
                              isActive(subItem.href)
                                ? 'bg-accent text-accent-foreground border-l-2 border-primary'
                                : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                            }`}
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                            <span className="text-sm">{subItem.name}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Collapsed hover state - absolute positioned dropdown */}
                    {collapsed && hoveredItem === item.name && (
                      <div className="absolute left-full top-0 ml-0 z-[999] pl-4">
                        <div className=" bg-background border border-border rounded-lg shadow-lg py-2 min-w-[200px] animate-in slide-in-from-left-2 duration-200">
                          <div className="px-3 py-2 border-b border-border">
                            <span className="text-sm font-medium text-foreground">{item.name}</span>
                          </div>
                          <div className="py-1">
                            {item.subItems.map((subItem) => (
                              <button
                                key={subItem.name}
                                onClick={() => handleSubItemClick(subItem.href)}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-all duration-200 hover:bg-accent hover:text-accent-foreground ${
                                  isActive(subItem.href)
                                    ? 'bg-accent text-accent-foreground border-r-2 border-primary'
                                    : 'text-muted-foreground'
                                }`}
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                                <span className="text-sm">{subItem.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <div className="font-medium text-foreground">Made by IndiaNIC Development Team</div>
          </div>
        </div>
      )}
    </div>
  );
};
