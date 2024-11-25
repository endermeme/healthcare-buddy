import { Home, MessageSquare, BookOpen, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useTheme } from 'next-themes';

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

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

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-white dark:bg-dark-card dark:border-gray-700">
      <div className="mx-auto flex items-center justify-around px-4 py-2">
        <Button 
          variant={location.pathname === '/' ? 'default' : 'ghost'} 
          size="icon"
          onClick={() => handleClick('/')}
          className="dark:text-gray-300"
        >
          <Home className="h-5 w-5" />
        </Button>
        <Button 
          variant={location.pathname === '/chat' ? 'default' : 'ghost'}
          className={location.pathname === '/chat' ? 'bg-primary text-white' : 'dark:text-gray-300'}
          size="icon"
          onClick={() => handleClick('/chat')}
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleClick('posts')}
          className="dark:text-gray-300"
        >
          <BookOpen className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="dark:text-gray-300"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </nav>
  );
};