import { useRef, useEffect } from 'react';
import { AudioMessage } from './AudioMessage';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  audioUrl?: string;
  transcription?: string;
}

interface ChatMessagesProps {
  messages: Message[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
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
  );
}