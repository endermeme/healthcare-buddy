import { useRef, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

interface UseAudioRecordingProps {
  onTranscriptionComplete: (audioUrl: string, transcription: string) => void;
}

export const useAudioRecording = ({ onTranscriptionComplete }: UseAudioRecordingProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const duration = Date.now() - startTimeRef.current;
        
        // Check if recording is less than 1 second
        if (duration < 1000) {
          toast({
            variant: "destructive",
            title: "Ghi âm quá ngắn",
            description: "Vui lòng ghi âm ít nhất 1 giây.",
          });
          return;
        }

        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        try {
          const formData = new FormData();
          formData.append('file', audioBlob, 'audio.wav');

          const response = await axios.post(
            'http://service.aigate.app/v1/audio-to-text',
            formData,
            {
              headers: {
                'Authorization': 'Bearer app-sVzMPqGDTYKCkCJCQToMs4G2',
                'Content-Type': 'multipart/form-data',
                'Accept-Language': 'vi',
              },
            }
          );

          if (response.data.text) {
            onTranscriptionComplete(audioUrl, response.data.text);
          }
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Lỗi",
            description: "Không thể chuyển đổi âm thanh thành văn bản. Vui lòng thử lại.",
          });
        }
      };

      mediaRecorder.start();
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
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording
  };
};