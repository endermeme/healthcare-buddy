import { Home, MessageSquare, BookOpen } from 'lucide-react';
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
    <nav className="fixed bottom-0 left-0 right-0">
      <div className="mx-auto max-w-lg bg-white shadow-lg border-t">
        <div className="flex items-center justify-around px-4 py-2">
          <Button 
            variant={location.pathname === '/' ? 'default' : 'ghost'} 
            size="icon"
            onClick={() => handleClick('/')}
            className="h-10 w-10"
          >
            <Home className="h-5 w-5" />
          </Button>
          <Button 
            variant={location.pathname === '/chat' ? 'default' : 'ghost'}
            className={`${location.pathname === '/chat' ? 'bg-primary text-white' : ''} 
              h-12 w-12 rounded-full shadow-lg hover:scale-105 transition-all duration-200`}
            size="icon"
            onClick={() => handleClick('/chat')}
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10"
            onClick={() => handleClick('posts')}
          >
            <BookOpen className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};