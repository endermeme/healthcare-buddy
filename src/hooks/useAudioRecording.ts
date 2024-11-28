import { useRef, useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import axios from 'axios';

interface UseAudioRecordingProps {
  onTranscriptionComplete: (audioUrl: string, transcription: string) => void;
}

export const useAudioRecording = ({ onTranscriptionComplete }: UseAudioRecordingProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  const showToast = useCallback((title: string, description: string, variant: "default" | "destructive" = "destructive") => {
    toast({
      variant,
      title,
      description,
    });
  }, []);

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
        
        if (duration < 1000) {
          showToast(
            "Ghi âm quá ngắn",
            "Vui lòng ghi âm ít nhất 1 giây."
          );
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
          showToast(
            "Lỗi",
            "Không thể chuyển đổi âm thanh thành văn bản. Vui lòng thử lại."
          );
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      showToast(
        "Lỗi",
        "Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập."
      );
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  }, [isRecording]);

  return {
    isRecording,
    startRecording,
    stopRecording
  };
};