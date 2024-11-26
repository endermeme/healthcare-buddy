import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SetupWizard } from '@/components/SetupWizard';

const Chat = () => {
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hasCompletedSetup = localStorage.getItem('hasCompletedSetup');
    if (!hasCompletedSetup) {
      setShowSetupWizard(true);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex h-14 items-center px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="text-sm font-medium">AI Assistant</span>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <iframe
          src="http://service.aigate.app/chatbot/gvowxmS6fMTg4AHz"
          className="w-full h-full min-h-[700px]"
          frameBorder="0"
          allow="microphone"
        />
      </main>

      {showSetupWizard && (
        <SetupWizard onClose={() => {
          setShowSetupWizard(false);
          localStorage.setItem('hasCompletedSetup', 'true');
        }} />
      )}
    </div>
  );
};

export default Chat;