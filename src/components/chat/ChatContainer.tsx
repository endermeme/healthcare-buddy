import { useState, useRef, useEffect } from 'react';
import { ChatInput } from './ChatInput';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X } from "lucide-react";
import { toast } from 'sonner';
import { getChatResponse, textToSpeech } from '@/services/aiService';
import { saveChatMessage } from '@/services/healthData';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  audioUrl?: string;
  transcription?: string;
}

interface ChatContainerProps {
  onBack: () => void;
}

export function ChatContainer({ onBack }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('chat_messages') || '[]');
    } catch {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(() => {
    return localStorage.getItem('tts_enabled') === 'true';
  });
  
  const [showServerError, setShowServerError] = useState(false);
  const processingMessageRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    localStorage.setItem('chat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('tts_enabled', ttsEnabled.toString());
  }, [ttsEnabled]);

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem('chat_messages');
  };

  const playTTS = async (messageId: string, text: string) => {
    try {
      const audioBlob = await textToSpeech(text, messageId);
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
    if (isLoading || processingMessageRef.current === text) return;

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
    saveChatMessage(userMessage);

    try {
      const response = await getChatResponse(text, metadata);
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: response,
        isUser: false,
      };
      
      setMessages(prev => [...prev, aiMessage]);
      saveChatMessage(aiMessage);
      setShowServerError(false);

      if (ttsEnabled) {
        playTTS(aiMessage.id, aiMessage.text);
      }
    } catch (error: any) {
      console.error('API Error:', error);
      setShowServerError(true);
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau");
    } finally {
      setIsLoading(false);
      processingMessageRef.current = null;
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-white">
      {showServerError && (
        <Alert variant="destructive" className="fixed top-0 left-0 right-0 z-50 rounded-none flex items-center justify-between py-1.5">
          <span className="text-sm font-medium">Lỗi kết nối máy chủ</span>
          <button 
            onClick={() => setShowServerError(false)}
            className="p-1 hover:bg-destructive/10 rounded-full"
          >
            <X className="h-3 w-3" />
          </button>
        </Alert>
      )}
      
      <ChatHeader 
        onBack={onBack}
        onClearChat={handleClearChat}
        onTtsToggle={setTtsEnabled}
        ttsEnabled={ttsEnabled}
      />
      
      <ChatMessages messages={messages} />

      <ChatInput 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading}
      />

      <audio ref={audioRef} className="hidden" />
    </div>
  );
}