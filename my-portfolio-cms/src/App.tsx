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

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <ToastProvider>
          <Router>
            <Header/>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route
                path="/portfolio"
                element={<><ErrorBoundary fallback={<div>Portfolio Error</div>}><Portfolio /></ErrorBoundary></>}
              />
              <Route
                path="/signup"
                element={<Signup />}
              />
              <Route
                path="/dashboard"
                element={<><ErrorBoundary fallback={<div>Dashboard Error</div>}><Dashboard /></ErrorBoundary></>}
              />
              <Route
                path="/profile"
                element={<><ErrorBoundary fallback={<div>Profile Error</div>}><ProfilePage /></ErrorBoundary></>}
              />
              <Route
                path="/login"
                element={<Login />}
              />
              <Route
                path="/forget-password"
                element={<ForgetPass />}
              />
            </Routes>
            <Footer/>
          </Router>
        </ToastProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}
