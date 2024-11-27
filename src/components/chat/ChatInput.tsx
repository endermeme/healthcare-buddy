import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Mic, MicOff, Trash2, ImagePlus } from 'lucide-react';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { loadLogs } from '@/services/healthData';
import { toast } from '@/components/ui/use-toast';

interface ChatInputProps {
  onSendMessage: (text: string, audioUrl?: string, transcription?: string, metadata?: object) => void;
  isLoading: boolean;
  onClearChat: () => void;
}

export const ChatInput = ({ onSendMessage, isLoading, onClearChat }: ChatInputProps) => {
  const [inputMessage, setInputMessage] = useState('');
  const [profileData, setProfileData] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
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

  const getValidReadingsFromLog = () => {
    const logs = loadLogs();
    const validReadings = logs.flatMap(log => 
      log.secondsData.filter(data => 
        data.heartRate > 30 && 
        data.heartRate < 200 && 
        data.bloodOxygen >= 85 && 
        data.bloodOxygen <= 100
      )
    );

    return {
      heartRates: validReadings.map(data => data.heartRate.toFixed(1)).join(' '),
      oxygenLevels: validReadings.map(data => data.bloodOxygen.toFixed(1)).join(' ')
    };
  };

  const getMetadataFromProfile = () => {
    if (!profileData) return {};
    
    const { heartRates, oxygenLevels } = getValidReadingsFromLog();
    
    return {
      nhiptim: heartRates || '90 90 90 90 90',
      oxy: oxygenLevels || '98 98 98 98 98',
      tuoi: profileData.age?.toString() || '',
      cannang: profileData.weight?.toString() || '',
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

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Lỗi",
          description: "Kích thước ảnh không được vượt quá 5MB",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
    }
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 bg-white border-t p-2">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col gap-1">
          <div className="flex justify-end gap-1 px-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onClearChat}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                type="button"
              >
                <ImagePlus className="h-3 w-3" />
              </Button>
            </label>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full w-8 h-8 flex-shrink-0 ${isRecording ? 'bg-red-100 text-red-500' : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            
            <div className="flex-1 flex items-center gap-1 bg-gray-50 rounded-full px-3 py-1">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 bg-transparent border-none focus:outline-none text-sm"
                disabled={isLoading || isRecording}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={isLoading || isRecording}
                size="icon"
                variant="ghost"
                className="h-6 w-6 p-0"
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};