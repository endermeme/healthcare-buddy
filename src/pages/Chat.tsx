import { useState } from 'react';
import { ChatInput } from '@/components/chat/ChatInput';
import { AudioMessage } from '@/components/chat/AudioMessage';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { toast } from 'sonner';
import { saveChatMessage } from '@/services/healthData';

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

      // Prepare API request with metadata
      const requestBody = {
        query: text,
        ...metadata
      };

      // Call your API here with requestBody
      // const response = await yourApiCall(requestBody);
      
      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Đây là phản hồi mẫu. Hãy thay thế bằng phản hồi thực từ API.",
        isUser: false,
      };
      
      setMessages(prev => [...prev, aiMessage]);
      saveChatMessage(aiMessage);

    } catch (error) {
      toast.error("Có lỗi xảy ra khi gửi tin nhắn");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen pb-16">
      <ChatHeader />
      
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