import { useState } from 'react';
import { ChatInput } from '@/components/chat/ChatInput';
import { AudioMessage } from '@/components/chat/AudioMessage';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { toast } from 'sonner';
import { saveChatMessage } from '@/services/healthData';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  audioUrl?: string;
  transcription?: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSendMessage = async (text: string, audioUrl?: string, transcription?: string, metadata?: object) => {
    try {
      setIsLoading(true);
      
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        text,
        isUser: true,
        audioUrl,
        transcription,
      };
      
      setMessages(prev => [...prev, userMessage]);
      saveChatMessage(userMessage);

      // Call API
      const response = await axios({
        method: 'post',
        url: 'https://service.aigate.app/v1/chat/completions',
        headers: {
          'Authorization': 'Bearer app-sVzMPqGDTYKCkCJCQToMs4G2',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: {
          query: text,
          ...metadata
        },
        timeout: 60000, // Tăng timeout lên 60 giây
        validateStatus: (status) => status >= 200 && status < 500 // Chấp nhận status 2xx, 3xx, 4xx
      });

      // Add AI response
      if (response.data && response.data.answer) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.data.answer,
          isUser: false,
        };
        
        setMessages(prev => [...prev, aiMessage]);
        saveChatMessage(aiMessage);
      } else {
        throw new Error('Invalid API response');
      }

    } catch (error: any) {
      console.error('API Error:', error);
      
      // Xử lý các loại lỗi cụ thể
      if (error.code === 'ECONNABORTED') {
        toast.error("Yêu cầu quá thời gian, vui lòng thử lại");
      } else if (error.response) {
        // Lỗi từ server với status code
        const status = error.response.status;
        if (status === 401) {
          toast.error("Lỗi xác thực, vui lòng đăng nhập lại");
        } else if (status === 429) {
          toast.error("Quá nhiều yêu cầu, vui lòng thử lại sau");
        } else {
          toast.error(`Lỗi từ máy chủ: ${status}`);
        }
      } else if (error.request) {
        // Không nhận được phản hồi từ server
        toast.error("Không thể kết nối đến máy chủ, vui lòng kiểm tra kết nối mạng");
      } else {
        toast.error("Có lỗi xảy ra: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleLogSelect = (logId: string) => {
    setSelectedLogId(logId);
  };

  return (
    <div className="flex flex-col h-screen pb-16">
      <ChatHeader 
        onBack={handleBack}
        selectedLogId={selectedLogId}
        onLogSelect={handleLogSelect}
      />
      
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`mb-4 ${message.isUser ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block max-w-[80%] p-3 rounded-lg ${
                message.isUser
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {message.audioUrl ? (
                <AudioMessage
                  audioUrl={message.audioUrl}
                  transcription={message.transcription}
                />
              ) : (
                <p className="whitespace-pre-wrap">{message.text}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}