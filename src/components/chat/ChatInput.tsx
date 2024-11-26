import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Mic, MicOff } from 'lucide-react';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { loadLogs } from '@/services/healthData';

interface ChatInputProps {
  onSendMessage: (text: string, audioUrl?: string, transcription?: string, metadata?: object) => void;
  isLoading: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [inputMessage, setInputMessage] = useState('');
  const [profileData, setProfileData] = useState<any>(null);
  
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    }
  }, []);

  const handleTranscriptionComplete = (audioUrl: string, transcription: string) => {
    const metadata = getMetadataFromProfile();
    onSendMessage(transcription, audioUrl, transcription, metadata);
    setInputMessage('');
  };

  const { isRecording, startRecording, stopRecording } = useAudioRecording({
    onTranscriptionComplete: handleTranscriptionComplete
  });

  const getMetadataFromProfile = () => {
    if (!profileData) return {};
    
    // Lấy dữ liệu nhịp tim và oxy từ lịch sử ghi
    const logs = loadLogs();
    const latestLog = logs[logs.length - 1];
    const latestData = latestLog?.secondsData[latestLog.secondsData.length - 1];
    
    return {
      nhiptim: latestData?.heartRate || '',
      oxy: latestData?.bloodOxygen || '',
      tuoi: profileData.age || '',
      cannang: profileData.weight || '',
      tiensubenh: profileData.medicalHistory || '',
      gioitinh: profileData.gender || '',
    };
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const metadata = getMetadataFromProfile();
      onSendMessage(inputMessage, undefined, undefined, metadata);
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