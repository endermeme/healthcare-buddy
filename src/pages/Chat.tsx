import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { SetupWizard } from '@/components/SetupWizard';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { loadLogs, HourlyLog } from '@/services/healthData';
import { sendAudioToSpeechToText, sendChatMessage } from '@/services/api';

interface Message {
  type: 'user' | 'bot';
  content: string;
  audioUrl?: string;
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

  const handleSendMessage = async (message: string) => {
    if (!selectedLogData) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng chọn bản ghi trước khi hỏi về chỉ số.",
      });
      return;
    }

    try {
      setIsLoading(true);
      setMessages(prev => [...prev, { type: 'user', content: message }]);
      
      const response = await sendChatMessage({
        nhiptim: selectedLogData.heartRates.join(' '),
        oxy: selectedLogData.oxygenLevels.join(' ')
      }, message);

      if (response.answer) {
        setMessages(prev => [...prev, { type: 'bot', content: response.answer }]);
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

  const handleSendAudio = async (audioBlob: Blob) => {
    if (!selectedLogData) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng chọn bản ghi trước khi hỏi về chỉ số.",
      });
      return;
    }

    try {
      setIsLoading(true);
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const speechResponse = await sendAudioToSpeechToText(audioBlob);

      if (speechResponse.text) {
        setMessages(prev => [...prev, { 
          type: 'user', 
          content: speechResponse.text,
          audioUrl 
        }]);

        const response = await sendChatMessage({
          nhiptim: selectedLogData.heartRates.join(' '),
          oxy: selectedLogData.oxygenLevels.join(' ')
        }, speechResponse.text);

        if (response.answer) {
          setMessages(prev => [...prev, { type: 'bot', content: response.answer }]);
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xử lý tin nhắn âm thanh. Vui lòng thử lại sau.",
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

      <MessageList messages={messages} />

      <ChatInput 
        onSendMessage={handleSendMessage}
        onSendAudio={handleSendAudio}
        isLoading={isLoading}
      />

      <div ref={messagesEndRef} />

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