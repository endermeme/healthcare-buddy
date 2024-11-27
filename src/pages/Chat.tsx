import { useState, useRef, useEffect } from 'react';
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
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const processingMessageRef = useRef<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem('chat_messages');
  };

  const handleSendMessage = async (text: string, audioUrl?: string, transcription?: string, metadata?: any) => {
    if (isLoading || processingMessageRef.current === text) {
      return;
    }

    try {
      setIsLoading(true);
      processingMessageRef.current = text;
      
      const messageId = Date.now().toString();
      const userMessage: Message = {
        id: messageId,
        text,
        isUser: true,
        audioUrl,
        transcription,
      };
      
      setMessages(prev => [...prev, userMessage]);
      localStorage.setItem('chat_messages', JSON.stringify([...messages, userMessage]));
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
          id: `ai-${Date.now()}`,
          text: response.data.text || response.data.answer,
          isUser: false,
        };
        
        setMessages(prev => [...prev, aiMessage]);
        localStorage.setItem('chat_messages', JSON.stringify([...messages, userMessage, aiMessage]));
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
      processingMessageRef.current = null;
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-white">
      <ChatHeader 
        onBack={handleBack}
        selectedLogIds={selectedLogIds}
        onLogSelect={setSelectedLogIds}
        onClearChat={handleClearChat}
      />
      
      <div className="flex-1 overflow-y-auto px-4 pt-20 pb-36">
        {messages.map(message => (
          <div
            key={message.id}
            className={`mb-4 ${message.isUser ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block max-w-[80%] p-3 rounded-lg ${
                message.isUser
                  ? 'bg-primary text-white'
                  : 'bg-gray-100'
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
        <div ref={messagesEndRef} />
      </div>

      <ChatInput 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading}
        selectedLogIds={selectedLogIds}
      />
    </div>
  );
}