import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to continue",
        variant: "destructive",
      });
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }



  // Check if profile is complete
  // We allow access to /profile even if incomplete, obviously
  // We might also want to allow /connect-wallet or other setup pages
  /*
  if (user && !user.profileComplete && location.pathname !== '/profile' && location.pathname !== '/connect-wallet') {
    // Only show toast if we are actually redirecting
    // We use a ref or just rely on the fact that this component re-renders
    // But to avoid toast spam, maybe just redirect silently or show once.
    // For now, let's just redirect.
    return <Navigate to="/profile" replace />;
  }
  */

  return <>{children}</>;
};
