import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { initialize } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  useEffect(() => {
    // initialize auth state from localStorage on mount
    initialize();
  }, [initialize]);

  const getInitials = (name?: string | null) => {
    if (!name) return '';
    // remove numbers and special chars, keep letters and spaces
    const letters = name.replace(/[^A-Za-z\s]/g, '').trim();
    if (!letters) return '';
    const parts = letters.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).slice(0, 2).toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-sm bg-card/70 border-b shadow-sm">
      <div className="container mx-auto px-16 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 text-lg font-bold md:text-xl">
              <span className="text-2xl font-extrabold">R-OS</span>
              {/* <span className="hidden md:inline-block text-sm text-muted-foreground"></span> */}
            </Link>
          </div>

          {/* Desktop / md+ controls */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" size="sm">
                    <span className="mr-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                      {getInitials(user?.name)}
                    </span>
                    <span className="truncate max-w-[10rem]">{user?.name}</span>
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth/login" aria-label="Login">
                  <div className="border inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <UserIcon className="h-5 w-5" />
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile controls */}
          <div className="flex items-center md:hidden">
            <button
              aria-label="Toggle menu"
              className="ml-2 inline-flex h-10 w-10 items-center justify-center rounded-md border bg-card p-2"
              onClick={() => setMobileOpen((s) => !s)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div className="mt-2 flex flex-col gap-2 md:hidden">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="flex items-center gap-3 px-2 py-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                    {getInitials(user?.name)}
                  </span>
                  <span className="font-medium">{user?.name}</span>
                </Link>
                <div className="flex items-center gap-2 px-2">
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="flex-1">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="px-2 py-2">
                <Link to="/auth/login" className="flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <span className="font-medium">Login</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

