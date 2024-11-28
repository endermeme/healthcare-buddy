import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageCircle, Clock, User } from 'lucide-react';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center">
          <button
            onClick={() => navigate('/')}
            className={`p-2 rounded-lg ${isActive('/') ? 'text-primary' : 'text-gray-500'}`}
          >
            <Home size={24} />
          </button>
          <button
            onClick={() => navigate('/chat')}
            className={`p-2 rounded-lg ${isActive('/chat') ? 'text-primary' : 'text-gray-500'}`}
          >
            <MessageCircle size={24} />
          </button>
          <button
            onClick={() => navigate('/history')}
            className={`p-2 rounded-lg ${isActive('/history') ? 'text-primary' : 'text-gray-500'}`}
          >
            <Clock size={24} />
          </button>
          <button
            onClick={() => navigate('/profile')}
            className={`p-2 rounded-lg ${isActive('/profile') ? 'text-primary' : 'text-gray-500'}`}
          >
            <User size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;