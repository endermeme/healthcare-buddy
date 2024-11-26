import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import Index from '@/pages/Index';
import History from '@/pages/History';
import Detail from '@/pages/Detail';
import Chat from '@/pages/Chat';
import Profile from '@/pages/Profile';
import { initializeFirebaseMessaging } from './config/firebase';

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    initializeFirebaseMessaging();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/history" element={<History />} />
        <Route path="/detail/:id" element={<Detail />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;