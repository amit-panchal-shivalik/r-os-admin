import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('🌍 PublicRoute Check:', {
    isAuthenticated,
    isLoading,
  });

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    console.log('✅ PublicRoute: Already authenticated, redirecting to /');
    return <Navigate to="/" replace />;
  }

  console.log('🌍 PublicRoute: Access granted (not authenticated)');
  return <>{children}</>;
};
