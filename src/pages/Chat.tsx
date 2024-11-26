import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';
import { SetupWizard } from '@/components/SetupWizard';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { AudioMessage } from '@/components/chat/AudioMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { loadLogs, HourlyLog } from '@/services/healthData';

interface Message {
  type: 'user' | 'bot';
  content: string;
  audioUrl?: string;
  transcription?: string;
}

const Chat = () => {
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [selectedLogData, setSelectedLogData] = useState<{
    heartRates: number[];
    oxygenLevels: number[];
  } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasCompletedSetup = localStorage.getItem('hasCompletedSetup');
    if (!hasCompletedSetup) {
      setShowSetupWizard(true);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const processLogData = (log: HourlyLog) => {
    const validData = log.secondsData.filter(data => 
      data.heartRate > 0 && 
      data.heartRate < 300 && 
      data.bloodOxygen > 0 &&
      data.bloodOxygen <= 100 
    );

    return {
      heartRates: validData.map(d => d.heartRate),
      oxygenLevels: validData.map(d => d.bloodOxygen)
    };
  };

  const handleLogSelect = (logId: string) => {
    const logs = loadLogs();
    const selectedLog = logs.find(log => log.hour === logId);
    
    if (selectedLog) {
      const processedData = processLogData(selectedLog);
      setSelectedLogId(logId);
      setSelectedLogData(processedData);
    }
  };

  const sendMessage = async (text: string, audioUrl?: string, transcription?: string) => {
    if (!text.trim()) return;

    if (!selectedLogData) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng chọn bản ghi trước khi hỏi về chỉ số.",
      });
      return;
    }

    const newMessage: Message = {
      type: 'user',
      content: text,
      audioUrl,
      transcription
    };
    setMessages(prev => [...prev, newMessage]);

    try {
      setIsLoading(true);
      
      const response = await axios.post('http://service.aigate.app/v1/chat-messages', {
        inputs: {
          nhiptim: selectedLogData.heartRates.join(' '),
          oxy: selectedLogData.oxygenLevels.join(' ')
        },
        query: text,
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
      <ChatHeader 
        onBack={() => navigate('/')}
        selectedLogId={selectedLogId}
        onLogSelect={handleLogSelect}
      />

      <main className="flex-1 overflow-y-auto p-4 pb-20">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <p>Xin chào! Tôi có thể giúp gì cho bạn?</p>
              <p className="text-sm mt-2">Hãy chọn một bản ghi và đặt câu hỏi về các chỉ số sức khỏe của bạn.</p>
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
                {message.audioUrl && message.transcription && (
                  <AudioMessage 
                    audioUrl={message.audioUrl}
                    transcription={message.transcription}
                  />
                )}
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <ChatInput 
        onSendMessage={sendMessage}
        isLoading={isLoading}
      />

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