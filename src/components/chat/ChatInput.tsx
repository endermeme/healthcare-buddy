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

  const getMetadataFromProfile = () => {
    if (!profileData) return {};
    
    const logs = loadLogs();
    const allData = logs.flatMap(log => log.secondsData);
    
    // Lấy tất cả dữ liệu hợp lệ và nối thành chuỗi
    const heartRates = allData
      .map(data => data.heartRate)
      .filter(rate => rate > 0)
      .join(' ');

    const oxygenLevels = allData
      .map(data => data.bloodOxygen)
      .filter(level => level > 0)
      .join(' ');
    
    return {
      nhiptim: heartRates || '90 90 90 90 90', // Fallback nếu không có dữ liệu
      oxy: oxygenLevels || '98 98 98 98 98', // Fallback nếu không có dữ liệu
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
      // Handle image upload logic here
    }
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col gap-2">
          {/* Utility buttons row */}
          <div className="flex justify-end gap-2 px-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={onClearChat}
            >
              <Trash2 className="h-4 w-4" />
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
                className="h-8"
                type="button"
              >
                <ImagePlus className="h-4 w-4" />
              </Button>
            </label>
          </div>
          
          {/* Main input row */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full w-12 h-12 flex-shrink-0 ${isRecording ? 'bg-red-100 text-red-500' : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
            
            <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 bg-transparent border-none focus:outline-none"
                disabled={isLoading || isRecording}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={isLoading || isRecording}
                size="icon"
                variant="ghost"
                className="h-8 w-8"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};