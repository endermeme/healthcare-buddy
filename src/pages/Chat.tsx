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
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem('chat_messages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSendMessage = async (text: string, audioUrl?: string, transcription?: string, metadata?: any) => {
    try {
      setIsLoading(true);
      
      const userMessage: Message = {
        id: Date.now().toString(),
        text,
        isUser: true,
        audioUrl,
        transcription,
      };
      
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      localStorage.setItem('chat_messages', JSON.stringify(newMessages));
      saveChatMessage(userMessage);

      const response = await axios({
        method: 'post',
        url: 'http://service.aigate.app/v1/chat-messages',
        headers: {
          'Authorization': 'Bearer app-sVzMPqGDTYKCkCJCQToMs4G2',
          'Content-Type': 'application/json'
        },
        data: {
          inputs: {
            nhiptim: metadata?.nhiptim || "",
            oxy: metadata?.oxy || "",
            tuoi: metadata?.tuoi || "",
            tiensubenh: metadata?.tiensubenh || "",
            gioitinh: metadata?.gioitinh || "",
            cannang: metadata?.cannang || ""
          },
          query: text,
          response_mode: "blocking",
          conversation_id: "",
          user: "abc-123"
        },
        timeout: 60000,
        validateStatus: (status) => status >= 200 && status < 500
      });

      if (response.data && (response.data.text || response.data.answer)) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.data.text || response.data.answer,
          isUser: false,
        };
        
        const updatedMessages = [...newMessages, aiMessage];
        setMessages(updatedMessages);
        localStorage.setItem('chat_messages', JSON.stringify(updatedMessages));
        saveChatMessage(aiMessage);
      } else {
        throw new Error('Invalid or empty response from server');
      }

    } catch (error: any) {
      console.error('API Error:', error);
      
      if (error.code === 'ECONNABORTED') {
        toast.error("Yêu cầu quá thời gian, vui lòng thử lại");
      } else if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          toast.error("Lỗi xác thực, vui lòng đăng nhập lại");
        } else if (status === 429) {
          toast.error("Quá nhiều yêu cầu, vui lòng thử lại sau");
        } else {
          toast.error(`Lỗi từ máy chủ: ${status}`);
        }
      } else if (error.request) {
        toast.error("Không thể kết nối đến máy chủ, vui lòng kiểm tra kết nối mạng");
      } else {
        toast.error("Có lỗi xảy ra: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.setItem('chat_messages', JSON.stringify([]));
    toast.success("Đã xóa toàn bộ tin nhắn");
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

      <ChatInput 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading}
        onClearChat={handleClearChat}
        selectedLogId={selectedLogId}
      />
    </div>
  );
}