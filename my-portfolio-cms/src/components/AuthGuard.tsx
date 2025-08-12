import { useAuth } from "@/hooks/useAuth";
import Login from "./Login";
import Signup from "./Signup";
import { useState } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  message?: string;
}

export default function AuthGuard({ children, requireAuth = true, message = "Please login to continue" }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth();
  const [showSignup, setShowSignup] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
        <div className="text-center max-w-md w-full">
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
            <p className="text-yellow-800">{message}</p>
          </div>
          
          {showSignup ? (
            <div>
              <Signup />
              <p className="mt-4 text-sm text-center">
                Already have an account?{" "}
                <button 
                  onClick={() => setShowSignup(false)}
                  className="text-primary hover:underline"
                >
                  Sign in
                </button>
              </p>
            </div>
          ) : (
            <div>
              <Login />
              <p className="mt-4 text-sm text-center">
                Don't have an account?{" "}
                <button 
                  onClick={() => setShowSignup(true)}
                  className="text-primary hover:underline"
                >
                  Sign up
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
