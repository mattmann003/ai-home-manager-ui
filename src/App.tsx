
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '@/pages/Dashboard';
import Properties from '@/pages/Properties';
import Issues from '@/pages/Issues';
import Handymen from '@/pages/Handymen';
import Settings from '@/pages/Settings';
import Analytics from '@/pages/Analytics';
import Communications from '@/pages/Communications';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/issues" element={<Issues />} />
          <Route path="/handymen" element={<Handymen />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/communications" element={<Communications />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
