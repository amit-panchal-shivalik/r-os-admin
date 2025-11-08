import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const PrivateRoute = ({ children, requiredRole }: PrivateRouteProps) => {
  const { isAuthenticated, admin, isLoading } = useAuth();
  const location = useLocation();

  console.log('🔒 PrivateRoute Check:', {
    path: location.pathname,
    isAuthenticated,
    isLoading,
    adminEmail: admin?.email,
  });

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('❌ PrivateRoute: Not authenticated, redirecting to /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if required
  if (requiredRole && admin?.roleKey !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('✅ PrivateRoute: Access granted');
  return <>{children}</>;
};
