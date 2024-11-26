import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Loader2, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SetupWizard } from '@/components/SetupWizard';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { fetchHealthData } from '@/services/healthData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Chat = () => {
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [messages, setMessages] = useState<Array<{type: 'user' | 'bot', content: string}>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch health data
  const { data: healthData } = useQuery({
    queryKey: ['healthData'],
    queryFn: fetchHealthData,
  });

  useEffect(() => {
    const hasCompletedSetup = localStorage.getItem('hasCompletedSetup');
    if (!hasCompletedSetup) {
      setShowSetupWizard(true);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getSelectedHealthData = () => {
    if (!healthData || selectedTimeIndex === null) return null;
    
    const sortedData = [...healthData].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return sortedData[selectedTimeIndex];
  };

  const formatTimeString = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const selectedData = getSelectedHealthData();
    if (!selectedData && inputMessage.toLowerCase().includes('chỉ số')) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng chọn thời điểm dữ liệu trước khi hỏi về chỉ số.",
      });
      return;
    }

    try {
      setIsLoading(true);
      setMessages(prev => [...prev, { type: 'user', content: inputMessage }]);
      
      const response = await axios.post('http://service.aigate.app/v1/chat-messages', {
        inputs: {
          nhiptim: selectedData ? selectedData.heartRates.join(' ') : "80 90 80 80 80 88 32 83 82 82 23 93 92 82 83 92 82 92",
          oxy: selectedData ? selectedData.oxygenLevels.join(' ') : "93 93 98 98 98 98 98 98 98 98 98 98 87 98"
        },
        query: inputMessage,
        response_mode: "blocking",
        conversation_id: "",
        user: "abc-123"
      }, {
        headers: {
          'Authorization': 'Bearer app-sVzMPqGDTYKCkCJCQToMs4G2',
          'Content-Type': 'application/json'
        }
      });

      if (response.data.answer) {
        setMessages(prev => [...prev, { type: 'bot', content: response.data.answer }]);
      } else {
        throw new Error('Invalid response format');
      }
      setInputMessage('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể gửi tin nhắn. Vui lòng thử lại sau.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
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
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {selectedTimeIndex !== null && healthData ? 
                    formatTimeString(healthData[selectedTimeIndex].timestamp) :
                    'Chọn thời điểm'
                  }
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {healthData && [...healthData]
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((data, index) => (
                    <DropdownMenuItem
                      key={data.timestamp}
                      onClick={() => setSelectedTimeIndex(index)}
                      className="flex flex-col items-start"
                    >
                      <span className="font-medium">{formatTimeString(data.timestamp)}</span>
                      <span className="text-xs text-gray-500">
                        Nhịp tim: {data.heartRates.join(', ')} | 
                        SpO2: {data.oxygenLevels.join(', ')}
                      </span>
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-20">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <p>Xin chào! Tôi có thể giúp gì cho bạn?</p>
              <p className="text-sm mt-2">Hãy đặt câu hỏi về các chỉ số sức khỏe của bạn.</p>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-4 rounded-2xl max-w-[80%] ${
                  message.type === 'user'
                    ? 'bg-primary text-white ml-auto'
                    : 'bg-white shadow-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
              placeholder="Nhập câu hỏi của bạn..."
              className="flex-1 p-3 border rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isLoading}
            />
            <Button 
              onClick={sendMessage}
              disabled={isLoading}
              size="icon"
              className="rounded-full w-12 h-12"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

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