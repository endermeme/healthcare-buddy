import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import History from "./pages/History";
import Detail from "./pages/Detail";
import { fetchHealthData } from "@/services/healthData";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 5000, // Fetch every 5 seconds
      refetchIntervalInBackground: true, // Continue fetching even when tab is not active
    },
  },
});

const AppContent = () => {
  // This query will run continuously in the background
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
      </Routes>
      <BottomNav />
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