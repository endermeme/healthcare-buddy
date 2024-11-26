import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Mic, MicOff } from 'lucide-react';
import { useAudioRecording } from '@/hooks/useAudioRecording';

interface ChatInputProps {
  onSendMessage: (text: string, audioUrl?: string, transcription?: string) => void;
  isLoading: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [inputMessage, setInputMessage] = useState('');
  
  const handleTranscriptionComplete = (audioUrl: string, transcription: string) => {
    onSendMessage(transcription, audioUrl, transcription);
    setInputMessage('');
  };

  const { isRecording, startRecording, stopRecording } = useAudioRecording({
    onTranscriptionComplete: handleTranscriptionComplete
  });

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t">
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className={`rounded-full w-12 h-12 ${isRecording ? 'bg-red-100 text-red-500' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            placeholder="Nhập câu hỏi của bạn..."
            className="flex-1 p-3 border rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isLoading || isRecording}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={isLoading || isRecording}
            size="icon"
            className="rounded-full w-12 h-12"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};