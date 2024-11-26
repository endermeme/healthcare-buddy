import { AudioMessage } from './AudioMessage';

interface Message {
  type: 'user' | 'bot';
  content: string;
  audioUrl?: string;
}

interface MessageListProps {
  messages: Message[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  return (
    <main className="flex-1 overflow-y-auto p-4 pb-20">
      <div className="max-w-3xl mx-auto space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p>Xin chào! Tôi có thể giúp gì cho bạn?</p>
            <p className="text-sm mt-2">Hãy chọn một bản ghi và đặt câu hỏi về các chỉ số sức khỏe của bạn.</p>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`p-4 rounded-2xl max-w-[80%] ${
                message.type === 'user'
                  ? 'bg-primary text-white ml-auto'
                  : 'bg-white shadow-sm'
              }`}
            >
              {message.audioUrl && (
                <AudioMessage audioUrl={message.audioUrl} />
              )}
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};