import { useRef, useEffect } from 'react';
import { AudioMessage } from './AudioMessage';
import ReactMarkdown from 'react-markdown';

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
            className={`inline-block ${
              message.isUser 
                ? 'max-w-[80%] bg-primary text-white' 
                : 'max-w-[90%] bg-gray-100'
            } p-3 rounded-lg`}
          >
            {message.audioUrl ? (
              <AudioMessage
                audioUrl={message.audioUrl}
                transcription={message.transcription}
              />
            ) : (
              <div className={`prose ${message.isUser ? 'prose-invert' : ''} max-w-none`}>
                <ReactMarkdown>
                  {message.text}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}