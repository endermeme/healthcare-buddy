import { useState, useRef, useEffect } from 'react';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { toast } from 'sonner';
import { saveChatMessage } from '@/services/healthData';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChatMessages } from '@/components/chat/ChatMessages';

const SELECTED_LOGS_KEY = 'selected_chat_logs';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  audioUrl?: string;
  transcription?: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const savedMessages = localStorage.getItem('chat_messages');
      return savedMessages ? JSON.parse(savedMessages) : [];
    } catch (error) {
      console.error('Error parsing saved messages:', error);
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(SELECTED_LOGS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error parsing selected logs:', error);
      return [];
    }
  });

  const navigate = useNavigate();
  const processingMessageRef = useRef<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('chat_messages', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(SELECTED_LOGS_KEY, JSON.stringify(selectedLogIds));
    } catch (error) {
      console.error('Error saving selected logs:', error);
    }
  }, [selectedLogIds]);

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
      
      const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const userMessage: Message = {
        id: messageId,
        text,
        isUser: true,
        audioUrl,
        transcription,
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
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
          id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text: response.data.text || response.data.answer,
          isUser: false,
        };
        
        setMessages(prevMessages => [...prevMessages, aiMessage]);
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
      
      <ChatMessages messages={messages} />

      <ChatInput 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading}
        selectedLogIds={selectedLogIds}
      />
    </div>
  );
}