import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Mic, Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SetupWizard } from '@/components/SetupWizard';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { AudioMessage } from '@/components/chat/AudioMessage';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';
import { loadLogs, HourlyLog } from '@/services/healthData';
import RecordRTC from 'recordrtc';

interface Message {
  type: 'user' | 'bot';
  content: string;
  audioUrl?: string;
}

const Chat = () => {
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [selectedLogData, setSelectedLogData] = useState<{
    heartRates: number[];
    oxygenLevels: number[];
  } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recorder = useRef<RecordRTC | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasCompletedSetup = localStorage.getItem('hasCompletedSetup');
    if (!hasCompletedSetup) {
      setShowSetupWizard(true);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const processLogData = (log: HourlyLog) => {
    const validData = log.secondsData.filter(data => 
      data.heartRate > 0 && 
      data.heartRate < 300 &&
      data.bloodOxygen > 0 &&
      data.bloodOxygen <= 100
    );

    return {
      heartRates: validData.map(d => d.heartRate),
      oxygenLevels: validData.map(d => d.bloodOxygen)
    };
  };

  const handleLogSelect = (logId: string) => {
    const logs = loadLogs();
    const selectedLog = logs.find(log => log.hour === logId);
    
    if (selectedLog) {
      const processedData = processLogData(selectedLog);
      setSelectedLogId(logId);
      setSelectedLogData(processedData);
    }
  };

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
          sendAudioMessage(blob);
        }
      });
      setIsRecording(false);
    }
  };

  const sendAudioMessage = async (audioBlob: Blob) => {
    if (!selectedLogData) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng chọn bản ghi trước khi hỏi về chỉ số.",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Create FormData for the audio file
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      // First, send audio to Dify for speech-to-text
      const speechResponse = await axios.post('http://service.aigate.app/v1/speech-to-text', formData, {
        headers: {
          'Authorization': 'Bearer app-sVzMPqGDTYKCkCJCQToMs4G2',
          'Content-Type': 'multipart/form-data',
        },
      });

      if (speechResponse.data.text) {
        const audioUrl = URL.createObjectURL(audioBlob);
        setMessages(prev => [...prev, { 
          type: 'user', 
          content: speechResponse.data.text,
          audioUrl 
        }]);

        // Then send the transcribed text to chat endpoint
        const response = await axios.post('http://service.aigate.app/v1/chat-messages', {
          inputs: {
            nhiptim: selectedLogData.heartRates.join(' '),
            oxy: selectedLogData.oxygenLevels.join(' ')
          },
          query: speechResponse.data.text,
          response_mode: "blocking",
          conversation_id: "",
          user: "abc-123"
        }, {
          headers: {
            'Authorization': 'Bearer app-sVzMPqGDTYKCkCJCQToMs4G2',
            'Content-Type': 'application/json'
          }
        });

        if (response.data.answer) {
          setMessages(prev => [...prev, { type: 'bot', content: response.data.answer }]);
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xử lý tin nhắn âm thanh. Vui lòng thử lại sau.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    if (!selectedLogData) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng chọn bản ghi trước khi hỏi về chỉ số.",
      });
      return;
    }

    try {
      setIsLoading(true);
      setMessages(prev => [...prev, { type: 'user', content: inputMessage }]);
      
      const response = await axios.post('http://service.aigate.app/v1/chat-messages', {
        inputs: {
          nhiptim: selectedLogData.heartRates.join(' '),
          oxy: selectedLogData.oxygenLevels.join(' ')
        },
        query: inputMessage,
        response_mode: "blocking",
        conversation_id: "",
        user: "abc-123"
      }, {
        headers: {
          'Authorization': 'Bearer app-sVzMPqGDTYKCkCJCQToMs4G2',
          'Content-Type': 'application/json'
        }
      });

      if (response.data.answer) {
        setMessages(prev => [...prev, { type: 'bot', content: response.data.answer }]);
      }
      setInputMessage('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể gửi tin nhắn. Vui lòng thử lại sau.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <ChatHeader 
        onBack={() => navigate('/')}
        selectedLogId={selectedLogId}
        onLogSelect={handleLogSelect}
      />

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
          <div ref={messagesEndRef} />
        </div>
      </main>

      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 p-2 rounded-full bg-gray-50 border">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2"
                disabled={isLoading}
              />
              <Button 
                onClick={sendMessage}
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

      {showSetupWizard && (
        <SetupWizard onClose={() => {
          setShowSetupWizard(false);
          localStorage.setItem('hasCompletedSetup', 'true');
        }} />
      )}
    </div>
  );
};

export default Chat;