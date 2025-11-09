import { ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  Radio,
  ShoppingBag,
  BookOpen,
  Calendar,
  Settings,
  Menu,
  UserCheck,
  X,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Communities", path: "/admin/communities" },
  { icon: UserCheck, label: "Join Requests", path: "/admin/join-requests" },
  { icon: Radio, label: "Pulses", path: "/admin/pulses" },
  { icon: ShoppingBag, label: "Marketplace", path: "/admin/marketplace" },
  { icon: Calendar, label: "Events", path: "/admin/events" },
  { icon: Users, label: "User Management", path: "/admin/users" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["admin-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border">
        {(sidebarOpen || isMobile) ? (
          <h1 className="text-xl font-bold text-sidebar-foreground">
            Community
          </h1>
        ) : (
          <span className="text-2xl font-bold text-sidebar-foreground">C</span>
        )}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin"}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent",
              !sidebarOpen && !isMobile && "justify-center"
            )}
            activeClassName="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary"
            onClick={() => isMobile && setMobileMenuOpen(false)}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {(sidebarOpen || isMobile) && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      {(sidebarOpen || isMobile) && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {profile?.full_name || "Admin User"}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user?.email || "admin@community.com"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-white hover:bg-sidebar-accent"
            onClick={async () => {
              const { signOut } = await import("@/lib/auth");
              await signOut();
              window.location.href = "/auth";
            }}
          >
            Sign Out
          </Button>
        </div>
      )}
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background border-b flex items-center px-4">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-sidebar">
              <div className="flex flex-col h-full">
                <SidebarContent />
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-bold text-foreground ml-4">
            Community
          </h1>
        </header>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside
          className={cn(
            "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
            sidebarOpen ? "w-64" : "w-20"
          )}
        >
          <SidebarContent />
        </aside>
      )}

      {/* Main Content */}
      <main className={cn(
        "flex-1 overflow-y-auto",
        isMobile && "pt-16"
      )}>
        <div className="h-full">{children}</div>
      </main>
    </div>
  );
}
