import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  Home,
  Building2,
  Users,
  Wrench,
  MessageSquare,
  Car,
  Calendar,
  Image,
  BookOpen,
  AlertTriangle,
  Building
} from 'lucide-react';

interface MenuItem {
  name: string;
  href?: string;
  icon: React.ComponentType<any>;
  subItems?: { name: string; href: string }[];
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    name: 'Society Management',
    icon: Building,
    subItems: [
      { name: 'All Societies', href: '/societies' },
      { name: 'Add New Society', href: '/societies/add' },
      { name: 'Pending Enquiries', href: '/societies/enquiries' },
    ],
  },
  {
    name: 'Building Settings',
    icon: Building2,
    subItems: [
      { name: 'Building Details', href: '/building-details' },
      { name: 'Blocks', href: '/blocks' },
      { name: 'Floors', href: '/floors' },
      { name: 'Units', href: '/units' },
      { name: 'Parking', href: '/building-parking' },
      { name: 'Amenities', href: '/amenities' },
      { name: 'Notice Board', href: '/notice-board' },
    ],
  },
  {
    name: 'Users',
    icon: Users,
    subItems: [
      { name: 'Members', href: '/members' },
      { name: 'Society Employee', href: '/society-employee' },
      { name: 'Committee Members', href: '/committee-members' },
    ],
  },
  {
    name: 'Maintenance & Bill',
    icon: Wrench,
    subItems: [
      { name: 'Maintenance', href: '/maintenance' },
      { name: 'Bill', href: '/bill' },
    ],
  },
  {
    name: 'Complaints',
    href: '/complaints',
    icon: MessageSquare,
  },
  {
    name: 'Parking',
    icon: Car,
    subItems: [
      { name: 'Members Vehicles', href: '/members-vehicles' },
      { name: 'Vehicles In/Out', href: '/vehicle-in-out' },
      { name: 'Parking Settings', href: '/parking-settings' },
      { name: 'Tag Reader Reports', href: '/tag-reader-reports' },
      { name: 'RFID Reports', href: '/rfid-reports' },
    ],
  },
  {
    name: 'Events',
    href: '/events',
    icon: Calendar,
  },
  {
    name: 'Building Gallery',
    href: '/building-gallery',
    icon: Image,
  },
  {
    name: 'Book Amenity',
    href: '/book-amenity',
    icon: BookOpen,
  },
  {
    name: 'Penalty',
    href: '/penalty',
    icon: AlertTriangle,
  },
  {
    name: 'My Profile',
    href: '/user-profile',
    icon: Users,
  },
  {
    name: 'Input Demo',
    href: '/input-demo',
    icon: Home,
  },
];

export const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

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
    <div className="bg-design-primary text-design-white h-screen w-64 flex flex-col shadow-lg">
      {/* Logo Section */}
      <div className="p-6 border-b border-design-secondary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-design-white rounded-lg flex items-center justify-center">
            <span className="text-design-primary font-bold text-lg">R</span>
          </div>
          <span className="text-xl font-bold">R-OS</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const itemIsActive = isItemActive(item);
            const isExpanded = expandedItems.has(item.name);

            return (
              <div key={item.name}>
                <button
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-button transition-all duration-200 text-left group ${
                    itemIsActive
                      ? 'bg-design-secondary text-design-white shadow-md'
                      : 'text-design-white/70 hover:bg-design-secondary/20 hover:text-design-white'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1 text-sm font-medium">{item.name}</span>
                  {item.subItems && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>

                {/* Submenu */}
                {item.subItems && isExpanded && (
                  <div className="ml-4 mt-1 space-y-1 animate-in slide-in-from-top-1 duration-200">
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.name}
                        onClick={() => handleSubItemClick(subItem.href)}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded text-left transition-all duration-200 ${
                          isActive(subItem.href)
                            ? 'bg-design-secondary/30 text-design-white border-l-2 border-design-white'
                            : 'text-design-white/60 hover:bg-design-secondary/10 hover:text-design-white'
                        }`}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                        <span className="text-sm">{subItem.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-design-secondary/20">
        <div className="text-xs text-design-white/50">
          <div className="font-medium">Version</div>
          <div className="text-design-white/70">v1.0.0</div>
        </div>
      </div>
    </div>
  );
};
