// App.tsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Dashboard from '@/pages/Dashboard';
import Portfolio from '@/pages/Portfolio';
import Landing from '@/pages/Landing';
import { UserProvider } from '@/contexts/UserContext';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route
              path="/portfolio"
              element={<Portfolio />}
            />
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />
          </Routes>
          <Footer />
        </Router>
      </UserProvider>
    </QueryClientProvider>
  );
}
