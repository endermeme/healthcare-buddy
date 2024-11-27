import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Mic, MicOff, ImagePlus } from 'lucide-react';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { loadLogs } from '@/services/healthData';
import { toast } from '@/components/ui/use-toast';

interface ChatInputProps {
  onSendMessage: (text: string, audioUrl?: string, transcription?: string, metadata?: object) => void;
  isLoading: boolean;
  selectedLogIds?: string[];
}

export const ChatInput = ({ onSendMessage, isLoading, selectedLogIds }: ChatInputProps) => {
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

  const getValidReadingsFromSelectedLogs = () => {
    if (!selectedLogIds?.length) return { heartRates: '', oxygenLevels: '', timestamps: [] };

    const logs = loadLogs();
    const selectedLogs = logs.filter(log => selectedLogIds.includes(log.hour));
    
    if (!selectedLogs.length) return { heartRates: '', oxygenLevels: '', timestamps: [] };

    const allValidReadings = selectedLogs.flatMap(log => 
      log.secondsData.filter(data => 
        data.heartRate > 30 && 
        data.heartRate < 200 && 
        data.bloodOxygen >= 85 && 
        data.bloodOxygen <= 100
      )
    );

    // Sắp xếp theo thời gian
    allValidReadings.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return {
      heartRates: allValidReadings.map(data => data.heartRate.toFixed(1)).join(' '),
      oxygenLevels: allValidReadings.map(data => data.bloodOxygen.toFixed(1)).join(' '),
      timestamps: allValidReadings.map(data => new Date(data.timestamp).toISOString())
    };
  };

  const getMetadataFromProfile = () => {
    if (!profileData) return {};
    
    const { heartRates, oxygenLevels, timestamps } = getValidReadingsFromSelectedLogs();
    
    return {
      nhiptim: heartRates || '',
      oxy: oxygenLevels || '',
      tuoi: profileData.age?.toString() || '',
      cannang: profileData.weight?.toString() || '',
      tiensubenh: profileData.medicalHistory || '',
      gioitinh: profileData.gender || '',
      chieucao: profileData.height?.toString() || '',
      huyetap: profileData.bloodPressure || '',
      duonghuyet: profileData.bloodSugar || '',
      cholesterol: profileData.cholesterol || '',
      thuocdieutri: profileData.medications || '',
      dichung: profileData.allergies || '',
      thoigian: timestamps || []
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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
      <div className="max-w-3xl mx-auto p-4">
        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              type="button"
            >
              <ImagePlus className="h-4 w-4" />
            </Button>
          </label>
          
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2">
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
              className="h-8 w-8 p-0"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>

          <Button
            variant="outline"
            size="icon"
            className={`h-14 w-14 rounded-full ${isRecording ? 'bg-red-100 text-red-500' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};