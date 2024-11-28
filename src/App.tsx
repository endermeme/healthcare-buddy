import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  const [showConnectionError, setShowConnectionError] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const { error } = useQuery({
    queryKey: ['healthData'],
    queryFn: fetchHealthData,
    staleTime: 4000,
    retry: 2,
    meta: {
      onError: () => {
        if (isInitialLoad) {
          setShowConnectionError(true);
          setTimeout(() => {
            setShowConnectionError(false);
          }, 10000);
        }
      },
      onSuccess: () => {
        setShowConnectionError(false);
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
      <Dialog open={showConnectionError} onOpenChange={setShowConnectionError}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Lỗi kết nối</h3>
            <button 
              onClick={() => setShowConnectionError(false)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Không thể kết nối với cảm biến. Đang thử kết nối lại...
          </p>
        </DialogContent>
      </Dialog>

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