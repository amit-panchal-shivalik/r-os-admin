import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { fetchCurrentUser } from '@/apis/userService';
import { normalizeUserPayload, NormalizedUser } from '@/utils/user';

interface AuthProfile {
  user_id?: string;
  mobile_number?: string;
  roles?: string[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: NormalizedUser | null;
  profile: AuthProfile | null;
  login: (userData: NormalizedUser, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<NormalizedUser>) => void;
  refreshProfile: () => Promise<AuthProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<NormalizedUser | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);

  const refreshProfile = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return null;
    }
    try {
      const current = await fetchCurrentUser();
      setProfile(current);
      if (current.roles?.length) {
        setUser((prev) => {
          if (!prev) return prev;
          const updated = {
            ...prev,
            userRoles: current.roles,
            role: current.roles.join(', '),
          };
          localStorage.setItem('userInfo', JSON.stringify(updated));
          return updated;
        });
      }
      return current;
    } catch (error) {
      console.error('Failed to refresh profile', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return;
    }

    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const normalized = normalizeUserPayload(parsed);
        setUser(normalized);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('userInfo');
      }
    }

    refreshProfile();
  }, [refreshProfile]);

  const login = (userData: NormalizedUser, token: string) => {
    const normalized = normalizeUserPayload(userData);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('userInfo', JSON.stringify(normalized));
    setUser(normalized);
    setIsAuthenticated(true);
    setProfile({
      user_id: normalized.id,
      mobile_number: normalized.mobile_number,
      roles: normalized.userRoles,
    });
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('lastActivePath');
    localStorage.clear();
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData: Partial<NormalizedUser>) => {
    if (user) {
      const merged = { ...user, ...userData };
      const normalized = normalizeUserPayload(merged);
      setUser(normalized);
      localStorage.setItem('userInfo', JSON.stringify(normalized));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        profile,
        login,
        logout,
        updateUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
