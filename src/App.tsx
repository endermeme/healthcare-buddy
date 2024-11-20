import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from './pages/Index';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

const App = () => {
  return (
    <NavigationContainer>
      <QueryClientProvider client={queryClient}>
        <SafeAreaView style={{ flex: 1 }}>
          <StatusBar barStyle="dark-content" />
          <Stack.Navigator>
            <Stack.Screen 
              name="Home" 
              component={Index}
              options={{ title: 'Health Monitor' }}
            />
          </Stack.Navigator>
        </SafeAreaView>
      </QueryClientProvider>
    </NavigationContainer>
  );
};

export default App;