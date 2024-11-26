import { Home, MessageSquare, History, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (section: string) => {
    if (section === 'posts') {
      toast({
        title: `Đang chuyển tới ${section}`,
        description: "Tính năng này sẽ sớm ra mắt!",
      });
      return;
    }
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
          variant="ghost" 
          size="icon" 
          onClick={() => handleClick('posts')}
        >
          <BookOpen className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
};