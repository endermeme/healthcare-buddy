import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { Alert } from "@/components/ui/alert";
import { X } from "lucide-react";
import { toast } from "sonner";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import History from "./pages/History";
import Detail from "./pages/Detail";
import Profile from "./pages/Profile";
import { fetchHealthData } from "@/services/healthData";
import { useState, useEffect } from "react";

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
  const showBottomNav = location.pathname !== '/chat';
  const [lastNotificationTime, setLastNotificationTime] = useState(0);
  const [showSensorError, setShowSensorError] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const { error } = useQuery({
    queryKey: ['healthData'],
    queryFn: fetchHealthData,
    staleTime: 4000,
    retry: 2,
    meta: {
      onError: () => {
        const now = Date.now();
        if (isInitialLoad || now - lastNotificationTime >= 300000) { // Initial load or 5 minutes
          toast.error("Lỗi kết nối", {
            duration: 3000,
          });
          setLastNotificationTime(now);
          setShowSensorError(true);
        }
      },
      onSuccess: () => {
        setShowSensorError(false);
      }
    }
  });

  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  return (
    <div className={showBottomNav ? "pb-16" : ""}>
      {showSensorError && (
        <Alert 
          variant="destructive" 
          className="fixed top-0 left-0 right-0 z-50 rounded-none flex items-center justify-between py-1"
        >
          <span className="text-sm">Lỗi kết nối</span>
          <button 
            onClick={() => setShowSensorError(false)}
            className="p-1 hover:bg-destructive/10 rounded-full"
          >
            <X className="h-3 w-3" />
          </button>
        </Alert>
      )}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/history" element={<History />} />
        <Route path="/detail/:id" element={<Detail />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      {showBottomNav && <BottomNav />}
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
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;