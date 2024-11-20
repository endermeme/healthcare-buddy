import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from './pages/Index';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto pb-16">
          <Index />
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default App;