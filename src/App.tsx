import { SafeAreaView, View, Platform, Text, Pressable } from 'react-native';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

const Stack = createNativeStackNavigator();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 5000,
      refetchIntervalInBackground: true,
    },
  },
});

const AppContent = () => {
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
        if (isInitialLoad || now - lastNotificationTime >= 300000) {
          toast.error("Lỗi kết nối", {
            duration: 3000,
          });
          setLastNotificationTime(now);
          setShowSensorError(false);
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
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {showSensorError && (
          <Alert 
            variant="destructive" 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 50,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 4,
            }}
          >
            <Text>Lỗi kết nối</Text>
            <Pressable 
              onPress={() => setShowSensorError(false)}
              style={({ pressed }) => ({
                padding: 4,
                borderRadius: 9999,
                backgroundColor: pressed ? 'rgba(255, 0, 0, 0.1)' : 'transparent'
              })}
            >
              <X style={{ height: 12, width: 12 }} />
            </Pressable>
          </Alert>
        )}
        
        <Stack.Navigator>
          <Stack.Screen name="Home" component={Index} />
          <Stack.Screen name="Chat" component={Chat} />
          <Stack.Screen name="History" component={History} />
          <Stack.Screen name="Detail" component={Detail} />
          <Stack.Screen name="Profile" component={Profile} />
        </Stack.Navigator>
        
        <BottomNav />
      </View>
    </SafeAreaView>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AppContent />
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    </NavigationContainer>
  );
};

export default App;