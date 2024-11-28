import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Alert } from "./components/ui/alert";
import Index from './pages/Index';
import Chat from './pages/Chat';
import History from './pages/History';
import Detail from './pages/Detail';
import Profile from './pages/Profile';
import BottomNav from './components/BottomNav';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 pb-20">
          <Alert id="app-alert">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">Welcome to Health Assistant</h2>
              <p>Track your health data and get personalized insights</p>
            </div>
          </Alert>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/history" element={<History />} />
            <Route path="/detail/:id" element={<Detail />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
        <BottomNav />
        <Toaster />
      </div>
    </Router>
  );
};

export default App;