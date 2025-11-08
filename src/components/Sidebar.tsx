import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  ShoppingBag,
  Users,
  Calendar,
  Home,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  communityId: string;
  // optional client-side tab selector: if provided, sidebar will invoke this instead of navigating
  onSelect?: (tab: 'overview' | 'directory' | 'events' | 'marketplace' | 'pulses') => void;
  activeTab?: 'overview' | 'directory' | 'events' | 'marketplace' | 'pulses';
}

export default function Sidebar({ communityId, onSelect, activeTab }: SidebarProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    {
      label: 'Overview',
      href: `/community/${communityId}`,
      icon: Home,
      tab: 'overview' as const,
    },
    {
      label: 'Pulses',
      href: `/community/${communityId}/pulses`,
      icon: MessageSquare,
      tab: 'pulses' as const,
    },
    {
      label: 'Marketplace',
      href: `/community/${communityId}/marketplace`,
      icon: ShoppingBag,
      tab: 'marketplace' as const,
    },
    {
      label: 'Directory',
      href: `/community/${communityId}/directory`,
      icon: Users,
      tab: 'directory' as const,
    },
    {
      label: 'Events',
      href: `/community/${communityId}/events`,
      icon: Calendar,
      tab: 'events' as const,
    },
  ];

  return (
    <aside
      className={cn(
        // hide on small screens, show from md and up; make sidebar full-height and sticky on larger screens
        'hidden md:flex md:flex-col md:transition-all md:py-5 md:px-4 md:ps-10 md:border-r bg-left-panel',
        collapsed ? 'md:w-23' : 'md:w-64',
        'md:sticky md:top-0 md:min-h-screen'
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className={cn('flex items-center gap-2', collapsed ? 'justify-center w-full' : '')}>
          <div className="text-lg font-semibold">{!collapsed && 'Sections'}</div>
        </div>
        <button
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setCollapsed((v) => !v)}
          className="rounded p-1 hover:bg-muted"
        >
          {collapsed ? <ChevronRight className="h-5 w-6" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      <nav className="space-y-2 flex-1 overflow-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = onSelect ? activeTab === item.tab : (pathname === item.href || pathname?.startsWith(item.href + '/'));
          // If onSelect is provided, call it instead of navigating.
          if (onSelect) {
            return (
              <button
                key={item.href}
                onClick={() => onSelect(item.tab)}
                className={cn(
                  'w-full text-left flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                  isActive ? 'bg-black text-white shadow' : 'text-black hover:bg-gray-200'
                )}
              >
                <div className="flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <span className={cn('truncate', collapsed ? 'hidden' : 'block')}>{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                isActive ? 'bg-black text-white shadow' : 'text-black hover:bg-gray-200'
              )}
            >
              <div className="flex items-center justify-center">
                <Icon className="h-5 w-5" />
              </div>
              <span className={cn('truncate', collapsed ? 'hidden' : 'block')}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

