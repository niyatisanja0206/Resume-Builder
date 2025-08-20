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
import ResumePreviewPage from '@/pages/ResumePreviewPage';
import { UserProvider } from '@/contexts/UserContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ForgetPass from './components/auth/ForgetPass';
import ErrorBoundary from './components/dashboard/ErrorBoundary';

// Import the new layout components
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';

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
              <Route 
                  path="/portfolio" 
                  element={
                    <ErrorBoundary fallback={<div>Portfolio Error</div>}>
                      <Portfolio />
                    </ErrorBoundary>
                  } 
                />

              {/* Protected routes for authenticated users only */}
              <Route element={<ProtectedRoute />}>
                <Route 
                  path="/dashboard" 
                  element={
                    <ErrorBoundary fallback={<div>Dashboard Error</div>}>
                      <Dashboard />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="/dashboard/:resumeId" 
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
                <Route 
                  path="/resume/:resumeId" 
                  element={
                    <ErrorBoundary fallback={<div>Resume Preview Error</div>}>
                      <ResumePreviewPage />
                    </ErrorBoundary>
                  } 
                />
              </Route>

              {/* Public routes for unauthenticated users only */}
              <Route element={<PublicRoute />}>
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
