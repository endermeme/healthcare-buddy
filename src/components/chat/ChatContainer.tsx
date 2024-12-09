import { useState } from 'react';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ChatHeader } from './ChatHeader';
import { toast } from 'sonner';
import axios from 'axios';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  audioUrl?: string;
  transcription?: string;
}

export const ChatContainer = () => {
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
      const saved = localStorage.getItem('selected_chat_logs');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error parsing selected logs:', error);
      return [];
    }
  });

  const handleSendMessage = async (text: string, audioUrl?: string, transcription?: string, metadata?: any) => {
    if (isLoading) return;

    setIsLoading(true);
    
    const messageId = Date.now().toString();
    const userMessage: Message = {
      id: messageId,
      text,
      isUser: true,
      audioUrl,
      transcription,
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    saveChatMessage(userMessage);

    try {
      const response = await axios({
        method: 'post',
        url: 'https://api.dify.ai/v1/chat-messages',
        headers: {
          'Authorization': 'Bearer app-sVzMPqGDTYKCkCJCQToMs4G2',
          'Content-Type': 'application/json'
        },
        data: {
          inputs: metadata,
          query: text,
          user: "web-user",
          response_mode: "streaming",
          conversation_id: localStorage.getItem('conversation_id') || ""
        },
        timeout: 60000,
        validateStatus: (status) => status >= 200 && status < 500
      });

      if (response.data && (response.data.text || response.data.answer)) {
        // Lưu conversation_id nếu có
        if (response.data.conversation_id) {
          localStorage.setItem('conversation_id', response.data.conversation_id);
        }

        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          text: response.data.text || response.data.answer,
          isUser: false,
        };
        
        setMessages(prevMessages => [...prevMessages, aiMessage]);
        saveChatMessage(aiMessage);
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
    localStorage.removeItem('chat_messages');
    localStorage.removeItem('conversation_id');
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-white">
      <ChatHeader 
        onBack={() => window.history.back()}
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
};

const saveChatMessage = (message: Message) => {
  try {
    const savedMessages = localStorage.getItem('chat_messages');
    const messages = savedMessages ? JSON.parse(savedMessages) : [];
    messages.push(message);
    localStorage.setItem('chat_messages', JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving message:', error);
  }
};