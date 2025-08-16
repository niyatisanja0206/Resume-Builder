// App.tsx
import { ToastProvider } from './components/ToastComponents';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Dashboard from '@/pages/Dashboard';
import Portfolio from '@/pages/Portfolio';
import Landing from '@/pages/Landing';
import ProfilePage from '@/pages/ProfilePage';
import { UserProvider } from '@/contexts/UserContext';
import Login from './components/Login';
import Signup from './components/Signup';
import ForgetPass from './components/ForgetPass';

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
                element={<Portfolio />}
              />
              <Route
                path="/signup"
                element={<Signup />}
              />
              <Route
                path="/dashboard"
                element={<Dashboard />}
              />
              <Route
                path="/profile"
                element={<ProfilePage />}
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
