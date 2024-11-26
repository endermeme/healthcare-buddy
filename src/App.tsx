import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import History from "./pages/History";
import Detail from "./pages/Detail";
import Profile from "./pages/Profile";
import { fetchHealthData } from "@/services/healthData";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 5000,
      refetchIntervalInBackground: true,
    },
  },
});

const AppContent = () => {
  const location = useLocation();
  const isMainScreen = location.pathname === '/';
  
  useQuery({
    queryKey: ['healthData'],
    queryFn: fetchHealthData,
    staleTime: 4000,
  });

  return (
    <div className="pb-16">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/history" element={<History />} />
        <Route path="/detail/:id" element={<Detail />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <BottomNav />
      {isMainScreen && (
        <Sonner
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1A1F2C',
              color: 'white',
              border: 'none',
              opacity: '1',
            },
            duration: 3000,
          }}
          className="w-auto"
        />
      )}
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;