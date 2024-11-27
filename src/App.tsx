import { NotificationHandler } from './components/NotificationHandler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { BottomNav } from './components/BottomNav';
import Home from './pages/Home';
import Chat from './pages/Chat';
import History from './pages/History';
import Profile from './pages/Profile';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <NotificationHandler />
          <div className="container max-w-lg mx-auto pb-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/history" element={<History />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
          <BottomNav />
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;