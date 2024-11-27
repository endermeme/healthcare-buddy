import { useState, useRef, useEffect } from 'react';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { toast } from 'sonner';
import { saveChatMessage } from '@/services/healthData';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X } from "lucide-react";

const SELECTED_LOGS_KEY = 'selected_chat_logs';
const TTS_ENABLED_KEY = 'tts_enabled';

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
  
  const [ttsEnabled, setTtsEnabled] = useState(() => {
    try {
      return localStorage.getItem(TTS_ENABLED_KEY) === 'true';
    } catch {
      return false;
    }
  });
  
  const [showServerError, setShowServerError] = useState(false);
  const navigate = useNavigate();
  const processingMessageRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

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

  useEffect(() => {
    localStorage.setItem(TTS_ENABLED_KEY, ttsEnabled.toString());
  }, [ttsEnabled]);

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem('chat_messages');
  };

  const playTTS = async (messageId: string, text: string) => {
    try {
      const response = await axios({
        method: 'post',
        url: 'http://service.aigate.app/v1/text-to-audio',
        headers: {
          'Authorization': 'Bearer app-sVzMPqGDTYKCkCJCQToMs4G2',
        },
        data: {
          message_id: messageId,
          text: text,
          user: "abc-123"
        },
        responseType: 'blob'
      });

      const audioBlob = new Blob([response.data], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }
    } catch (error) {
      console.error('TTS Error:', error);
      toast.error('Không thể chuyển đổi văn bản thành giọng nói');
    }
  };

  const handleSendMessage = async (text: string, audioUrl?: string, transcription?: string, metadata?: any) => {
    if (isLoading || processingMessageRef.current === text) {
      return;
    }

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
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    saveChatMessage(userMessage);

    try {
      const response = await axios({
        method: 'post',
        url: 'http://service.aigate.app/v1/chat-messages',
        headers: {
          'Authorization': 'Bearer app-sVzMPqGDTYKCkCJCQToMs4G2',
          'Content-Type': 'application/json'
        },
        data: {
          inputs: metadata,
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
        
        setMessages(prevMessages => [...prevMessages, aiMessage]);
        saveChatMessage(aiMessage);
        setShowServerError(false);

        // Automatically play TTS if enabled
        if (ttsEnabled) {
          playTTS(aiMessage.id, aiMessage.text);
        }
      } else {
        throw new Error('Invalid or empty response from server');
      }

    } catch (error: any) {
      console.error('API Error:', error);
      setShowServerError(true);
      
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
      {showServerError && (
        <Alert variant="destructive" className="fixed top-0 left-0 right-0 z-50 rounded-none flex items-center justify-between py-1.5">
          <span className="text-sm font-medium">Không tìm thấy cảm biến</span>
          <button 
            onClick={() => setShowServerError(false)}
            className="p-1 hover:bg-destructive/10 rounded-full"
          >
            <X className="h-3 w-3" />
          </button>
        </Alert>
      )}
      
      <ChatHeader 
        onBack={handleBack}
        onClearChat={handleClearChat}
        onTtsToggle={setTtsEnabled}
        ttsEnabled={ttsEnabled}
      />
      
      <ChatMessages messages={messages} />

      <ChatInput 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading}
        selectedLogIds={selectedLogIds}
      />

      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
