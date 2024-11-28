import { Home, MessageSquare, History, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (section: string) => {
    navigate(section);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-white">
      <div className="mx-auto flex items-center justify-around px-4 py-2">
        <Button 
          variant={location.pathname === '/' ? 'default' : 'ghost'} 
          size="icon"
          onClick={() => handleClick('/')}
        >
          <Home className="h-5 w-5" />
        </Button>
        <Button 
          variant={location.pathname === '/chat' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => handleClick('/chat')}
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
        <Button 
          variant={location.pathname === '/history' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => handleClick('/history')}
        >
          <History className="h-5 w-5" />
        </Button>
        <Button 
          variant={location.pathname === '/profile' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => handleClick('/profile')}
        >
          <User className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
};