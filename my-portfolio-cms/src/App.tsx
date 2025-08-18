// App.tsx
import { ToastProvider } from './components/shared/ToastComponents';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import Dashboard from '@/pages/Dashboard';
import Portfolio from '@/pages/Portfolio';
import Landing from '@/pages/Landing';
import ProfilePage from '@/pages/ProfilePage';
import { UserProvider } from '@/contexts/UserContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ForgetPass from './components/auth/ForgetPass';
import ErrorBoundary from './components/dashboard/ErrorBoundary';

// Import the new layout components
import ProtectedLayout from './layout/ProtectedLayout';
import PublicLayout from './layout/PublicLayout';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <ToastProvider>
          <Router>
            <Header/>
            <Routes>
              {/* Public routes that are always accessible */}
              <Route path="/" element={<Landing />} />

              {/* Routes for authenticated users only */}
              <Route element={<ProtectedLayout />}>
                <Route 
                  path="/portfolio" 
                  element={
                    <ErrorBoundary fallback={<div>Portfolio Error</div>}>
                      <Portfolio />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ErrorBoundary fallback={<div>Dashboard Error</div>}>
                      <Dashboard />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ErrorBoundary fallback={<div>Profile Error</div>}>
                      <ProfilePage />
                    </ErrorBoundary>
                  } 
                />
              </Route>

              {/* Routes for unauthenticated users only */}
              <Route element={<PublicLayout />}>
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forget-password" element={<ForgetPass />} />
              </Route>
            </Routes>
            <Footer/>
          </Router>
        </ToastProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}
