import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Mic, Square } from 'lucide-react';
import RecordRTC from 'recordrtc';
import { useToast } from '@/components/ui/use-toast';

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  onSendAudio: (blob: Blob) => Promise<void>;
  isLoading: boolean;
}

export const ChatInput = ({ onSendMessage, onSendAudio, isLoading }: ChatInputProps) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recorder = useRef<RecordRTC | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorder.current = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/webm',
        recorderType: RecordRTC.StereoAudioRecorder,
      });
      recorder.current.startRecording();
      setIsRecording(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.",
      });
    }
  };

  const stopRecording = () => {
    if (recorder.current) {
      recorder.current.stopRecording(() => {
        const blob = recorder.current?.getBlob();
        if (blob) {
          onSendAudio(blob);
        }
      });
      setIsRecording(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    onSendMessage(inputMessage);
    setInputMessage('');
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 p-2 rounded-full bg-gray-50 border">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              placeholder="Nhập câu hỏi của bạn..."
              className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={isLoading}
              size="icon"
              variant="ghost"
              className="shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            size="icon"
            variant={isRecording ? "destructive" : "secondary"}
            className="rounded-full"
          >
            {isRecording ? (
              <Square className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};