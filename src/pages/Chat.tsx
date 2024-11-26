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
      const response = await axios.post('http://service.aigate.app/v1/chat/completions', {
        query: text,
        ...metadata
      }, {
        headers: {
          'Authorization': 'Bearer app-sVzMPqGDTYKCkCJCQToMs4G2',
          'Content-Type': 'application/json'
        }
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

    } catch (error) {
      console.error('API Error:', error);
      toast.error("Có lỗi xảy ra khi gửi tin nhắn");
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