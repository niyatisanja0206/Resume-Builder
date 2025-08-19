import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";

const PublicLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg text-foreground">Loading...</div>
          <div className="text-sm text-muted-foreground mt-2">Checking authentication status...</div>
        </div>
      </div>
    );
  }

  // If the user is already authenticated, redirect them to the profile
  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  // If the user is not authenticated, render the nested child routes (e.g., login, signup)
  return <Outlet />;
};

export default PublicLayout;