import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminData, isAuthenticated as checkAuth, getStoredAdminData, logout as logoutApi } from '../apis/adminAuthApi';

interface AuthContextType {
  isAuthenticated: boolean;
  admin: AdminData | null;
  isLoading: boolean;
  login: (adminData: AdminData) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check authentication status on mount
  useEffect(() => {
    const initAuth = () => {
      const authenticated = checkAuth();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const adminData = getStoredAdminData();
        setAdmin(adminData);
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (adminData: AdminData) => {
    console.log('🔐 AuthContext: Logging in with admin data:', adminData);
    setIsAuthenticated(true);
    setAdmin(adminData);
    console.log('✅ AuthContext: State updated - isAuthenticated: true');
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setAdmin(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        admin,
        isLoading,
        login,
        logout,
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


